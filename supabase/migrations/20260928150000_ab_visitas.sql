-- Teste A/B das landing pages: /ads divide o tráfego entre /adsa e /adsb.
-- Cada página registra uma visita (visitante = id anônimo do navegador).
-- As conversões vêm de leads.pagina. Mesmo padrão das Tarefas: RLS ligado
-- sem policies, acesso só pela service_role nas rotas do servidor.
create table if not exists public.ab_visitas (
  id uuid primary key default gen_random_uuid(),
  teste text not null default 'ads',
  variante text not null check (variante in ('a', 'b')),
  visitante text not null,
  via_split boolean not null default false,
  utm_source text,
  utm_campaign text,
  utm_content text,
  criado_em timestamptz not null default now()
);
create index if not exists ab_visitas_teste_criado_idx on public.ab_visitas (teste, criado_em);
alter table public.ab_visitas enable row level security;

-- Visitantes únicos por variante (o select direto pararia em 1000 linhas).
create or replace function public.ab_resumo(p_teste text, p_desde timestamptz, p_campanha text)
returns table (variante text, visitantes bigint, visitas bigint)
language sql stable security definer set search_path = public as $$
  select variante, count(distinct visitante), count(*)
  from public.ab_visitas
  where teste = p_teste
    and criado_em >= p_desde
    and (p_campanha is null or utm_campaign = p_campanha)
  group by variante
$$;

create or replace function public.ab_campanhas(p_teste text)
returns table (campanha text, visitantes bigint)
language sql stable security definer set search_path = public as $$
  select utm_campaign, count(distinct visitante)
  from public.ab_visitas
  where teste = p_teste and utm_campaign is not null
  group by utm_campaign
  order by 2 desc
$$;

revoke all on function public.ab_resumo(text, timestamptz, text) from public, anon, authenticated;
revoke all on function public.ab_campanhas(text) from public, anon, authenticated;
grant execute on function public.ab_resumo(text, timestamptz, text) to service_role;
grant execute on function public.ab_campanhas(text) to service_role;
