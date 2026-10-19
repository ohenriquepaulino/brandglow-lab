-- Boas-vindas por faixa de faturamento.
--
-- mensagem_ate_6k: texto para quem não fatura ou fatura até R$ 6 mil (leva o
-- investimento). Vazio = todo mundo recebe a mensagem padrão (coluna mensagem),
-- que passa a ser a de quem fatura acima de R$ 6 mil.

ALTER TABLE public.whatsapp_config
  ADD COLUMN mensagem_ate_6k text NOT NULL DEFAULT '';
