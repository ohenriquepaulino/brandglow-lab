-- Leads: de qual página veio (teste A/B /ads x /adsb) e, para quem ainda não
-- fatura, o momento do negócio e se já tem verba para a marca.
alter table public.leads add column if not exists pagina text;
alter table public.leads add column if not exists momento_negocio text;
alter table public.leads add column if not exists verba_marca text;
