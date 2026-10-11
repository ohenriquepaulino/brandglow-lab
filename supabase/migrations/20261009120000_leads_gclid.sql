-- Clique do Google Ads (gclid) do lead, para importar conversões offline
-- (lead que virou Ganho, com o valor fechado) de volta no Google Ads.
alter table public.leads add column if not exists gclid text;
