-- Follow-up das 8h mais robusto. Em 19/10 o cron disparou mas o resumo não
-- saiu: o pg_net corta a chamada em 5s por padrão e a rota (que lê todas as
-- conversas na Evolution e envia a imagem) já levava perto disso.
--   - timeout de 60s na chamada;
--   - mais duas tentativas, às 8h15 e 8h30. A rota não reenvia se o resumo do
--     dia já saiu (followup_resumos), então ninguém recebe em dobro.

select cron.unschedule('followup-resumo')
where exists (select 1 from cron.job where jobname = 'followup-resumo');

select cron.schedule(
  'followup-resumo',
  '0,15,30 11 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://legacybc.com.br/api/public/whatsapp/followup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-token', (SELECT cron_token::text FROM public.whatsapp_config WHERE id = 1)
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  )
  WHERE (SELECT followup_resumo_ativo FROM public.whatsapp_config WHERE id = 1)
    AND NOT EXISTS (
      SELECT 1 FROM public.followup_resumos
      WHERE data = (now() AT TIME ZONE 'America/Sao_Paulo')::date
    );
  $$
);
