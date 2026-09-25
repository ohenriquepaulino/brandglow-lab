-- Lead respondeu no WhatsApp -> card vai para "Conversando".
--
-- A Evolution avisa cada mensagem recebida (MESSAGES_UPSERT) em
-- /api/public/whatsapp/webhook?token=<webhook_token>. A Evolution não manda
-- header customizado, por isso o token vai na URL.
--
-- webhook_registrado: o CRM registra o webhook na Evolution uma vez (ao ver
-- o número conectado) e marca aqui. Reconectar o número zera o flag.

ALTER TABLE public.whatsapp_config
  ADD COLUMN webhook_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN webhook_registrado boolean NOT NULL DEFAULT false;
