import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { HideLovableBadge } from "@/components/HideLovableBadge";
import { CleanPlayer, carregarApi, type PlayerEventos } from "@/components/video/CleanPlayer";
import { AB_IGNORAR_KEY, visitanteId } from "@/lib/ab";

// Apresentação em vídeo para um lead. Pública, sem login, um link por pessoa.
// ssr:false de propósito: a prévia de link do WhatsApp não roda JavaScript,
// então não conta como "abriu".
export const Route = createFileRoute("/v/$slug")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Apresentação · Legacy BrandCo." },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow" },
      { name: "theme-color", content: "#0E0D0C" },
    ],
    // Abre as conexões com o YouTube antes do JavaScript da página chegar.
    links: [
      { rel: "preconnect", href: "https://www.youtube.com" },
      { rel: "preconnect", href: "https://www.youtube-nocookie.com" },
      { rel: "preconnect", href: "https://i.ytimg.com" },
      { rel: "preconnect", href: "https://www.google.com" },
      { rel: "preload", href: "/proposta/brand/legacy-logo-branco.webp", as: "image" },
    ],
  }),
  // Enquanto o JavaScript carrega: já no fundo escuro (sem piscar branco).
  pendingComponent: Esqueleto,
  component: VideoPage,
});

function Esqueleto() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0E0D0C] px-4">
      <div className="aspect-video w-full max-w-[1100px] animate-pulse rounded-xl bg-white/[0.06] md:rounded-2xl" />
    </div>
  );
}

const LOGO = "/proposta/brand/legacy-logo-branco.webp";
const ENVIO_MS = 10_000;

type Dados = {
  titulo: string;
  youtube_id: string;
  duracao_seg: number | null;
  destinatario: string;
  /** Vídeo genérico de proposta: mostra o botão para /p/:slug. */
  proposta_slug?: string | null;
  /** Link aberto (um link para muitas pessoas): pede nome e WhatsApp antes do play. */
  aberto?: boolean;
};

type Quem = { nome: string; whatsapp: string };
const QUEM_KEY = "lbc_v_quem";

function lerQuem(): Quem | null {
  try {
    const q = JSON.parse(localStorage.getItem(QUEM_KEY) ?? "null") as Quem | null;
    return q?.nome && q?.whatsapp ? q : null;
  } catch {
    return null;
  }
}

type Evento = {
  tipo: "play" | "pause" | "fim" | "voltou" | "pulou" | "proposta";
  posicao: number;
  de?: number;
};

function ehEquipe() {
  try {
    return localStorage.getItem(AB_IGNORAR_KEY) === "1";
  } catch {
    return false;
  }
}

function dispositivo(): "celular" | "computador" {
  const ua = navigator.userAgent;
  if (/iPhone|iPod|Android.+Mobile|Windows Phone/i.test(ua)) return "celular";
  if (window.matchMedia?.("(pointer: coarse)").matches && window.innerWidth < 900) return "celular";
  return "computador";
}

const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] ?? "";

