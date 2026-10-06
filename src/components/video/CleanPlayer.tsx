import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { formatTempo, youtubeThumb } from "@/lib/video";

// Player do YouTube sem nada do YouTube na tela: sem título, sem logo, sem
// "vídeos relacionados", sem link para o youtube.com.
//   - controls=0 e controles próprios por cima;
//   - o iframe tem 3x a altura da caixa e fica centralizado: o vídeo (16:9)
//     aparece inteiro no meio e as barras do YouTube (título em cima, logo
//     embaixo) ficam fora da área visível;
//   - o primeiro toque (na nossa capa) atravessa até o player do YouTube, para
//     o navegador liberar o som; depois disso uma camada por cima do iframe
//     recebe todos os cliques e nada do YouTube é clicável;
//   - capa antes do play, tela própria no fim (cobre a grade de sugestões).

/* eslint-disable @typescript-eslint/no-explicit-any */
let apiPromise: Promise<any> | null = null;
/** Começa a baixar a API do YouTube. A página chama antes de saber qual é o vídeo. */
export function carregarApi(): Promise<any> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const w = window as any;
    if (w.YT?.Player) return resolve(w.YT);
    const anterior = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      anterior?.();
      resolve(w.YT);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  });
  return apiPromise;
}

const VELOCIDADES = [1, 1.25, 1.5, 2];
const ESCONDER_MS = 2600;

export type PlayerEventos = {
  onDuracao?: (seg: number) => void;
  onPlay?: (posicao: number) => void;
  onPause?: (posicao: number) => void;
  onFim?: (posicao: number) => void;
  /** Segundo do vídeo sendo assistido (várias vezes por segundo). */
  onAmostra?: (segundo: number) => void;
  /** A pessoa mudou de ponto pela barra ou pelo teclado. */
  onPulo?: (de: number, para: number) => void;
};

