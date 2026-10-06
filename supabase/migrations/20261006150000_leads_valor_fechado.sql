-- Ganho com valor: ao mover um lead para "Ganho" o CRM pede o valor fechado.
-- ganho_em marca quando entrou em Ganho (base do dashboard); sair de Ganho
-- limpa os dois.
alter table public.leads
  add column if not exists valor_fechado numeric(12, 2) check (valor_fechado is null or valor_fechado >= 0),
  add column if not exists ganho_em timestamptz;
