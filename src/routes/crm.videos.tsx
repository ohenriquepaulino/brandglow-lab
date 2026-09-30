import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  Eye,
  Link2,
  MessageCircle,
  Monitor,
  MoreHorizontal,
  Play,
  Plus,
  Smartphone,
  Trash2,
  X,
  Film,
  ExternalLink,
} from "lucide-react";
import { crmLogout, isCrmAuthed, type Lead } from "@/lib/crm-auth";
import { CrmSidebar } from "@/components/crm/Sidebar";
import { HideLovableBadge } from "@/components/HideLovableBadge";
import { Avatar, LeadPicker, type Escolha } from "@/components/crm/LeadPicker";
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
const LINKS_VISIVEIS = 5;

function VideosPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

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
          <p className="text-sm font-semibold text-neutral-900">Vídeos</p>
          <button
            onClick={handleLogout}
            className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            style={{ borderColor: BORDER }}
          >
            Sair
          </button>
        </header>
        <main className="mx-auto max-w-5xl px-3 py-5 md:px-8 md:py-8">
          {authed && <VideosContent />}
        </main>
      </div>
    </div>
  );
}

// ─── Status de um link ───────────────────────────────────────────────────────

type Status = "nao_abriu" | "abriu" | "assistindo" | "tudo";

function statusDe(l: VideoLink): Status {
  if (l.visitas === 0) return "nao_abriu";
  if (!l.deu_play || l.segundos_assistidos === 0) return "abriu";
  if (l.chegou_ao_fim || (l.percentual ?? 0) >= 95) return "tudo";
  return "assistindo";
}

const STATUS: Record<Status, { texto: string; cor: string; fundo: string; barra: string }> = {
  nao_abriu: { texto: "Não abriu", cor: "#78716C", fundo: "#F5F5F4", barra: "#D6D3D1" },
  abriu: { texto: "Abriu, sem assistir", cor: "#A16207", fundo: "#FEF3C7", barra: "#FBBF24" },
  assistindo: { texto: "Assistindo", cor: "#3F6212", fundo: "#ECFCCB", barra: "#84CC16" },
  tudo: { texto: "Assistiu tudo", cor: "#15803D", fundo: "#DCFCE7", barra: "#16A34A" },
};

function pctDe(l: VideoLink) {
  if (statusDe(l) === "tudo") return 100;
  return l.percentual ?? 0;
}

