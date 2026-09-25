-- O grupo do aviso passa a ser fixo, definido pelo link de convite (sem
-- escolher numa lista). O link fica SÓ no banco: o repo é público e o link
-- deixa qualquer um entrar no grupo. O valor é gravado direto no banco:
--   UPDATE public.whatsapp_config SET aviso_grupo_convite = '<link>' WHERE id = 1;
-- O id do grupo (aviso_grupo_id) é resolvido pela Evolution no primeiro envio.

ALTER TABLE public.whatsapp_config ADD COLUMN aviso_grupo_convite text;
