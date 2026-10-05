-- Cases escolhidos para cada proposta, na ordem em que aparecem.
-- Nulo = todos os cases, na ordem padrão (DEFAULT_CASE_ORDER).
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS case_slugs text[]
    CHECK (case_slugs IS NULL OR cardinality(case_slugs) BETWEEN 1 AND 20);
