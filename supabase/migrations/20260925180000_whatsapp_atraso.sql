-- WhatsApp de boas-vindas com atraso (padrão 30s).
--
-- O cadastro não espera: grava o envio como 'pendente' com enviar_em no
-- futuro, e um pg_cron a cada 10s chama /api/public/whatsapp/process quando
-- há algo vencido. Atraso real = atraso_segundos + até ~10s.
--
-- cron_token: senha do cron para chamar a rota. Gerada aqui, lida pelo job no
-- momento da chamada e conferida pela rota — nenhum secret manual no Lovable.

ALTER TABLE public.whatsapp_config
  ADD COLUMN atraso_segundos int NOT NULL DEFAULT 30 CHECK (atraso_segundos BETWEEN 0 AND 3600),
  ADD COLUMN cron_token uuid NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE public.whatsapp_envios
  ADD COLUMN enviar_em timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.whatsapp_envios DROP CONSTRAINT whatsapp_envios_status_check;
ALTER TABLE public.whatsapp_envios
  ADD CONSTRAINT whatsapp_envios_status_check
  CHECK (status IN ('pendente', 'enviando', 'enviado', 'erro'));

CREATE INDEX idx_whatsapp_envios_fila
  ON public.whatsapp_envios(enviar_em) WHERE status = 'pendente';

-- Só faz a chamada HTTP quando há envio vencido: nos outros ciclos é uma
-- leitura de índice e nada mais.
-- Reverter: SELECT cron.unschedule('whatsapp-boas-vindas');
SELECT cron.schedule(
  'whatsapp-boas-vindas',
  '10 seconds',
  $$
  SELECT net.http_post(
    url := 'https://legacybc.com.br/api/public/whatsapp/process',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-token', (SELECT cron_token::text FROM public.whatsapp_config WHERE id = 1)
    ),
    body := '{}'::jsonb
  )
  WHERE EXISTS (
    SELECT 1 FROM public.whatsapp_envios
    WHERE status = 'pendente' AND enviar_em <= now()
  );
  $$
);
