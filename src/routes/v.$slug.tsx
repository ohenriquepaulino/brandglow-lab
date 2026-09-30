import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { HideLovableBadge } from "@/components/HideLovableBadge";
import { CleanPlayer, type PlayerEventos } from "@/components/video/CleanPlayer";
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
  }),
  component: VideoPage,
});

const LOGO = "/proposta/brand/legacy-logo-branco.webp";
const ENVIO_MS = 10_000;

type Dados = {
  titulo: string;
  youtube_id: string;
  duracao_seg: number | null;
  destinatario: string;
};

type Evento = { tipo: "play" | "pause" | "fim" | "voltou" | "pulou"; posicao: number; de?: number };

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
  const rastreio = useRastreio();

  useEffect(() => {
    let vivo = true;
    const eq = ehEquipe();
    setEquipe(eq);
    const visitante = visitanteId();
    fetch("/api/public/video/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "abrir",
        slug,
        visitante,
        dispositivo: dispositivo(),
        equipe: eq,
      }),
    })
      .then((r) => r.json())
      .then((j: { data: Dados | null; sessao_id?: string | null }) => {
        if (!vivo) return;
        if (!j?.data) {
          setEstado("nao_existe");
          return;
        }
        setDados(j.data);
        rastreio.iniciar(j.sessao_id ?? null, visitante);
        setEstado("ok");
      })
      .catch(() => vivo && setEstado("nao_existe"));
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
        .lbc-video-palco { max-width: min(1100px, calc((100dvh - 230px) * 16 / 9)); min-width: min(100%, 320px); }
        @media (max-height: 520px) and (orientation: landscape) {
          .lbc-video-extra { display: none !important; }
          .lbc-video-palco { max-width: calc((100dvh - 24px) * 16 / 9); }
          .lbc-video-main { padding-top: 12px !important; padding-bottom: 12px !important; }
        }
      `}</style>

      <header className="lbc-video-extra flex items-center justify-between px-5 pt-5 md:px-10 md:pt-8">
        <img src={LOGO} alt="Legacy BrandCo." className="h-6 w-auto md:h-7" draggable={false} />
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
          <div className="lbc-video-palco w-full">
            <div className="lbc-video-extra mb-5 md:mb-7">
              {dados ? (
                <>
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#CFFF87]/80">
                    {primeiroNome(dados.destinatario)
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

            {dados ? (
              <CleanPlayer
                youtubeId={dados.youtube_id}
                titulo={dados.titulo}
                duracaoConhecida={dados.duracao_seg}
                eventos={rastreio.eventos}
              />
            ) : (
              <div className="aspect-video w-full animate-pulse rounded-xl bg-white/[0.06] md:rounded-2xl" />
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
  };
}
