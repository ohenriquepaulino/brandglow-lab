-- Aviso de novo lead num grupo de WhatsApp: "NOVO LEAD NO CRM / nome / wa.me".
--
-- Sai do mesmo número conectado (o da Lais) e pela mesma fila/cron das
-- boas-vindas, sem atraso. Quem envia não é notificado pelo WhatsApp — o
-- aviso serve aos OUTROS membros do grupo.

ALTER TABLE public.whatsapp_config
  ADD COLUMN aviso_ativo boolean NOT NULL DEFAULT false,
  ADD COLUMN aviso_grupo_id text CHECK (aviso_grupo_id IS NULL OR aviso_grupo_id LIKE '%@g.us'),
  ADD COLUMN aviso_grupo_nome text;

-- 'boas_vindas' vai para o lead (telefone); 'aviso' vai para o grupo
-- (telefone guarda o id do grupo, "...@g.us").
ALTER TABLE public.whatsapp_envios
  ADD COLUMN tipo text NOT NULL DEFAULT 'boas_vindas' CHECK (tipo IN ('boas_vindas', 'aviso'));
