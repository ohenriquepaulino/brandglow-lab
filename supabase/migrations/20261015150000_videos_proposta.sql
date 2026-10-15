-- Vídeo genérico de proposta: o mesmo vídeo vai para vários leads (um link por
-- pessoa, como antes) e a página mostra um botão para a proposta (/p/:slug).
-- O clique vira o evento "proposta" na linha do tempo da visita.
alter table public.videos add column if not exists proposta_slug text
  check (proposta_slug is null or proposta_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

alter table public.video_eventos drop constraint if exists video_eventos_tipo_check;
alter table public.video_eventos add constraint video_eventos_tipo_check
  check (tipo in ('play', 'pause', 'fim', 'voltou', 'pulou', 'proposta'));
