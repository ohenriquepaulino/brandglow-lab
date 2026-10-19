-- Cadência automática no WhatsApp para quem não fatura ou fatura até R$ 6 mil.
--
-- No cadastro, agendarMensagensDoLead grava um envio 'pendente' (tipo
-- 'cadencia') para cada passo, com enviar_em = cadastro + dia, em horário
-- comercial. O texto e o vídeo são lidos do passo na hora do envio: editar um
-- passo vale também para quem já está na cadência, e um passo desligado é
-- pulado (fica 'cancelado').
--
-- A cadência para quando o lead responde (webhook) ou quando o card sai de
-- Novo lead / Aguardando resposta / Contato feito: os pendentes viram 'cancelado'.

CREATE TABLE public.cadencia_passos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem      int NOT NULL,
  dia        int NOT NULL CHECK (dia BETWEEN 1 AND 60),
  mensagem   text NOT NULL DEFAULT '',
  video_url  text,
  ativo      boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cadencia_passos ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.cadencia_passos TO service_role;

ALTER TABLE public.whatsapp_config
  ADD COLUMN cadencia_ativa boolean NOT NULL DEFAULT false;

ALTER TABLE public.whatsapp_envios
  ADD COLUMN passo_id uuid REFERENCES public.cadencia_passos(id) ON DELETE SET NULL;

ALTER TABLE public.whatsapp_envios DROP CONSTRAINT whatsapp_envios_tipo_check;
ALTER TABLE public.whatsapp_envios
  ADD CONSTRAINT whatsapp_envios_tipo_check
  CHECK (tipo IN ('boas_vindas', 'aviso', 'cadencia'));

ALTER TABLE public.whatsapp_envios DROP CONSTRAINT whatsapp_envios_status_check;
ALTER TABLE public.whatsapp_envios
  ADD CONSTRAINT whatsapp_envios_status_check
  CHECK (status IN ('pendente', 'enviando', 'enviado', 'erro', 'cancelado'));

-- Textos aprovados pelo Henrique em 2026-10-19. O áudio do D5 começa desligado.
INSERT INTO public.cadencia_passos (ordem, dia, mensagem, video_url, ativo) VALUES
(1, 1, $m$Oii {primeiro-nome}, tudo bem?

Pra você entender direitinho como funciona, tem uma apresentação rapidinha, de uns 5 min, mostrando como é o processo, os prazos e o investimento… dá uma olhada:
legacybc.com.br/v/apresentacao-44nj-legacy

Depois me conta o que achou?$m$, NULL, true),
(2, 3, $m$Oii {primeiro-nome}! Separei aqui alguns projetos que a gente fez pra você ver como fica na prática… tem de tudo, de clínica a imobiliária.

Qual você mais gostou?$m$, 'https://legacybc.com.br/video/legacy-cases-720.mp4', true),
(3, 5, '', NULL, false),
(4, 8, $m$Oii {primeiro-nome}, passando pra te contar que dá pra parcelar o projeto em até 12x no cartão… muita gente acha que precisa pagar tudo de uma vez.

Ajuda pra você?$m$, NULL, true),
(5, 14, $m$Oii {primeiro-nome}… vou parar de te mandar mensagem por aqui pra não ficar chato, tá?

Mas me fala só uma coisa, sinceramente: o que pesou mais, o momento, o valor ou ficou alguma dúvida? Me ajuda muito saber. E quando fizer sentido pra você, é só me chamar aqui.$m$, NULL, true);
