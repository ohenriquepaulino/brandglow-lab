-- WhatsApp de boas-vindas: o lead se cadastra no site e recebe uma mensagem
-- do número da Legacy (Evolution API). Versão enxuta da automação do CRM da
-- Vende-C: um número, uma mensagem, um gatilho (o cadastro).
--
-- As duas tabelas só são lidas/escritas pelas server routes (service role);
-- RLS ligada e sem policy = nada exposto para a chave anônima.

-- Configuração: linha única (id = 1).
CREATE TABLE public.whatsapp_config (
  id          int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  ativo       boolean NOT NULL DEFAULT false,
  mensagem    text NOT NULL DEFAULT 'Oi, {primeiro-nome}! Aqui é da Legacy BrandCo. Recebemos seu cadastro e em breve falamos com você por aqui.',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.whatsapp_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Log de cada tentativa de envio automático (aparece no painel do lead).
CREATE TABLE public.whatsapp_envios (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  telefone   text NOT NULL,
  mensagem   text NOT NULL,
  status     text NOT NULL CHECK (status IN ('enviado', 'erro')),
  erro       text,
  criado_em  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_whatsapp_envios_lead ON public.whatsapp_envios(lead_id);
CREATE INDEX idx_whatsapp_envios_criado ON public.whatsapp_envios(criado_em DESC);

ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_envios ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.whatsapp_config TO service_role;
GRANT ALL ON public.whatsapp_envios TO service_role;
