-- Formulário SPICED da página /identidade: respostas, urgência declarada e se o
-- negócio está fora do recorte, num JSON só (formato em src/lib/identidade.ts).
-- Vazio nos outros leads.
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS qualificacao jsonb;
