
-- Remove permissive public policies
DROP POLICY IF EXISTS "leads_all_access" ON public.leads;
DROP POLICY IF EXISTS "historico_all_access" ON public.historico_movimentacoes;

-- Revoke public/anon/authenticated direct access
REVOKE ALL ON public.leads FROM anon, authenticated, PUBLIC;
REVOKE ALL ON public.historico_movimentacoes FROM anon, authenticated, PUBLIC;

-- Service role keeps full access (used by server routes)
GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.historico_movimentacoes TO service_role;

-- Keep RLS enabled; no policies = no access for non-service roles
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_movimentacoes ENABLE ROW LEVEL SECURITY;
