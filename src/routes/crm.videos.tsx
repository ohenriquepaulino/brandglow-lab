import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  Monitor,
  Smartphone,
  Trash2,
  X,
} from "lucide-react";
import { crmLogout, isCrmAuthed, type Lead } from "@/lib/crm-auth";
import { CrmSidebar } from "@/components/crm/Sidebar";
import { HideLovableBadge } from "@/components/HideLovableBadge";
import { AB_IGNORAR_KEY } from "@/lib/ab";
import { apiListLeads } from "@/lib/crm-api";
import {
  apiCreateLink,
  apiCreateVideo,
  apiDeleteLink,
  apiDeleteVideo,
  apiListVideos,
  apiSessoes,
  type Video,
  type VideoLink,
  type VideoSessao,
} from "@/lib/videos-api";
import { formatTempo, percentual, trechos, videoLinkUrl, youtubeId, youtubeThumb } from "@/lib/video";

export const Route = createFileRoute("/crm/videos")({
  ssr: false,
  component: VideosPage,
});

const BORDER = "#E0DED9";

function VideosPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isCrmAuthed()) {
      navigate({ to: "/crm" });
      return;
    }
    // Quem usa o CRM não conta como visita ao abrir os próprios links.
    try {
      localStorage.setItem(AB_IGNORAR_KEY, "1");
    } catch {
      // sem localStorage: segue contando
    }
    setAuthed(true);
  }, [navigate]);

  function handleLogout() {
    crmLogout();
    navigate({ to: "/crm" });
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#F4F2EF", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <HideLovableBadge />
      <CrmSidebar />
      <div className="min-w-0 flex-1">
        <header
          className="flex items-center justify-between border-b bg-white px-4 py-3 md:px-6"
          style={{ borderColor: BORDER }}
        >
          <p className="text-sm font-semibold text-neutral-900">Vídeos · apresentações</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              style={{ borderColor: BORDER }}
            >
              Atualizar
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              style={{ borderColor: BORDER }}
            >
              Sair
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-4xl space-y-5 px-3 py-5 md:px-6 md:py-6">
          {authed && <VideosContent key={reloadKey} />}
        </main>
      </div>
    </div>
  );
}

function VideosContent() {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [detalhe, setDetalhe] = useState<{ link: VideoLink; video: Video } | null>(null);

  async function carregar() {
    try {
      setVideos(await apiListVideos());
      setErro(null);
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    void carregar();
    apiListLeads()
      .then(setLeads)
      .catch(() => {});
    // Status dos links se atualiza sozinho enquanto a tela está aberta.
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void carregar();
    }, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <NovoVideo onCriado={(v) => setVideos((vs) => [{ ...v, links: [] }, ...(vs ?? [])])} />

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {videos === null ? (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-white" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <ComoFunciona />
      ) : (
        videos.map((v) => (
          <VideoCard
            key={v.id}
            video={v}
            leads={leads}
            onMudou={carregar}
            onRemovido={() => setVideos((vs) => (vs ?? []).filter((x) => x.id !== v.id))}
            onDetalhe={(link) => setDetalhe({ link, video: v })}
          />
        ))
      )}

      {detalhe && (
        <DetalheLink
          link={detalhe.link}
          video={detalhe.video}
          onFechar={() => setDetalhe(null)}
        />
      )}
    </>
  );
}

// ─── Novo vídeo ──────────────────────────────────────────────────────────────