export function CleanPlayer({
  youtubeId,
  titulo,
  duracaoConhecida,
  eventos,
  chaveRetomar,
}: {
  youtubeId: string;
  titulo: string;
  duracaoConhecida?: number | null;
  eventos: PlayerEventos;
  /** localStorage onde guardar o ponto em que parou (um por link). */
  chaveRetomar?: string;
}) {
  const caixaRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const ev = useRef(eventos);
  ev.current = eventos;

  const [pronto, setPronto] = useState(false);
  const [comecou, setComecou] = useState(false);
  const [tocando, setTocando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [terminou, setTerminou] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [duracao, setDuracao] = useState(duracaoConhecida ?? 0);
  const [baixado, setBaixado] = useState(0);
  const [mudo, setMudo] = useState(false);
  const [velocidade, setVelocidade] = useState(1);
  const [controles, setControles] = useState(true);
  const [telaCheia, setTelaCheia] = useState(false);
  const [telaCheiaFalsa, setTelaCheiaFalsa] = useState(false);
  // Tocou na capa e o vídeo ainda não começou: mostra "carregando" na hora.
  const [iniciando, setIniciando] = useState(false);
  // O navegador não deixou ligar o som sozinho: mostra o botão "Ativar som".
  const [somBloqueado, setSomBloqueado] = useState(false);
  // Retomou de onde a pessoa tinha parado numa visita anterior (segundo).
  const [retomadoDe, setRetomadoDe] = useState<number | null>(null);
  const [arrastando, setArrastando] = useState<number | null>(null);
  const [capaQ, setCapaQ] = useState<"maxres" | "hq">("maxres");

  const parado = useRef(true);
  const jaComecou = useRef(false);
  const esconderTimer = useRef<number | null>(null);
  const ultimoSalvo = useRef(0);

  // ─── Continuar de onde parou ─────────────────────────────────────────────
  const chaveRef = useRef(chaveRetomar);
  chaveRef.current = chaveRetomar;
  function lerPosicao(): number {
    try {
      return chaveRef.current ? Number(localStorage.getItem(chaveRef.current)) || 0 : 0;
    } catch {
      return 0;
    }
  }
  function salvarPosicao(seg: number, dur: number) {
    if (!chaveRef.current || Math.abs(seg - ultimoSalvo.current) < 3) return;
    ultimoSalvo.current = seg;
    try {
      if (seg > 15 && (!dur || seg < dur - 15)) localStorage.setItem(chaveRef.current, String(seg));
    } catch {
      // sem localStorage: só não retoma
    }
  }
  function esquecerPosicao() {
    try {
      if (chaveRef.current) localStorage.removeItem(chaveRef.current);
    } catch {
      // idem
    }
  }

  /**
   * Primeira vez que o vídeo começa: garante o som, devolve o foco para os
   * atalhos de teclado e retoma de onde a pessoa parou numa visita anterior.
   * Só usa refs e setters (roda dentro do evento do YouTube).
   */
  function primeiroPlay(p: any) {
    try {
      if (p.isMuted?.()) p.unMute();
      if ((p.getVolume?.() ?? 100) < 10) p.setVolume(100);
    } catch {
      // segue
    }
    window.setTimeout(() => {
      const m = !!playerRef.current?.isMuted?.();
      setMudo(m);
      setSomBloqueado(m);
    }, 800);
    caixaRef.current?.focus({ preventScroll: true });

    const salvo = lerPosicao();
    const d = p.getDuration?.() ?? 0;
    if (salvo > 15 && (!d || salvo < d - 15)) {
      p.seekTo(salvo, true);
      setTempo(salvo);
      setRetomadoDe(salvo);
      window.setTimeout(() => setRetomadoDe(null), 7000);
    }
  }

  // ─── YouTube ────────────────────────────────────────────────────────────
  useEffect(() => {
    let vivo = true;
    const host = hostRef.current;
    carregarApi().then((YT) => {
      if (!vivo || !host) return;
      // O YouTube troca este elemento pelo iframe; criado aqui (fora do
      // React) para o React nunca tentar mexer num nó que não existe mais.
      const alvo = document.createElement("div");
      host.appendChild(alvo);
      playerRef.current = new YT.Player(alvo, {
        videoId: youtubeId,
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          cc_load_policy: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            if (!vivo) return;
            setPronto(true);
            const d = Math.round(e.target.getDuration?.() ?? 0);
            if (d > 0) {
              setDuracao(d);
              ev.current.onDuracao?.(d);
            }
          },
          onStateChange: (e: any) => {
            if (!vivo) return;
            const p = e.target;
            const pos = Math.floor(p.getCurrentTime?.() ?? 0);
            // 1 tocando, 2 pausado, 0 fim, 3 carregando
            if (e.data === 1) {
              setIniciando(false);
              if (!jaComecou.current) {
                jaComecou.current = true;
                primeiroPlay(p);
              }
              setComecou(true);
              setTocando(true);
              setCarregando(false);
              setTerminou(false);
              const d = Math.round(p.getDuration?.() ?? 0);
              if (d > 0) {
                setDuracao(d);
                ev.current.onDuracao?.(d);
              }
              // Depois de um pulo na barra o YouTube volta a "tocando": só
              // conta como play quando vinha de pausa/fim/início.
              if (parado.current) ev.current.onPlay?.(pos);
              parado.current = false;
            } else if (e.data === 2) {
              if (!parado.current) ev.current.onPause?.(pos);
              parado.current = true;
              setTocando(false);
              setCarregando(false);
            } else if (e.data === 0) {
              parado.current = true;
              setTocando(false);
              setCarregando(false);
              setTerminou(true);
              esquecerPosicao();
              ev.current.onFim?.(Math.round(p.getDuration?.() ?? pos));
            } else if (e.data === 3) {
              setCarregando(true);
              if (!jaComecou.current) setIniciando(true);
            }
          },
        },
      });
    });
    return () => {
      vivo = false;
      try {
        playerRef.current?.destroy?.();
      } catch {
        // já destruído
      }
      playerRef.current = null;
      if (host) host.innerHTML = "";
    };
  }, [youtubeId]);

  // Amostragem enquanto toca: tempo na tela + segundos assistidos.
  useEffect(() => {
    if (!tocando) return;
    const id = window.setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      const t = p.getCurrentTime();
      setTempo(t);
      setBaixado(p.getVideoLoadedFraction?.() ?? 0);
      // O ícone de som segue o estado real do player.
      const m = p.isMuted?.();
      if (typeof m === "boolean") setMudo(m);
      ev.current.onAmostra?.(Math.floor(t));
      salvarPosicao(Math.floor(t), p.getDuration?.() ?? 0);
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tocando]);

  // Tocar na capa = tocar dentro do iframe do YouTube (o toque passa pela
  // capa). A janela perde o foco para o iframe: é o sinal para mostrar
  // "carregando" na hora, antes do YouTube responder.
  // O YouTube só começa sozinho quando o toque cai no botão de play dele (o
  // meio da capa, embaixo do nosso botão verde). Se o toque caiu em outro
  // ponto da capa, mandamos o play logo em seguida — o toque já aconteceu
  // dentro do player, então o som continua liberado.
  useEffect(() => {
    if (comecou) return;
    const aoPerderFoco = () => {
      window.setTimeout(() => {
        if (!hostRef.current?.contains(document.activeElement)) return;
        setIniciando(true);
        window.setTimeout(() => {
          const p = playerRef.current;
          const estado = p?.getPlayerState?.();
          if (!jaComecou.current && estado !== 1 && estado !== 3) p?.playVideo?.();
        }, 600);
      }, 0);
    };
    window.addEventListener("blur", aoPerderFoco);
    return () => window.removeEventListener("blur", aoPerderFoco);
  }, [comecou]);

  // Se o YouTube não responder ao toque em alguns segundos, volta o botão.
  useEffect(() => {
    if (!iniciando || comecou) return;
    const t = window.setTimeout(() => setIniciando(false), 8000);
    return () => window.clearTimeout(t);
  }, [iniciando, comecou]);

  // ─── Ações ──────────────────────────────────────────────────────────────
  const mostrarControles = useCallback(() => {
    setControles(true);
    if (esconderTimer.current) window.clearTimeout(esconderTimer.current);
    esconderTimer.current = window.setTimeout(() => setControles(false), ESCONDER_MS);
  }, []);

  useEffect(() => {
    if (!tocando) {
      setControles(true);
      if (esconderTimer.current) window.clearTimeout(esconderTimer.current);
    } else mostrarControles();
  }, [tocando, mostrarControles]);

  // Play pelos nossos controles (pause/continuar, teclado, "assistir de novo").
  // Depois do primeiro toque dentro do player, o navegador já libera o som.
  const tocar = useCallback(() => {
    const p = playerRef.current;
    if (!p?.playVideo) return;
    p.playVideo();
  }, []);

  const ativarSom = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    p.unMute();
    if ((p.getVolume?.() ?? 100) < 10) p.setVolume(100);
    setMudo(false);
    setSomBloqueado(false);
  }, []);

  const voltarAoInicio = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    const de = Math.floor(p.getCurrentTime?.() ?? 0);
    p.seekTo(0, true);
    setTempo(0);
    setRetomadoDe(null);
    ev.current.onPulo?.(de, 0);
  }, []);

  const alternar = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (terminou) return;
    if (tocando) p.pauseVideo();
    else tocar();
  }, [tocando, terminou, tocar]);

  const irPara = useCallback(
    (seg: number) => {
      const p = playerRef.current;
      if (!p?.seekTo || !duracao) return;
      const de = Math.floor(p.getCurrentTime?.() ?? tempo);
      const para = Math.max(0, Math.min(duracao - 0.5, seg));
      p.seekTo(para, true);
      setTempo(para);
      if (terminou) setTerminou(false);
      if (Math.abs(para - de) >= 2) ev.current.onPulo?.(de, Math.floor(para));
    },
    [duracao, tempo, terminou],
  );

  const deNovo = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    p.seekTo(0, true);
    setTempo(0);
    setTerminou(false);
    tocar();
  }, [tocar]);

  const alternarMudo = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      setMudo(false);
      setSomBloqueado(false);
    } else {
      p.mute();
      setMudo(true);
    }
  }, []);

  const trocarVelocidade = useCallback(() => {
    const p = playerRef.current;
    const prox = VELOCIDADES[(VELOCIDADES.indexOf(velocidade) + 1) % VELOCIDADES.length];
    p?.setPlaybackRate?.(prox);
    setVelocidade(prox);
  }, [velocidade]);

  // Tela cheia de verdade onde existe; no iPhone (sem Fullscreen API para
  // div), ocupa a janela inteira.
  const alternarTelaCheia = useCallback(() => {
    const el = caixaRef.current as any;
    const doc = document as any;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc);
      return;
    }
    if (telaCheiaFalsa) {
      setTelaCheiaFalsa(false);
      return;
    }
    const pedir = el?.requestFullscreen ?? el?.webkitRequestFullscreen;
    if (pedir) {
      Promise.resolve(pedir.call(el))
        .then(() => (screen.orientation as any)?.lock?.("landscape").catch(() => {}))
        .catch(() => setTelaCheiaFalsa(true));
    } else setTelaCheiaFalsa(true);
  }, [telaCheiaFalsa]);

  useEffect(() => {
    const doc = document as any;
    const f = () => setTelaCheia(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
    document.addEventListener("fullscreenchange", f);
    document.addEventListener("webkitfullscreenchange", f);
    return () => {
      document.removeEventListener("fullscreenchange", f);
      document.removeEventListener("webkitfullscreenchange", f);
    };
  }, []);

  useEffect(() => {
    if (!telaCheiaFalsa) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setTelaCheiaFalsa(false);
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener("keydown", esc);
    };
  }, [telaCheiaFalsa]);

  function teclado(e: React.KeyboardEvent) {
    if (!comecou) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        tocar();
      }
      return;
    }
    const k = e.key.toLowerCase();
    if (k === " " || k === "k") {
      e.preventDefault();
      alternar();
    } else if (k === "arrowright") {
      e.preventDefault();
      irPara(tempo + 5);
    } else if (k === "arrowleft") {
      e.preventDefault();
      irPara(tempo - 5);
    } else if (k === "f") alternarTelaCheia();
    else if (k === "m") alternarMudo();
    mostrarControles();
  }

  // Toque no vídeo: no celular, o primeiro toque só mostra os controles.
  function cliqueNoVideo(e: React.PointerEvent) {
    if (e.pointerType === "touch" && tocando && !controles) {
      mostrarControles();
      return;
    }
    alternar();
    if (e.pointerType === "touch") mostrarControles();
  }

  // ─── Barra de progresso ─────────────────────────────────────────────────
  const barraRef = useRef<HTMLDivElement>(null);
  const posNaBarra = (clientX: number) => {
    const r = barraRef.current?.getBoundingClientRect();
    if (!r || !duracao) return 0;
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * duracao;
  };

  const mostrado = arrastando ?? tempo;
  const pct = duracao ? (mostrado / duracao) * 100 : 0;
  const cheia = telaCheia || telaCheiaFalsa;
  const esconder = comecou && tocando && !controles && arrastando === null;

  return (
    <div
      ref={caixaRef}
      tabIndex={0}
      onKeyDown={teclado}
      onPointerMove={(e) => e.pointerType === "mouse" && comecou && mostrarControles()}
      onMouseLeave={() => tocando && setControles(false)}
      aria-label={`Vídeo: ${titulo}`}
      className={`select-none bg-black outline-none focus-visible:ring-2 focus-visible:ring-[#CFFF87] ${
        telaCheiaFalsa ? "fixed inset-0 z-50" : "relative w-full"
      } ${
        cheia
          ? "flex h-full w-full items-center justify-center"
          : "overflow-hidden rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] md:rounded-2xl"
      }`}
      style={{ cursor: esconder ? "none" : "default" }}
    >
      {/* A tela é sempre 16:9; na tela cheia fica centralizada (tarjas pretas
          em telas mais largas ou mais altas, nunca corta o vídeo). */}
      <div
        className="relative overflow-hidden"
        style={{
          aspectRatio: "16 / 9",
          width: cheia ? "min(100%, calc(100dvh * 16 / 9))" : "100%",
        }}
      >
        {/* Iframe do YouTube: 3x mais alto, centralizado. Antes do primeiro
            play ele recebe o toque (que atravessa a capa): o navegador só
            libera o som quando o play nasce de um toque dentro do player.
            A área visível é só o meio do iframe, onde fica o play do
            YouTube: título, logo e links estão fora da tela. Depois que
            começa, nada do YouTube recebe clique. */}
        <div
          ref={hostRef}
          className="absolute left-0 w-full [&_iframe]:h-full [&_iframe]:w-full"
          style={{ top: "-100%", height: "300%", pointerEvents: comecou ? "none" : "auto" }}
        >
        </div>

        {/* Camada de clique dos nossos controles */}
        {comecou && (
          <div className="absolute inset-0" onPointerUp={cliqueNoVideo} onDoubleClick={alternarTelaCheia} />
        )}

        {/* Carregando */}
        {comecou && carregando && !terminou && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-white" />
          </div>
        )}

        {/* Pausado: botão no centro */}
        {comecou && !tocando && !terminou && !carregando && (
          <button
            onClick={tocar}
            aria-label="Continuar"
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-transform hover:scale-105 md:h-20 md:w-20"
          >
            <Play className="ml-1 h-7 w-7 md:h-8 md:w-8" fill="currentColor" />
          </button>
        )}

        {/* Capa antes do primeiro play. Só visual: o toque atravessa para o
            player (ver acima). */}
        {!comecou && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 text-white"
          >
            <img
              src={youtubeThumb(youtubeId, capaQ)}
              onError={() => setCapaQ("hq")}
              // Sem capa em alta, o YouTube devolve uma imagem cinza de 120px.
              onLoad={(e) => e.currentTarget.naturalWidth <= 120 && setCapaQ("hq")}
              alt=""
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/40" />
            <span className="relative flex items-center justify-center">
              {pronto && !iniciando && (
                <span className="lbc-pulso absolute inset-0 rounded-full bg-[#CFFF87]" />
              )}
              <span
                className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-[#CFFF87] text-[#121110] shadow-[0_10px_40px_rgba(207,255,135,0.35)] md:h-24 md:w-24 ${
                  pronto ? "" : "opacity-70"
                }`}
              >
                {pronto && !iniciando ? (
                  <Play className="ml-1 h-7 w-7 md:h-10 md:w-10" fill="currentColor" />
                ) : (
                  <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#121110]/25 border-t-[#121110] md:h-8 md:w-8" />
                )}
              </span>
            </span>
            <span className="relative flex items-center gap-2 rounded-full bg-black/50 px-3.5 py-1.5 text-xs font-medium text-white/95 backdrop-blur-sm md:text-sm">
              {iniciando ? (
                "Carregando..."
              ) : (
                <>
                  Assistir
                  {duracao > 0 && <span className="tabular-nums text-white/70">· {formatTempo(duracao)}</span>}
                </>
              )}
            </span>
            <style>{`
              @keyframes lbc-pulso { 0% { transform: scale(1); opacity: .45 } 80%, 100% { transform: scale(1.55); opacity: 0 } }
              .lbc-pulso { animation: lbc-pulso 2s cubic-bezier(.2,.6,.3,1) infinite; }
              @media (prefers-reduced-motion: reduce) { .lbc-pulso { animation: none; opacity: 0; } }
            `}</style>
          </div>
        )}

        {/* O navegador não deixou ligar o som sozinho */}
        {comecou && somBloqueado && !terminou && (
          <button
            onClick={ativarSom}
            className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#121110] shadow-lg md:top-6"
          >
            <Volume2 className="h-4 w-4" />
            Ativar som
          </button>
        )}

        {/* Retomou de onde parou */}
        {comecou && retomadoDe !== null && !somBloqueado && !terminou && (
          <div className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full bg-black/75 py-1.5 pl-4 pr-1.5 text-xs text-white backdrop-blur-sm md:top-6 md:text-sm">
            <span>Continuando de {formatTempo(retomadoDe)}</span>
            <button
              onClick={voltarAoInicio}
              className="rounded-full bg-white/15 px-3 py-1 font-medium hover:bg-white/25"
            >
              Voltar ao início
            </button>
          </div>
        )}

        {/* Fim: cobre a grade de sugestões do YouTube */}
        {terminou && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-[#0E0D0C] px-6 text-center text-white">
            <p className="text-lg font-semibold md:text-2xl">Obrigado por assistir.</p>
            <button
              onClick={deNovo}
              className="flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" />
              Assistir de novo
            </button>
          </div>
        )}

        {/* Controles */}
        {comecou && !terminou && (
          <div
            className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-2 pt-10 transition-opacity duration-300 md:px-5 md:pb-3 ${
              esconder ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <div
              ref={barraRef}
              role="slider"
              aria-label="Posição do vídeo"
              aria-valuemin={0}
              aria-valuemax={Math.round(duracao)}
              aria-valuenow={Math.round(mostrado)}
              className="group/barra relative flex h-5 cursor-pointer touch-none items-center"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setArrastando(posNaBarra(e.clientX));
              }}
              onPointerMove={(e) => arrastando !== null && setArrastando(posNaBarra(e.clientX))}
              onPointerUp={(e) => {
                if (arrastando === null) return;
                irPara(posNaBarra(e.clientX));
                setArrastando(null);
                mostrarControles();
              }}
              onPointerCancel={() => setArrastando(null)}
            >
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/25 transition-[height] group-hover/barra:h-1.5">
                <div className="absolute inset-y-0 left-0 bg-white/30" style={{ width: `${baixado * 100}%` }} />
                <div className="absolute inset-y-0 left-0 bg-[#CFFF87]" style={{ width: `${pct}%` }} />
              </div>
              <div
                className={`absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-[#CFFF87] shadow transition-transform ${
                  arrastando !== null ? "scale-110" : "scale-100 md:scale-0 md:group-hover/barra:scale-100"
                }`}
                style={{ left: `${pct}%` }}
              />
            </div>

            <div className="mt-1 flex items-center gap-1 text-white md:gap-2">
              <BotaoControle onClick={alternar} label={tocando ? "Pausar" : "Assistir"}>
                {tocando ? (
                  <Pause className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Play className="h-5 w-5" fill="currentColor" />
                )}
              </BotaoControle>
              <BotaoControle onClick={alternarMudo} label={mudo ? "Ativar som" : "Tirar som"}>
                {mudo ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </BotaoControle>
              <span className="ml-1 text-xs tabular-nums text-white/85 md:text-sm">
                {formatTempo(mostrado)}
                <span className="text-white/45"> / {formatTempo(duracao)}</span>
              </span>
              <span className="flex-1" />
              <BotaoControle onClick={trocarVelocidade} label="Velocidade">
                <span className="min-w-[2.25rem] text-xs font-semibold tabular-nums md:text-sm">
                  {String(velocidade).replace(".", ",")}x
                </span>
              </BotaoControle>
              <BotaoControle onClick={alternarTelaCheia} label={cheia ? "Sair da tela cheia" : "Tela cheia"}>
                {cheia ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </BotaoControle>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BotaoControle({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-10 min-w-10 items-center justify-center rounded-md px-1.5 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  );
}
