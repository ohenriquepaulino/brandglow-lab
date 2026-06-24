
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  whatsapp text NOT NULL,
  instagram text NOT NULL,
  faturamento text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  coluna text NOT NULL DEFAULT 'novo-lead',
  anotacoes text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.historico_movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  coluna_origem text NOT NULL,
  coluna_destino text NOT NULL,
  movido_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_coluna ON public.leads(coluna);
CREATE INDEX idx_historico_lead ON public.historico_movimentacoes(lead_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.historico_movimentacoes TO anon, authenticated;
GRANT ALL ON public.historico_movimentacoes TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_movimentacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_all_access" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "historico_all_access" ON public.historico_movimentacoes FOR ALL USING (true) WITH CHECK (true);
