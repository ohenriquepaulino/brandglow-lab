-- Opção "Cartão de crédito em 12x" (com os juros da plataforma) no modelo em slides.
-- Desligada por padrão para não mudar propostas já enviadas.
alter table public.proposals add column if not exists show_card boolean not null default false;
