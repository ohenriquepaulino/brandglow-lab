-- Follow-up: quem precisa de atenção no WhatsApp. O botão "Ver follow-ups" do
-- Kanban (e o resumo das 8h no grupo) lê na Evolution a última mensagem de
-- cada conversa e grava aqui uma tag por lead:
--   responder — o lead falou por último, há 2h ou mais (e menos de 5 dias);
--   cobrar    — nós falamos por último, há 2 dias ou mais (e menos de 5);
--   puxar     — ninguém fala há 5 dias ou mais, seja quem for o último.
-- A leitura substitui a anterior inteira. Mesmo padrão das outras tabelas do
-- CRM: RLS ligado sem policies, acesso só pela service_role.

create table if not exists public.followup_leads (
  lead_id uuid primary key references public.leads(id) on delete cascade,
  tipo text not null check (tipo in ('responder', 'cobrar', 'puxar')),
  ultima_msg_em timestamptz not null,
  ultima_de text not null check (ultima_de in ('lead', 'nos')),
  lido_em timestamptz not null default now()
);
alter table public.followup_leads enable row level security;

-- Um resumo por dia. `itens` guarda a lista enviada, para o resumo seguinte
-- contar quantas daquelas conversas andaram.
create table if not exists public.followup_resumos (
  data date primary key,
  enviado_em timestamptz not null default now(),
  itens jsonb not null default '[]'
);
alter table public.followup_resumos enable row level security;

alter table public.whatsapp_config
  add column if not exists followup_lido_em timestamptz,
  add column if not exists followup_resumo_ativo boolean not null default true;

-- 8h de Brasília (11h UTC), de segunda a sexta. A rota não reenvia se o
-- resumo do dia já saiu.
select cron.unschedule('followup-resumo')
where exists (select 1 from cron.job where jobname = 'followup-resumo');

select cron.schedule(
  'followup-resumo',
  '0 11 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://legacybc.com.br/api/public/whatsapp/followup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-token', (SELECT cron_token::text FROM public.whatsapp_config WHERE id = 1)
    ),
    body := '{}'::jsonb
  )
  WHERE (SELECT followup_resumo_ativo FROM public.whatsapp_config WHERE id = 1);
  $$
);