function quandoRelativo(iso: string | null) {
  if (!iso) return "";
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d} dias`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

// ─── Conteúdo ────────────────────────────────────────────────────────────────

function VideosContent() {
  const [videos, setVideos] = useState<Video[] | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [novoAberto, setNovoAberto] = useState(false);
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

  const leadsPorId = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads]);
  const vazio = videos !== null && videos.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 md:text-2xl">
            Apresentações em vídeo
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Um link por pessoa. Você é avisado quando ela abre e recebe o resumo do que assistiu.
          </p>
        </div>
        {!vazio && (
          <button
            onClick={() => setNovoAberto((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {novoAberto ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {novoAberto ? "Fechar" : "Novo vídeo"}
          </button>
        )}
      </div>

      {(novoAberto || vazio) && (
        <NovoVideo
          onCriado={(v) => {
            setVideos((vs) => [{ ...v, links: [] }, ...(vs ?? [])]);
            setNovoAberto(false);
          }}
        />
      )}

      {erro && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>
      )}

      {videos && videos.length > 0 && <Resumo videos={videos} />}

      {videos === null ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      ) : vazio ? (
        <ComoFunciona />
      ) : (
        <div className="space-y-5">
          {videos.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              leads={leads}
              leadsPorId={leadsPorId}
              onMudou={carregar}
              onRemovido={() => setVideos((vs) => (vs ?? []).filter((x) => x.id !== v.id))}
              onDetalhe={(link) => setDetalhe({ link, video: v })}
            />
          ))}
        </div>
      )}

      {detalhe && (
        <DetalheLink
          link={detalhe.link}
          video={detalhe.video}
          lead={detalhe.link.lead_id ? (leadsPorId.get(detalhe.link.lead_id) ?? null) : null}
          onFechar={() => setDetalhe(null)}
        />
      )}
    </div>
  );
}

/** Números do topo: quantos links viraram visita e quanto foi assistido. */
function Resumo({ videos }: { videos: Video[] }) {
  const links = videos.flatMap((v) => v.links);
  const abriram = links.filter((l) => l.visitas > 0).length;
  const assistiram = links.filter((l) => statusDe(l) === "assistindo" || statusDe(l) === "tudo");
  const tudo = links.filter((l) => statusDe(l) === "tudo").length;
  const media = assistiram.length
    ? Math.round(assistiram.reduce((s, l) => s + pctDe(l), 0) / assistiram.length)
    : null;
  const taxa = (n: number) => (links.length ? `${Math.round((n / links.length) * 100)}%` : "—");

  const itens = [
    { rotulo: "Links enviados", valor: String(links.length), sub: `${videos.length} ${videos.length === 1 ? "vídeo" : "vídeos"}` },
    { rotulo: "Abriram", valor: String(abriram), sub: `${taxa(abriram)} dos links` },
    { rotulo: "Assistiram", valor: String(assistiram.length), sub: media !== null ? `média de ${media}% do vídeo` : "ninguém ainda" },
    { rotulo: "Até o fim", valor: String(tudo), sub: `${taxa(tudo)} dos links` },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {itens.map((i) => (
        <div key={i.rotulo} className="rounded-xl border bg-white px-4 py-3.5" style={{ borderColor: BORDER }}>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">{i.rotulo}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-neutral-900">{i.valor}</p>
          <p className="text-xs text-neutral-500">{i.sub}</p>
        </div>
      ))}
    </section>
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
    <form onSubmit={salvar} className="rounded-xl border bg-white p-4 md:p-5" style={{ borderColor: BORDER }}>
      <div className="flex flex-col gap-4 md:flex-row">
        <div
          className="flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 md:w-56"
          aria-hidden
        >
          {id ? (
            <img src={youtubeThumb(id, "hq")} alt="" className="h-full w-full object-cover" />
          ) : (
            <Film className="h-8 w-8 text-neutral-300" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <label className="block">
            <span className="text-xs font-medium text-neutral-700">Link do YouTube</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtu.be/..."
              inputMode="url"
              autoFocus
              className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
              style={{ borderColor: invalido ? "#DC2626" : BORDER }}
            />
            <span className={`mt-1 block text-xs ${invalido ? "text-red-600" : "text-neutral-500"}`}>
              {invalido
                ? "Não reconheci esse link. Copie o link do vídeo no YouTube."
                : "Suba o vídeo como Não listado: só quem tem o link consegue ver."}
            </span>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-neutral-700">Título que o lead vê</span>
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={120}
              placeholder="Ex.: Proposta de branding"
              className="mt-1 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
              style={{ borderColor: BORDER }}
            />
          </label>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!id || !titulo.trim() || salvando}
              className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
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
    ["Adicione o vídeo aqui", "Cole o link e dê um título. É o que o lead vê em cima do vídeo."],
    ["Gere um link por pessoa", "Mande o link. Você é avisado quando a pessoa abre e recebe o resumo do que ela assistiu."],
  ];
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {passos.map(([t, d], i) => (
        <div key={t} className="rounded-xl border bg-white p-4" style={{ borderColor: BORDER }}>
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
  leadsPorId,
  onMudou,
  onRemovido,
  onDetalhe,
}: {
  video: Video;
  leads: Lead[];
  leadsPorId: Map<string, Lead>;
  onMudou: () => void;
  onRemovido: () => void;
  onDetalhe: (l: VideoLink) => void;
}) {
  const [links, setLinks] = useState(video.links);
  const [novoId, setNovoId] = useState<string | null>(null);
  const [todos, setTodos] = useState(false);
  useEffect(() => setLinks(video.links), [video.links]);

  const abriram = links.filter((l) => l.visitas > 0).length;
  const visiveis = todos ? links : links.slice(0, LINKS_VISIVEIS);

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

  // Sem overflow-hidden no card: a lista de leads do "Para quem?" precisa
  // passar da borda.
  return (
    <section className="rounded-xl border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]" style={{ borderColor: BORDER }}>
      <div className="flex gap-4 p-4 md:p-5">
        <div className="relative shrink-0">
          <img
            src={youtubeThumb(video.youtube_id, "hq")}
            alt=""
            className="aspect-video w-28 rounded-lg object-cover sm:w-36 md:w-44"
          />
          {video.duracao_seg ? (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
              {formatTempo(video.duracao_seg)}
            </span>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-base font-semibold leading-snug text-neutral-900">{video.titulo}</p>
            <MenuVideo youtubeIdDoVideo={video.youtube_id} onExcluir={() => void excluirVideo()} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500">
            <span className="inline-flex items-center gap-1">
              <Link2 className="h-3.5 w-3.5" />
              {links.length} {links.length === 1 ? "link" : "links"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {abriram} {abriram === 1 ? "abriu" : "abriram"}
            </span>
            {!video.duracao_seg && <span>Duração aparece na 1ª reprodução</span>}
          </div>
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

      {links.length === 0 ? (
        <p className="border-t px-5 py-6 text-center text-sm text-neutral-500" style={{ borderColor: BORDER }}>
          Nenhum link ainda. Escolha para quem é e clique em Gerar link.
        </p>
      ) : (
        <ul className="border-t" style={{ borderColor: BORDER }}>
          {visiveis.map((l, i) => (
            <LinhaLink
              key={l.id}
              link={l}
              lead={l.lead_id ? (leadsPorId.get(l.lead_id) ?? null) : null}
              destaque={l.id === novoId}
              primeira={i === 0}
              ultima={i === visiveis.length - 1 && links.length <= LINKS_VISIVEIS}
              onDetalhe={() => onDetalhe(l)}
              onExcluir={() => void excluirLink(l)}
            />
          ))}
          {links.length > LINKS_VISIVEIS && (
            <li className="border-t" style={{ borderColor: BORDER }}>
              <button
                onClick={() => setTodos((t) => !t)}
                className="w-full rounded-b-xl px-5 py-2.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
              >
                {todos ? "Mostrar menos" : `Ver todos os ${links.length} links`}
              </button>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

function MenuVideo({ youtubeIdDoVideo, onExcluir }: { youtubeIdDoVideo: string; onExcluir: () => void }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setAberto(false);
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [aberto]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setAberto((a) => !a)}
        aria-label="Mais opções"
        className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {aberto && (
        <div
          className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-lg border bg-white py-1 shadow-lg"
          style={{ borderColor: BORDER }}
        >
          <a
            href={`https://www.youtube.com/watch?v=${youtubeIdDoVideo}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <ExternalLink className="h-4 w-4" /> Abrir no YouTube
          </a>
          <button
            onClick={() => {
              setAberto(false);
              onExcluir();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Excluir vídeo
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Gerar link ──────────────────────────────────────────────────────────────

function NovoLink({
  video,
  leads,
  onCriado,
}: {
  video: Video;
  leads: Lead[];
  onCriado: (l: VideoLink) => void;
}) {
  const [escolha, setEscolha] = useState<Escolha>({ nome: "", lead: null });
  const [salvando, setSalvando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const nome = (escolha.lead?.nome ?? escolha.nome).trim();

  async function gerar() {
    if (!nome || salvando) return;
    setSalvando(true);
    try {
      const l = await apiCreateLink(video.id, nome, escolha.lead?.id ?? null);
      onCriado({
        ...l,
        visitas: 0,
        ultimo_acesso: null,
        deu_play: false,
        chegou_ao_fim: false,
        segundos_assistidos: 0,
        percentual: null,
      });
      setEscolha({ nome: "", lead: null });
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
      onSubmit={(e) => {
        e.preventDefault();
        void gerar();
      }}
      className="flex flex-col gap-2 border-t bg-[#FAF9F7] px-4 py-3 sm:flex-row sm:items-center md:px-5"
      style={{ borderColor: BORDER }}
    >
      <div className="min-w-0 flex-1">
        <LeadPicker leads={leads} valor={escolha} onChange={setEscolha} onEnter={() => void gerar()} />
      </div>
      <button
        type="submit"
        disabled={salvando || !nome}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: copiado ? "#16A34A" : "#171717" }}
      >
        {copiado ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
        {salvando ? "Gerando..." : copiado ? "Link copiado" : "Gerar link"}
      </button>
    </form>
  );
}

// ─── Linha do link ───────────────────────────────────────────────────────────

function whatsappDoLead(lead: Lead | null, url: string) {
  const tel = lead?.whatsapp?.replace(/\D/g, "");
  if (!lead || !tel) return null;
  const numero = tel.length <= 11 ? `55${tel}` : tel;
  const primeiro = lead.nome.trim().split(/\s+/)[0];
  return `https://wa.me/${numero}?text=${encodeURIComponent(
    `Oi, ${primeiro}! Gravei um vídeo explicando tudo pra você: ${url}`,
  )}`;
}

function LinhaLink({
  link,
  lead,
  destaque,
  primeira,
  ultima,
  onDetalhe,
  onExcluir,
}: {
  link: VideoLink;
  lead: Lead | null;
  destaque: boolean;
  primeira: boolean;
  ultima: boolean;
  onDetalhe: () => void;
  onExcluir: () => void;
}) {
  const [copiado, setCopiado] = useState(false);
  const url = videoLinkUrl(link.slug);
  const st = STATUS[statusDe(link)];
  const pct = pctDe(link);
  const wa = whatsappDoLead(lead, url);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      prompt("Copie o link:", url);
    }
  }

  const detalheVisita =
    link.visitas > 0
      ? `${link.visitas} ${link.visitas === 1 ? "visita" : "visitas"} · ${quandoRelativo(link.ultimo_acesso)}`
      : `Criado ${quandoRelativo(link.criado_em)}`;

  return (
    <li
      className={`group flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-[#FAF9F7] sm:flex-row sm:items-center md:px-5 ${
        ultima ? "rounded-b-xl" : ""
      }`}
      style={{
        borderTop: primeira ? undefined : `1px solid ${BORDER}`,
        background: destaque ? "#F7FEE7" : undefined,
      }}
    >
      <button onClick={onDetalhe} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <Avatar nome={link.destinatario} cor={st.fundo} />
        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium text-neutral-900">{link.destinatario}</span>
            {link.lead_id && (
              <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-px text-[10px] font-medium text-neutral-500">
                lead
              </span>
            )}
          </span>
          <span className="mt-1.5 flex items-center gap-2.5">
            <span className="h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-neutral-100">
              <span
                className="block h-full rounded-full transition-[width] duration-500"
                style={{ width: `${Math.min(100, pct)}%`, background: st.barra }}
              />
            </span>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-neutral-700">{pct}%</span>
          </span>
          <span className="mt-1 block truncate text-xs text-neutral-500">{detalheVisita}</span>
        </span>
      </button>

      <div className="flex shrink-0 items-center gap-1.5 pl-11 sm:pl-0">
        <span
          className="mr-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ color: st.cor, background: st.fundo }}
        >
          {st.texto}
        </span>
        <IconeAcao onClick={() => void copiar()} label={copiado ? "Copiado" : "Copiar link"}>
          {copiado ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
        </IconeAcao>
        {wa && (
          <IconeAcao href={wa} label="Mandar no WhatsApp do lead">
            <MessageCircle className="h-4 w-4" />
          </IconeAcao>
        )}
        <IconeAcao href={url} label="Ver a página como o lead vê (não registra)">
          <Play className="h-4 w-4" />
        </IconeAcao>
        <IconeAcao onClick={onExcluir} label="Excluir link" perigo>
          <Trash2 className="h-4 w-4" />
        </IconeAcao>
        <IconeAcao onClick={onDetalhe} label="Detalhes das visitas">
          <ChevronRight className="h-4 w-4" />
        </IconeAcao>
      </div>
    </li>
  );
}

function IconeAcao({
  onClick,
  href,
  label,
  perigo,
  children,
}: {
  onClick?: () => void;
  href?: string;
  label: string;
  perigo?: boolean;
  children: React.ReactNode;
}) {
  const cls = `flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors ${
    perigo ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-neutral-100 hover:text-neutral-900"
  }`;
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" title={label} aria-label={label} className={cls}>
      {children}
    </a>
  ) : (
    <button type="button" onClick={onClick} title={label} aria-label={label} className={cls}>
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
  lead,
  onFechar,
}: {
  link: VideoLink;
  video: Video;
  lead: Lead | null;
  onFechar: () => void;
}) {
  const [sessoes, setSessoes] = useState<VideoSessao[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const fechar = useRef(onFechar);
  fechar.current = onFechar;
  const url = videoLinkUrl(link.slug);
  const wa = whatsappDoLead(lead, url);

  useEffect(() => {
    apiSessoes(link.id)
      .then(setSessoes)
      .catch((e) => setErro(e instanceof Error ? e.message : String(e)));
  }, [link.id]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && fechar.current();
    window.addEventListener("keydown", esc);
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", esc);
      document.body.style.overflow = antes;
    };
  }, []);

  const duracao = video.duracao_seg;
  // Todas as visitas juntas: o que a pessoa já viu do vídeo.
  const todos = useMemo(() => (sessoes ?? []).flatMap((s) => s.assistidos), [sessoes]);
  const vistos = new Set(todos).size;
  const pct = percentual(vistos, duracao);
  const st = STATUS[statusDe(link)];

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      prompt("Copie o link:", url);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-stretch sm:justify-end" onClick={onFechar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Visitas de ${link.destinatario}`}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-none sm:max-w-md sm:rounded-none"
      >
        <div className="border-b px-5 pb-4 pt-5" style={{ borderColor: BORDER }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar nome={link.destinatario} cor={st.fundo} />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-neutral-900">{link.destinatario}</p>
                <p className="truncate text-xs text-neutral-500">{video.titulo}</p>
              </div>
            </div>
            <button
              onClick={onFechar}
              aria-label="Fechar"
              className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => void copiar()}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              style={{ borderColor: BORDER }}
            >
              {copiado ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copiado ? "Copiado" : "Copiar link"}
            </button>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                style={{ borderColor: BORDER }}
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            )}
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              style={{ borderColor: BORDER }}
            >
              <Play className="h-3.5 w-3.5" /> Ver página
            </a>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          {sessoes === null && !erro && (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-neutral-100" />
              ))}
            </div>
          )}
          {sessoes?.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-neutral-900">Ainda não abriu</p>
              <p className="mt-1 text-sm text-neutral-500">
                Assim que abrir, você é avisado no e-mail e no grupo.
              </p>
            </div>
          )}

          {sessoes && sessoes.length > 0 && (
            <>
              <div className="rounded-xl p-4" style={{ background: "#F7F6F3" }}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Somando as {sessoes.length} {sessoes.length === 1 ? "visita" : "visitas"}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-4xl font-semibold tabular-nums tracking-tight text-neutral-900">
                    {statusDe(link) === "tudo" ? 100 : (pct ?? 0)}%
                  </p>
                  <p className="text-sm text-neutral-500">
                    {formatTempo(vistos)}
                    {duracao ? ` de ${formatTempo(duracao)}` : ""}
                  </p>
                </div>
                <MapaAssistido segundos={todos} duracao={duracao} />
              </div>

              <p className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Visitas
              </p>
              <div className="space-y-3">
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
  const total = duracao ?? (segundos.length ? Math.max(...segundos) + 1 : 1);
  const ts = trechos(segundos);
  return (
    <div className="mt-3">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-200/70">
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
  const resultado = !s.deu_play || s.assistidos.length === 0
    ? "Não assistiu"
    : s.chegou_ao_fim
      ? "Chegou ao fim"
      : `${pct !== null ? `${pct}% · ` : ""}parou em ${formatTempo(s.posicao_seg)}`;

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: BORDER }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100">
            <Icone className="h-4 w-4 text-neutral-500" />
          </span>
          <div>
            <p className="text-sm font-semibold text-neutral-900">{numero}ª visita</p>
            <p className="text-xs text-neutral-500">
              {inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} às{" "}
              {inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} ·{" "}
              {s.dispositivo === "celular" ? "celular" : "computador"}
            </p>
          </div>
        </div>
        <p className="shrink-0 text-right text-xs font-medium text-neutral-700">{resultado}</p>
      </div>
      {s.assistidos.length > 0 && <MapaAssistido segundos={s.assistidos} duracao={duracao} />}
      {s.eventos.length > 0 && (
        <ol className="mt-3 space-y-1.5 border-l pl-3" style={{ borderColor: BORDER }}>
          {s.eventos.map((e, i) => (
            <li key={i} className="flex gap-3 text-xs text-neutral-600">
              <span className="w-10 shrink-0 tabular-nums text-neutral-400">
                {new Date(e.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span>
                {ROTULO_EVENTO[e.tipo] ?? e.tipo}{" "}
                <span className="tabular-nums font-medium text-neutral-900">
                  {e.tipo === "voltou" || e.tipo === "pulou"
                    ? `${e.de_seg !== null ? `de ${formatTempo(e.de_seg)} ` : ""}para ${formatTempo(e.posicao_seg)}`
                    : `em ${formatTempo(e.posicao_seg)}`}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
