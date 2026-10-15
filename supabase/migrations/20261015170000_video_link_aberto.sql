-- Link aberto: um link só para muitas pessoas (vídeo genérico de proposta).
-- Como o link não diz quem é, a página pede nome e WhatsApp antes do play e
-- a visita guarda essa identificação, ligada ao lead quando o número bate.
alter table public.video_links add column if not exists aberto boolean not null default false;

alter table public.video_sessoes add column if not exists nome text;
alter table public.video_sessoes add column if not exists whatsapp text;
alter table public.video_sessoes add column if not exists lead_id uuid references public.leads(id) on delete set null;
create index if not exists video_sessoes_lead_idx on public.video_sessoes (lead_id);

-- Lead pelo WhatsApp: compara os 8 últimos dígitos (pega número com ou sem 55
-- e com ou sem o 9 na frente). Mais recente primeiro.
create or replace function public.lead_por_whatsapp(p_whatsapp text)
returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.leads
  where length(regexp_replace(p_whatsapp, '\D', '', 'g')) >= 10
    and right(regexp_replace(coalesce(whatsapp, ''), '\D', '', 'g'), 8)
      = right(regexp_replace(p_whatsapp, '\D', '', 'g'), 8)
  order by criado_em desc
  limit 1
$$;

revoke all on function public.lead_por_whatsapp(text) from public, anon, authenticated;
grant execute on function public.lead_por_whatsapp(text) to service_role;
