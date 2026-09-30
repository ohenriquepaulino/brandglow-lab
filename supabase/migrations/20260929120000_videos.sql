-- Apresentações em vídeo: um vídeo do YouTube (não listado) tocado num player
-- limpo em /v/:slug, com um link por pessoa. A página registra abertura, play,
-- pause, fim e os segundos assistidos; a equipe recebe aviso no e-mail e no
-- grupo do WhatsApp (mesma fila das boas-vindas).
--
-- Mesmo padrão das Tarefas e do A/B: RLS ligado sem policies, acesso só pela
-- service_role nas rotas do servidor.

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  -- Preenchida pelo player na primeira reprodução (o YouTube informa).
  duracao_seg int check (duracao_seg is null or duracao_seg > 0),
  criado_em timestamptz not null default now()
);

-- Um link por pessoa: é o que diz QUEM assistiu.
create table if not exists public.video_links (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  slug text not null unique,
  destinatario text not null,
  lead_id uuid references public.leads(id) on delete set null,
  criado_em timestamptz not null default now()
);
create index if not exists video_links_video_idx on public.video_links (video_id);
create index if not exists video_links_lead_idx on public.video_links (lead_id);

-- Uma visita: da abertura da página até 30 min sem atividade.
create table if not exists public.video_sessoes (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references public.video_links(id) on delete cascade,
  visitante text not null,
  dispositivo text not null default 'computador' check (dispositivo in ('celular', 'computador')),
  iniciado_em timestamptz not null default now(),
  ultimo_evento_em timestamptz not null default now(),
  deu_play boolean not null default false,
  -- Segundos do vídeo assistidos (sem repetição): dá o % real, não só até
  -- onde a pessoa arrastou a barra.
  assistidos int[] not null default '{}',
  -- Ponto mais distante que chegou e onde parou por último.
  maximo_seg int not null default 0,
  posicao_seg int not null default 0,
  chegou_ao_fim boolean not null default false,
  -- Resumo no WhatsApp/e-mail: sai 2 min depois da última atividade. Se a
  -- pessoa volta a assistir na mesma visita, reabre e sai um novo resumo.
  resumo_pendente boolean not null default true,
  resumos_enviados int not null default 0
);
create index if not exists video_sessoes_link_idx on public.video_sessoes (link_id, iniciado_em desc);
create index if not exists video_sessoes_resumo_idx
  on public.video_sessoes (ultimo_evento_em) where resumo_pendente;

-- Linha do tempo da visita: play, pause, fim, voltou (rever) e pulou.
create table if not exists public.video_eventos (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references public.video_sessoes(id) on delete cascade,
  tipo text not null check (tipo in ('play', 'pause', 'fim', 'voltou', 'pulou')),
  posicao_seg int not null default 0,
  de_seg int,
  criado_em timestamptz not null default now()
);
create index if not exists video_eventos_sessao_idx on public.video_eventos (sessao_id, criado_em);

alter table public.videos enable row level security;
alter table public.video_links enable row level security;
alter table public.video_sessoes enable row level security;
alter table public.video_eventos enable row level security;

grant all on public.videos to service_role;
grant all on public.video_links to service_role;
grant all on public.video_sessoes to service_role;
grant all on public.video_eventos to service_role;

-- Junta os segundos novos aos já assistidos numa operação só (o player manda
-- de 10 em 10 s e ao pausar/fechar; duas chamadas quase juntas não se perdem).
create or replace function public.video_registrar(
  p_sessao uuid,
  p_segundos int[],
  p_posicao int,
  p_play boolean,
  p_fim boolean
)
returns void
language sql volatile security definer set search_path = public as $$
  update public.video_sessoes s
  set
    assistidos = coalesce(
      (select array_agg(x order by x) from (select distinct unnest(s.assistidos || p_segundos) as x) u),
      '{}'
    ),
    maximo_seg = greatest(s.maximo_seg, p_posicao, coalesce((select max(x) from unnest(p_segundos) x), 0)),
    posicao_seg = p_posicao,
    deu_play = s.deu_play or p_play or cardinality(p_segundos) > 0,
    chegou_ao_fim = s.chegou_ao_fim or p_fim,
    ultimo_evento_em = now(),
    -- Assistiu algo novo depois do resumo: sai outro resumo depois.
    resumo_pendente = s.resumo_pendente or cardinality(p_segundos) > 0 or p_fim
  where s.id = p_sessao
$$;

revoke all on function public.video_registrar(uuid, int[], int, boolean, boolean) from public, anon, authenticated;
grant execute on function public.video_registrar(uuid, int[], int, boolean, boolean) to service_role;

-- Resumo das visitas paradas há 2 min. Só faz a chamada HTTP quando há
-- resumo vencido; nos outros ciclos é uma leitura de índice. Autentica com o
-- mesmo cron_token do WhatsApp.
-- Reverter: SELECT cron.unschedule('video-resumo');
select cron.schedule(
  'video-resumo',
  '30 seconds',
  $$
  SELECT net.http_post(
    url := 'https://legacybc.com.br/api/public/video/process',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-token', (SELECT cron_token::text FROM public.whatsapp_config WHERE id = 1)
    ),
    body := '{}'::jsonb
  )
  WHERE EXISTS (
    SELECT 1 FROM public.video_sessoes
    WHERE resumo_pendente AND ultimo_evento_em <= now() - interval '2 minutes'
  );
  $$
);
