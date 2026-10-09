-- Novo produto: 'so_estrategia' = Estratégia de Marca (só estratégia, sem identidade visual).
ALTER TABLE public.proposals DROP CONSTRAINT IF EXISTS proposals_product_check;
ALTER TABLE public.proposals
  ADD CONSTRAINT proposals_product_check
    CHECK (product IN ('estrategia', 'direcao', 'so_estrategia'));
