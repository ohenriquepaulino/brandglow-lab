-- Produto da proposta: define qual modelo o link /p/:slug renderiza.
-- 'estrategia' = Estratégia de Marca e Identidade Visual (modelo original, slides 1920x1080).
-- 'direcao'    = Direção de Marca Legacy (modelo curto, mobile first).
-- As propostas existentes recebem 'estrategia' e continuam idênticas.

ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS product text NOT NULL DEFAULT 'estrategia'
    CHECK (product IN ('estrategia', 'direcao'));
