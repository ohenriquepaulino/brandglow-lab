-- Propostas avulsas com link próprio (ex.: /propostadra). O conteúdo editável
-- fica em "data" (jsonb); a página mistura com os padrões do código.
create table if not exists public.custom_proposals (
  slug text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Só o servidor (service role) lê e grava; nenhum acesso direto pelo navegador.
alter table public.custom_proposals enable row level security;