function VideoPage() {
  const { slug } = Route.useParams();
  const [estado, setEstado] = useState<"carregando" | "nao_existe" | "ok">("carregando");
  const [dados, setDados] = useState<Dados | null>(null);
  const [equipe, setEquipe] = useState(false);
  const [quem, setQuem] = useState<Quem | null>(null);
  const [pedirQuem, setPedirQuem] = useState(false);
  const rastreio = useRastreio();
  const abrirCom = useRef<(q: Quem) => void>(() => {});

  useEffect(() => {
    let vivo = true;
    // Tudo em paralelo: API do YouTube, dados do vídeo e registro da visita.
    // O vídeo aparece assim que os dados chegam; a visita (que também dispara
    // o aviso da equipe) não segura a página.
    void carregarApi();
    const eq = ehEquipe();
    setEquipe(eq);
    const visitante = visitanteId();
    const post = (body: Record<string, unknown>) =>
      fetch("/api/public/video/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json());

    const abrir = (q?: Quem) =>
      post({ action: "abrir", slug, visitante, dispositivo: dispositivo(), ...(q ? { quem: q } : {}) })
        .then((j: { sessao_id?: string | null }) => {
          // O que foi assistido antes da resposta fica guardado e sai no próximo envio.
          if (vivo && j?.sessao_id) rastreio.iniciar(j.sessao_id, visitante);
        })
        .catch(() => {});
    abrirCom.current = (q) => {
      if (!eq) void abrir(q);
    };

    post({ action: "dados", slug })
      .then((j: { data: Dados | null }) => {
        if (!vivo) return;
        if (!j?.data) {
          setEstado("nao_existe");
          return;
        }
        // Link aberto: quem já se identificou neste navegador vai direto ao vídeo.
        if (j.data.aberto && !eq) {
          const q = lerQuem();
          if (q) {
            setQuem(q);
            void abrir(q);
          } else {
            setPedirQuem(true);
          }
        }
        setDados(j.data);
        setEstado("ok");
      })
      .catch(() => vivo && setEstado("nao_existe"));

    // Link por pessoa: a visita abre junto, sem esperar os dados.
    if (!eq) void abrir();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div
      className="lbc-video flex min-h-[100dvh] flex-col bg-[#0E0D0C] text-white"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <HideLovableBadge />
      {/* Celular deitado: some o que não é vídeo, para o vídeo ocupar a tela. */}
      <style>{`
        .lbc-video-palco { max-width: min(1100px, calc((100dvh - var(--lbc-reserva, 230px)) * 16 / 9)); min-width: min(100%, 320px); }
        @media (max-height: 520px) and (orientation: landscape) {
          .lbc-video-extra { display: none !important; }
          .lbc-video-palco { max-width: calc((100dvh - 24px) * 16 / 9); }
          .lbc-video-main { padding-top: 12px !important; padding-bottom: 12px !important; }
        }
      `}</style>

      <header className="lbc-video-extra flex items-center justify-between px-5 pt-5 md:px-10 md:pt-8">
        <img
          src={LOGO}
          alt="Legacy BrandCo."
          width={112}
          height={28}
          className="h-6 w-auto md:h-7"
          draggable={false}
        />
        {equipe && estado === "ok" && (
          <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-white/55">
            Modo equipe · não registra
          </span>
        )}
      </header>

      <main className="lbc-video-main flex flex-1 flex-col items-center justify-center px-4 py-6 md:px-10 md:py-10">
        {estado === "nao_existe" ? (
          <div className="max-w-sm text-center">
            <p className="text-lg font-semibold md:text-xl">Este link não está mais disponível.</p>
            <p className="mt-2 text-sm text-white/55">
              Fale com quem te enviou para receber um novo.
            </p>
          </div>
        ) : (
          <div
            className="lbc-video-palco w-full"
            style={dados?.proposta_slug ? ({ "--lbc-reserva": "310px" } as React.CSSProperties) : undefined}
          >
            <div className="lbc-video-extra mb-5 md:mb-7">
              {dados ? (
                <>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#CFFF87]/80">
                    {dados.aberto
                      ? quem
                        ? `Para ${primeiroNome(quem.nome)}`
                        : "Apresentação"
                      : primeiroNome(dados.destinatario)
                        ? `Para ${primeiroNome(dados.destinatario)}`
                        : "Apresentação"}
                  </p>
                  <h1 className="mt-2 text-xl font-semibold leading-tight tracking-tight text-balance md:text-3xl">
                    {dados.titulo}
                  </h1>
                </>
              ) : (
                <>
                  <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
                  <div className="mt-3 h-7 w-2/3 animate-pulse rounded bg-white/10" />
                </>
              )}
            </div>

            {dados && pedirQuem ? (
              <Identificacao
                onPronto={(q) => {
                  try {
                    localStorage.setItem(QUEM_KEY, JSON.stringify(q));
                  } catch {
                    // sem armazenamento: só pede de novo na próxima vez
                  }
                  setQuem(q);
                  setPedirQuem(false);
                  abrirCom.current(q);
                }}
              />
            ) : dados ? (
              <CleanPlayer
                youtubeId={dados.youtube_id}
                titulo={dados.titulo}
                duracaoConhecida={dados.duracao_seg}
                eventos={rastreio.eventos}
                chaveRetomar={`lbc_v_pos_${slug}`}
              />
            ) : (
              <div className="aspect-video w-full animate-pulse rounded-xl bg-white/[0.06] md:rounded-2xl" />
            )}

            {/* No link aberto, só depois da identificação: o clique precisa saber de quem é. */}
            {dados?.proposta_slug && !pedirQuem && (
              <div className="lbc-video-extra mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:mt-6">
                <p className="text-sm text-white/60">
                  Os detalhes e as formas de pagamento estão na proposta.
                </p>
                <a
                  href={`/p/${dados.proposta_slug}`}
                  target="_blank"
                  rel="noopener"
                  onClick={() => rastreio.proposta()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#CFFF87] px-5 py-3 text-sm font-semibold text-[#0E0D0C] transition-opacity hover:opacity-90"
                >
                  Ver a proposta completa
                  <span aria-hidden>→</span>
                </a>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="lbc-video-extra px-5 pb-5 text-center text-[11px] leading-relaxed text-white/30 md:pb-7">
        Legacy BrandCo. · A reprodução deste vídeo é registrada para acompanharmos o seu atendimento.
      </footer>
    </div>
  );
}

/** Link aberto: nome e WhatsApp antes do play, no lugar do vídeo. */
function Identificacao({ onPronto }: { onPronto: (q: Quem) => void }) {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [erro, setErro] = useState("");

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const n = nome.trim().replace(/\s+/g, " ");
    const digitos = whatsapp.replace(/\D/g, "");
    if (n.length < 2) return setErro("Escreva o seu nome.");
    if (digitos.length < 10 || digitos.length > 13) return setErro("Confira o WhatsApp, com DDD.");
    onPronto({ nome: n, whatsapp: digitos.length <= 11 ? `55${digitos}` : digitos });
  }

  const campo =
    "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-base text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#CFFF87]/70";

  return (
    <div className="flex w-full items-center justify-center rounded-xl bg-white/[0.04] px-5 py-8 md:aspect-video md:rounded-2xl">
      <form onSubmit={enviar} className="w-full max-w-sm">
        <p className="text-lg font-semibold leading-snug md:text-xl">Antes de começar, como podemos te chamar?</p>
        <p className="mt-1.5 text-sm text-white/55">
          São 5 minutos sobre como funciona o nosso trabalho, o que você recebe e o investimento.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <input
            className={campo}
            placeholder="Seu nome"
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            className={campo}
            placeholder="WhatsApp com DDD"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
          {erro && <p className="text-sm text-[#FFB4A0]">{erro}</p>}
          <button
            type="submit"
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#CFFF87] px-5 py-3 text-sm font-semibold text-[#0E0D0C] transition-opacity hover:opacity-90"
          >
            Assistir o vídeo <span aria-hidden>▶</span>
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Junta o que foi assistido e manda ao servidor de 10 em 10 s e nos momentos
 * que importam (pause, fim, pulo, sair da página). Sem sessão (equipe), nada
 * é enviado. Nunca atrapalha o vídeo.
 */
function useRastreio() {
  const sessao = useRef<string | null>(null);
  const visitante = useRef("");
  const segundos = useRef(new Set<number>());
  const eventos = useRef<Evento[]>([]);
  const posicao = useRef(0);
  const duracao = useRef<number | null>(null);
  const duracaoEnviada = useRef(false);
  const play = useRef(false);
  const fim = useRef(false);

  function enviar(saindo = false) {
    if (!sessao.current) return;
    const temDuracao = duracao.current && !duracaoEnviada.current;
    if (!segundos.current.size && !eventos.current.length && !play.current && !fim.current && !temDuracao)
      return;
    const corpo = {
      action: "progresso",
      sessao_id: sessao.current,
      visitante: visitante.current,
      segundos: [...segundos.current],
      posicao: posicao.current,
      duracao: duracao.current,
      play: play.current,
      fim: fim.current,
      eventos: eventos.current.slice(0, 50),
    };
    segundos.current = new Set();
    eventos.current = eventos.current.slice(50);
    play.current = false;
    fim.current = false;
    if (temDuracao) duracaoEnviada.current = true;
    try {
      void fetch("/api/public/video/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: saindo,
        body: JSON.stringify(corpo),
      }).catch(() => {});
    } catch {
      // medição nunca atrapalha o vídeo
    }
  }

  useEffect(() => {
    const id = window.setInterval(() => enviar(), ENVIO_MS);
    const sair = () => enviar(true);
    const oculto = () => document.visibilityState === "hidden" && enviar(true);
    window.addEventListener("pagehide", sair);
    document.addEventListener("visibilitychange", oculto);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("pagehide", sair);
      document.removeEventListener("visibilitychange", oculto);
      enviar(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlers: PlayerEventos = useMemo(
    () => ({
      onDuracao: (d) => {
        if (duracao.current !== d) {
          duracao.current = d;
          duracaoEnviada.current = false;
        }
      },
      onAmostra: (s) => {
        segundos.current.add(s);
        posicao.current = s;
      },
      onPlay: (p) => {
        play.current = true;
        posicao.current = p;
        eventos.current.push({ tipo: "play", posicao: p });
      },
      onPause: (p) => {
        posicao.current = p;
        eventos.current.push({ tipo: "pause", posicao: p });
        enviar();
      },
      onFim: (p) => {
        fim.current = true;
        posicao.current = p;
        eventos.current.push({ tipo: "fim", posicao: p });
        enviar();
      },
      onPulo: (de, para) => {
        posicao.current = para;
        eventos.current.push({ tipo: para < de ? "voltou" : "pulou", posicao: para, de });
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return {
    eventos: handlers,
    iniciar(id: string | null, v: string) {
      sessao.current = id;
      visitante.current = v;
    },
    /** Clicou em "Ver a proposta completa": registra na hora (a aba nova pode tirar o foco desta). */
    proposta() {
      eventos.current.push({ tipo: "proposta", posicao: posicao.current });
      enviar(true);
    },
  };
}