function NovoVideo({ onCriado }: { onCriado: (v: Video) => void }) {
  const [url, setUrl] = useState("");
  const [titulo, setTitulo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const id = youtubeId(url);
  const invalido = url.trim().length > 0 && !id;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !titulo.trim() || salvando) return;
    setSalvando(true);
    try {
      onCriado(await apiCreateVideo(titulo.trim(), id));
      setUrl("");
      setTitulo("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível salvar o vídeo.");
    }
    setSalvando(false);
  }

  return (
    <form onSubmit={salvar} className="rounded-lg border bg-white p-4 md:p-5" style={{ borderColor: BORDER }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
        Novo vídeo
      </p>
      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-start">
        {id && (
          <img
            src={youtubeThumb(id, "hq")}
            alt=""
            className="aspect-video w-full rounded-md object-cover md:w-40"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Link do YouTube (não listado)"
            inputMode="url"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-neutral-900"
            style={{ borderColor: invalido ? "#DC2626" : BORDER }}
          />
          {invalido && (
            <p className="text-xs text-red-600">Não reconheci esse link. Copie o link do vídeo no YouTube.</p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={120}
              placeholder="Título que o lead vê (ex.: Proposta de branding)"
              className="min-w-0 flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:border-neutral-900"
              style={{ borderColor: BORDER }}
            />
            <button
              type="submit"
              disabled={!id || !titulo.trim() || salvando}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {salvando ? "Salvando..." : "Adicionar vídeo"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function ComoFunciona() {
  const passos = [
    ["Grave e suba no YouTube", "Na hora de publicar, escolha a visibilidade Não listado."],
    ["Cole o link aqui", "Dê um título. É o que o lead vê em cima do vídeo."],
    ["Gere um link por pessoa", "Mande o link. Você é avisado quando a pessoa abre e recebe o resumo do que ela assistiu."],
  ];
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {passos.map(([t, d], i) => (
        <div key={t} className="rounded-lg border bg-white p-4" style={{ borderColor: BORDER }}>
          <p className="text-2xl font-semibold text-neutral-300">{i + 1}</p>
          <p className="mt-1 text-sm font-semibold text-neutral-900">{t}</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">{d}</p>
        </div>
      ))}
    </section>
  );
}

// ─── Card do vídeo ───────────────────────────────────────────────────────────

function VideoCard({
  video,
  leads,
  onMudou,
  onRemovido,
  onDetalhe,
}: {
  video: Video;
  leads: Lead[];
  onMudou: () => void;
  onRemovido: () => void;
  onDetalhe: (l: VideoLink) => void;
}) {
  const [links, setLinks] = useState(video.links);
  const [novoId, setNovoId] = useState<string | null>(null);
  useEffect(() => setLinks(video.links), [video.links]);
  const leadsPorId = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);

  async function excluirVideo() {
    const n = links.length;
    if (
      !confirm(
        n
          ? `Excluir "${video.titulo}"? Os ${n} link(s) param de funcionar e o histórico de visitas é apagado.`
          : `Excluir "${video.titulo}"?`,
      )
    )
      return;
    try {
      await apiDeleteVideo(video.id);
      onRemovido();
    } catch {
      alert("Não foi possível excluir o vídeo.");
    }
  }

  async function excluirLink(l: VideoLink) {
    if (!confirm(`Excluir o link de ${l.destinatario}? Ele para de funcionar e o histórico é apagado.`))
      return;
    try {
      await apiDeleteLink(l.id);
      setLinks((ls) => ls.filter((x) => x.id !== l.id));
    } catch {
      alert("Não foi possível excluir o link.");
    }
  }

  return (
    <section className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: BORDER }}>
      <div className="flex gap-3 p-4 md:gap-4 md:p-5">
        <a
          href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0"
          title="Abrir no YouTube"
        >
          <img
            src={youtubeThumb(video.youtube_id, "hq")}
            alt=""
            className="aspect-video w-28 rounded-md object-cover md:w-40"
          />
        </a>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-neutral-900">{video.titulo}</p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {video.duracao_seg ? formatTempo(video.duracao_seg) : "Duração aparece na 1ª reprodução"}
            {" · "}
            {links.length} {links.length === 1 ? "link" : "links"}
          </p>
          <button
            onClick={excluirVideo}
            className="mt-2 inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> Excluir vídeo
          </button>
        </div>
      </div>

      <NovoLink
        video={video}
        leads={leads}
        onCriado={(l) => {
          setLinks((ls) => [l, ...ls]);
          setNovoId(l.id);
          onMudou();
        }}
      />

      {links.length > 0 && (
        <ul className="border-t" style={{ borderColor: BORDER }}>
          {links.map((l, i) => (
            <LinhaLink
              key={l.id}
              link={l}
              video={video}
              lead={l.lead_id ? leadsPorId.get(l.lead_id) ?? null : null}
              destaque={l.id === novoId}
              primeira={i === 0}
              onDetalhe={() => onDetalhe(l)}
              onExcluir={() => void excluirLink(l)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

// ─── Gerar link (com busca de lead) ──────────────────────────────────────────

function NovoLink({
  video,
  leads,
  onCriado,
}: {
  video: Video;
  leads: Lead[];
  onCriado: (l: VideoLink) => void;
}) {
  const [nome, setNome] = useState("");
  const [lead, setLead] = useState<Lead | null>(null);
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sugestoes = useMemo(() => {
    const q = normalizar(nome);
    if (!q || lead) return [];
    return leads.filter((l) => normalizar(l.nome).includes(q)).slice(0, 6);
  }, [nome, leads, lead]);

  async function gerar(e: React.FormEvent) {
    e.preventDefault();
    const destinatario = (lead?.nome ?? nome).trim();
    if (!destinatario || salvando) return;
    setSalvando(true);
    try {
      const l = await apiCreateLink(video.id, destinatario, lead?.id ?? null);
      onCriado({
        ...l,
        visitas: 0,
        ultimo_acesso: null,
        deu_play: false,
        chegou_ao_fim: false,
        segundos_assistidos: 0,
        percentual: null,
      });
      setNome("");
      setLead(null);
      try {
        await navigator.clipboard.writeText(videoLinkUrl(l.slug));
        setCopiado(true);
        window.setTimeout(() => setCopiado(false), 2500);
      } catch {
        // sem permissão: o botão Copiar da linha resolve
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Não foi possível gerar o link.");
    }
    setSalvando(false);
  }

  return (
    <form
      onSubmit={gerar}
      className="flex flex-col gap-2 border-t bg-[#FAF9F7] px-4 py-3 sm:flex-row sm:items-center md:px-5"
      style={{ borderColor: BORDER }}
    >
      <div className="relative min-w-0 flex-1">
        {lead ? (
          <div
            className="flex items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-sm"
            style={{ borderColor: BORDER }}
          >
            <span className="min-w-0 truncate">
              <span className="font-medium text-neutral-900">{lead.nome}</span>
              <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
                lead do CRM
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                setLead(null);
                window.setTimeout(() => inputRef.current?.focus(), 0);
              }}
              aria-label="Trocar"
              className="text-neutral-400 hover:text-neutral-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <input
            ref={inputRef}
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setAberto(true);
            }}
            onFocus={() => setAberto(true)}
            onBlur={() => window.setTimeout(() => setAberto(false), 150)}
            maxLength={120}
            placeholder="Para quem? Busque um lead ou digite um nome"
            className="w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
            style={{ borderColor: BORDER }}
          />
        )}
        {aberto && sugestoes.length > 0 && (
          <ul
            className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-md border bg-white shadow-lg"
            style={{ borderColor: BORDER }}
          >
            {sugestoes.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setLead(l);
                    setAberto(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-neutral-50"
                >
                  <span className="truncate font-medium text-neutral-900">{l.nome}</span>
                  <span className="shrink-0 text-xs text-neutral-500">{l.whatsapp}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        type="submit"
        disabled={salvando || !(lead?.nome ?? nome).trim()}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {salvando ? "Gerando..." : copiado ? "Link copiado ✓" : "Gerar link"}
      </button>
    </form>
  );
}

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

// ─── Linha do link ───────────────────────────────────────────────────────────

function status(l: VideoLink): { texto: string; cor: string; fundo: string } {
  if (l.visitas === 0) return { texto: "Não abriu", cor: "#737373", fundo: "#F5F5F4" };
  if (!l.deu_play) return { texto: "Abriu, sem play", cor: "#A16207", fundo: "#FEF9C3" };
  if (l.chegou_ao_fim || (l.percentual ?? 0) >= 95)
    return { texto: "Assistiu tudo", cor: "#15803D", fundo: "#DCFCE7" };
  return {
    texto: l.percentual !== null ? `Assistiu ${l.percentual}%` : `Assistiu ${formatTempo(l.segundos_assistidos)}`,
    cor: "#3F6212",
    fundo: "#ECFCCB",
  };
}

function quandoRelativo(iso: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d} dias`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function LinhaLink({
  link,
  video,
  lead,
  destaque,
  primeira,
  onDetalhe,
  onExcluir,
}: {
  link: VideoLink;
  video: Video;
  lead: Lead | null;
  destaque: boolean;
  primeira: boolean;
  onDetalhe: () => void;
  onExcluir: () => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const url = videoLinkUrl(link.slug);
  const st = status(link);
  const pct = link.chegou_ao_fim ? Math.max(link.percentual ?? 0, 100) : (link.percentual ?? 0);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      prompt("Copie o link:", url);
    }
  }

  const telefone = lead?.whatsapp?.replace(/\D/g, "");
  const wa = telefone
    ? `https://wa.me/${telefone.length <= 11 ? `55${telefone}` : telefone}?text=${encodeURIComponent(
        `Oi, ${lead!.nome.trim().split(/\s+/)[0]}! Gravei um vídeo explicando tudo pra você: ${url}`,
      )}`
    : null;

  return (
    <li
      className="flex flex-col gap-3 px-4 py-3 transition-colors sm:flex-row sm:items-center md:px-5"
      style={{
        borderTop: primeira ? undefined : `1px solid ${BORDER}`,
        background: destaque ? "#F7FEE7" : undefined,
      }}
    >
      <button onClick={onDetalhe} className="min-w-0 flex-1 text-left">
        <p className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium text-neutral-900">
          <span className="truncate">{link.destinatario}</span>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold"
            style={{ color: st.cor, background: st.fundo }}
          >
            {st.texto}
          </span>
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="h-1 w-24 overflow-hidden rounded-full bg-neutral-100 md:w-32">
            <div className="h-full rounded-full bg-[#84CC16]" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <p className="truncate text-xs text-neutral-500">
            {link.visitas > 0
              ? `${link.visitas} ${link.visitas === 1 ? "visita" : "visitas"} · ${quandoRelativo(link.ultimo_acesso)}`
              : `criado ${quandoRelativo(link.criado_em)}`}
          </p>
        </div>
      </button>
      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        <AcaoLink onClick={() => void copiar()} label={copiado ? "Copiado" : "Copiar link"}>
          {copiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copiado ? "Copiado" : "Copiar"}</span>
        </AcaoLink>
        {wa && (
          <AcaoLink href={wa} label="Mandar no WhatsApp do lead">
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp</span>
          </AcaoLink>
        )}
        <AcaoLink href={url} label={`Ver como ${link.destinatario} vê (não registra)`}>
          <ExternalLink className="h-3.5 w-3.5" />
        </AcaoLink>
        <button
          onClick={onDetalhe}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
        >
          Detalhes
        </button>
        <button
          onClick={onExcluir}
          aria-label={`Excluir link de ${link.destinatario}`}
          title="Excluir link"
          className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {/* título do vídeo no leitor de tela */}
      <span className="sr-only">{video.titulo}</span>
    </li>
  );
}

function AcaoLink({
  onClick,
  href,
  label,
  children,
}: {
  onClick?: () => void;
  href?: string;
  label: string;
  children: React.ReactNode;
}) {
  const cls =
    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50";
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" title={label} aria-label={label} className={cls} style={{ borderColor: BORDER }}>
      {children}
    </a>
  ) : (
    <button onClick={onClick} title={label} aria-label={label} className={cls} style={{ borderColor: BORDER }}>
      {children}
    </button>
  );
}

// ─── Detalhes das visitas ────────────────────────────────────────────────────

const ROTULO_EVENTO: Record<string, string> = {
  play: "Deu play",
  pause: "Pausou",
  fim: "Chegou ao fim",
  voltou: "Voltou para rever",
  pulou: "Pulou",
};

function DetalheLink({
  link,
  video,
  onFechar,
}: {
  link: VideoLink;
  video: Video;
  onFechar: () => void;
}) {
  const [sessoes, setSessoes] = useState<VideoSessao[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    apiSessoes(link.id)
      .then(setSessoes)
      .catch((e) => setErro(e instanceof Error ? e.message : String(e)));
  }, [link.id]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", esc);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = antes;
    };
  }, [onFechar]);

  const duracao = video.duracao_seg;
  // Todas as visitas juntas: o que a pessoa já viu do vídeo.
  const todos = useMemo(() => (sessoes ?? []).flatMap((s) => s.assistidos), [sessoes]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Visitas de ${link.destinatario}`}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4" style={{ borderColor: BORDER }}>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-neutral-900">{link.destinatario}</p>
            <p className="truncate text-xs text-neutral-500">{video.titulo}</p>
          </div>
          <button onClick={onFechar} aria-label="Fechar" className="rounded-md p-1 text-neutral-400 hover:text-neutral-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          {sessoes === null && !erro && (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-md bg-neutral-100" />
              ))}
            </div>
          )}
          {sessoes?.length === 0 && (
            <p className="py-8 text-center text-sm text-neutral-500">
              Ninguém abriu este link ainda. Assim que abrir, você é avisado no e-mail e no grupo.
            </p>
          )}

          {sessoes && sessoes.length > 0 && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Somando todas as visitas
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <p className="text-3xl font-semibold text-neutral-900">
                  {percentual(todos, duracao) !== null ? `${percentual(todos, duracao)}%` : formatTempo(new Set(todos).size)}
                </p>
                <p className="text-sm text-neutral-500">
                  {formatTempo(new Set(todos).size)}
                  {duracao ? ` de ${formatTempo(duracao)} assistidos` : " assistidos"}
                </p>
              </div>
              <MapaAssistido segundos={todos} duracao={duracao} />

              <div className="mt-6 space-y-4">
                {sessoes.map((s, i) => (
                  <Visita key={s.id} sessao={s} numero={sessoes.length - i} duracao={duracao} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Barra do vídeo com os trechos assistidos pintados. */
function MapaAssistido({ segundos, duracao }: { segundos: number[]; duracao: number | null }) {
  const total = duracao ?? Math.max(1, ...segundos) + 1;
  const ts = trechos(segundos);
  return (
    <div className="mt-3">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
        {ts.map(([a, b]) => (
          <div
            key={a}
            className="absolute inset-y-0 bg-[#84CC16]"
            style={{ left: `${(a / total) * 100}%`, width: `${(Math.max(1, b - a + 1) / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] tabular-nums text-neutral-400">
        <span>0:00</span>
        <span>{formatTempo(total)}</span>
      </div>
    </div>
  );
}

function Visita({ sessao: s, numero, duracao }: { sessao: VideoSessao; numero: number; duracao: number | null }) {
  const pct = percentual(s.assistidos, duracao);
  const inicio = new Date(s.iniciado_em);
  const Icone = s.dispositivo === "celular" ? Smartphone : Monitor;
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: BORDER }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
          <Icone className="h-4 w-4 text-neutral-400" />
          {numero}ª visita
          <span className="font-normal text-neutral-500">
            · {inicio.toLocaleDateString("pt-BR")} às{" "}
            {inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </p>
        <p className="text-xs font-medium text-neutral-600">
          {!s.deu_play
            ? "Não deu play"
            : s.chegou_ao_fim
              ? "Chegou ao fim"
              : `${pct !== null ? `${pct}% · ` : ""}parou em ${formatTempo(s.posicao_seg)}`}
        </p>
      </div>
      {s.deu_play && <MapaAssistido segundos={s.assistidos} duracao={duracao} />}
      {s.eventos.length > 0 && (
        <ol className="mt-3 space-y-1">
          {s.eventos.map((e, i) => (
            <li key={i} className="flex gap-3 text-xs text-neutral-600">
              <span className="w-11 shrink-0 tabular-nums text-neutral-400">
                {new Date(e.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span>
                {ROTULO_EVENTO[e.tipo] ?? e.tipo}{" "}
                {e.tipo === "voltou" || e.tipo === "pulou" ? (
                  <span className="tabular-nums text-neutral-900">
                    {e.de_seg !== null ? `de ${formatTempo(e.de_seg)} ` : ""}para {formatTempo(e.posicao_seg)}
                  </span>
                ) : (
                  <span className="tabular-nums text-neutral-900">em {formatTempo(e.posicao_seg)}</span>
                )}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
