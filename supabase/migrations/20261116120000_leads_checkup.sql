-- Diagnóstico de marca (/checkup): respostas, ponto mais fraco e tamanho do
-- abismo, num JSON só (formato em src/lib/checkup.ts). Vazio nos outros leads.

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS checkup jsonb;
