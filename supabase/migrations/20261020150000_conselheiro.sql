-- Conselheiro de vendas (chat em /crm/conselheiro, via API do Gemini).
--
-- As instruções (a base de conhecimento) ficam só no banco: o repo é público.
-- Linha única. modelo = id do modelo do Gemini usado pela rota.

CREATE TABLE public.conselheiro_config (
  id          int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  instrucoes  text NOT NULL DEFAULT '',
  modelo      text NOT NULL DEFAULT 'gemini-2.5-flash',
  updated_at  timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.conselheiro_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.conselheiro_config ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.conselheiro_config TO service_role;
