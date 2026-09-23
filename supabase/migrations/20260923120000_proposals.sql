-- Feature: propostas comerciais do CRM, uma por cliente, com link /p/:slug.
-- Segue o mesmo padrão de segurança de `leads` e `tasks`:
-- RLS habilitada, sem policies, acesso só via service_role (usado pelos server routes
-- /api/public/crm/proposals, protegido pelo CRM_API_TOKEN, e /api/public/proposta,
-- que devolve só os campos públicos de uma proposta pelo slug).

CREATE TABLE public.proposals (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 text NOT NULL UNIQUE
                         CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) BETWEEN 3 AND 80),

  client_name          text NOT NULL DEFAULT '' CHECK (char_length(client_name) <= 120),
  cover_label          text NOT NULL DEFAULT 'Proposta de Estratégia de Marca' CHECK (char_length(cover_label) <= 120),

  show_diagnosis       boolean NOT NULL DEFAULT true,
  diagnosis_moment     text CHECK (char_length(diagnosis_moment) <= 400),
  diagnosis_challenge  text CHECK (char_length(diagnosis_challenge) <= 400),
  diagnosis_goal       text CHECK (char_length(diagnosis_goal) <= 400),

  price_total          numeric(12,2) NOT NULL DEFAULT 8000 CHECK (price_total >= 0),
  installments         integer NOT NULL DEFAULT 2 CHECK (installments BETWEEN 1 AND 12),
  installments_note    text NOT NULL DEFAULT '50% na contratação e 50% na entrega' CHECK (char_length(installments_note) <= 160),
  cash_discount_pct    numeric(5,2) NOT NULL DEFAULT 10 CHECK (cash_discount_pct BETWEEN 0 AND 100),
  cash_note            text NOT NULL DEFAULT 'Pagamento único na contratação' CHECK (char_length(cash_note) <= 160),
  deadline_days        integer NOT NULL DEFAULT 40 CHECK (deadline_days BETWEEN 1 AND 365),
  valid_until          date,
  whatsapp             text CHECK (whatsapp IS NULL OR whatsapp ~ '^[0-9]{12,13}$'),

  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_proposals_updated ON public.proposals (updated_at DESC);

CREATE OR REPLACE FUNCTION public.proposals_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER proposals_touch
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.proposals_touch_updated_at();

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Sem policies: anon/authenticated não têm acesso. Só o service_role.
REVOKE ALL ON public.proposals FROM anon, authenticated, PUBLIC;
GRANT ALL ON public.proposals TO service_role;
