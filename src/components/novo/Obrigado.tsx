import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Check, Instagram, Volume2 } from "lucide-react";
import { EstiloSite } from "@/components/novo/Estilo";
import { Footer, LOGO_LIGHT } from "@/components/novo/Site";

// Página de obrigado (/obrigado e /tks): vídeo dos cases + próximos passos.
// Cada rota cuida do próprio evento do Pixel; aqui é só o visual.

const INSTAGRAM = "https://www.instagram.com/legacybc.com.br";

const PASSOS = [
  {
    t: "Cadastro recebido",
    d: "Suas informações já chegaram para a nossa equipe.",
    feito: true,
  },
  {
    t: "Contato pelo WhatsApp",
    d: "Em até 1 dia útil, alguém do nosso time chama você no WhatsApp para combinar um horário.",
  },
  {
    t: "Reunião de 20 minutos",
    d: "Uma conversa por vídeo para entender o seu negócio e explicar como funciona o nosso processo.",
  },
  {
    t: "Proposta sob medida",
    d: "Você recebe uma proposta pensada para a sua marca, com escopo, prazos e investimento.",
  },
];

/**
 * Vídeo dos cases: começa sozinho e sem som (regra dos navegadores). O botão
 * "Assistir com som" volta ao início com a trilha e mostra os controles.
 */
function VideoCases() {
  const ref = useRef<HTMLVideoElement>(null);
  const [comSom, setComSom] = useState(false);

  function ligarSom() {
    const v = ref.current;
    if (!v) return;
    v.muted = false;
    v.loop = false;
    v.currentTime = 0;
    void v.play();
    setComSom(true);
  }

  return (
    <div className="o-video-wrap">
      <div className="o-video">
        <video
          ref={ref}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={comSom}
          poster="/video/legacy-cases-capa.jpg"
          aria-label="Vídeo: cases da Legacy BrandCo."
        >
          <source src="/video/legacy-cases-720.mp4" type="video/mp4" media="(max-width: 767px)" />
          <source src="/video/legacy-cases-1080.mp4" type="video/mp4" />
        </video>
      </div>
      {!comSom && (
        <button type="button" className="o-som" onClick={ligarSom}>
          <Volume2 aria-hidden="true" />
          Assistir com som
        </button>
      )}
    </div>
  );
}

export function PaginaObrigado() {
  return (
    <div className="lbc">
      <EstiloSite />
      <style>{`
        .o-hero { padding-block: 24px 64px; position: relative; overflow: hidden; }
        .o-hero::before {
          content: ""; position: absolute; width: 900px; height: 700px; right: -260px; top: -320px;
          background: radial-gradient(closest-side, rgba(255,150,80,.16), rgba(255,150,80,0));
          pointer-events: none;
        }
        .o-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 48px; position: relative; }
        .o-top img { height: 28px; width: auto; display: block; }
        .o-top a.o-voltar { color: var(--deep-muted); font-size: 14px; text-decoration: none; }
        .o-top a.o-voltar:hover { color: var(--deep-ink); }
        .o-ok {
          display: inline-flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600;
          letter-spacing: .14em; text-transform: uppercase; color: var(--lime); margin-bottom: 20px;
        }
        .o-ok i { width: 24px; height: 24px; border-radius: 50%; background: var(--lime); color: var(--ink); display: grid; place-items: center; }
        .o-ok svg { width: 14px; height: 14px; stroke-width: 3; }
        .o-h1 { font-size: 46px; position: relative; }
        .o-h1 em { font-style: normal; color: var(--lime); }
        .o-lead { font-size: 17px; line-height: 1.5; color: var(--deep-muted); margin-top: 18px !important; max-width: 52ch; position: relative; }
        .o-lead strong { color: var(--deep-ink); }

        .o-video-wrap { position: relative; margin-top: 40px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .o-video {
          position: relative; width: 100%; border-radius: 14px; overflow: hidden; background: #000;
          aspect-ratio: 16 / 9; box-shadow: 0 40px 100px -30px rgba(0,0,0,.9), 0 0 0 1px rgba(242,242,242,.08);
        }
        .o-video video { position: absolute; inset: 0; width: 100%; height: 100%; display: block; object-fit: cover; }
        .o-som {
          display: inline-flex; align-items: center; gap: 10px; white-space: nowrap;
          background: var(--lime); color: var(--ink); border: 0; cursor: pointer;
          font: inherit; font-weight: 600; font-size: 15px; padding: 12px 20px; border-radius: 999px;
          box-shadow: 0 10px 30px rgba(0,0,0,.35); transition: transform .2s ease;
        }
        .o-som:hover { transform: scale(1.04); }
        .o-som svg { width: 18px; height: 18px; }

        .o-passos { list-style: none; padding: 0; margin-top: 8px !important; display: grid; }
        .o-passo { display: grid; grid-template-columns: 48px 1fr; column-gap: 16px; position: relative; padding-bottom: 28px; }
        .o-passo:last-child { padding-bottom: 0; }
        .o-passo::before {
          content: ""; position: absolute; left: 23px; top: 48px; bottom: 0; width: 2px; background: var(--line);
        }
        .o-passo:last-child::before { display: none; }
        .o-num {
          width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center;
          border: 1.5px solid var(--ink); font-family: var(--display); font-size: 20px; background: var(--paper);
          position: relative;
        }
        .o-passo.feito .o-num { background: var(--lime); border-color: var(--lime); }
        .o-passo.feito .o-num svg { width: 22px; height: 22px; stroke-width: 3; }
        .o-passo b { display: block; font-family: var(--display); font-weight: 400; font-size: 28px; line-height: 1.05; padding-top: 10px; }
        .o-passo p { color: var(--muted); font-size: 16px; margin-top: 6px !important; max-width: 46ch; }
        .o-passo.feito b::after {
          content: "Feito"; font-family: "LBC Inter", Inter, sans-serif; font-size: 11px; font-weight: 600;
          letter-spacing: .12em; text-transform: uppercase; vertical-align: middle;
          margin-left: 12px; padding: 4px 8px; border-radius: 4px; background: var(--ink); color: var(--lime);
        }
        .o-dica {
          margin-top: 36px !important; padding: 18px 20px; border-radius: 12px; background: var(--surface);
          font-size: 15px; line-height: 1.5; border-left: 4px solid var(--lime);
        }

        .o-insta { display: grid; gap: 28px; align-items: center; }
        .o-insta p { color: var(--deep-muted); font-size: 17px; max-width: 44ch; margin-top: 14px !important; }
        .o-botoes { display: flex; flex-direction: column; gap: 14px; align-items: stretch; }
        .o-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          background: var(--lime); color: var(--ink); font-weight: 600; font-size: 16px;
          padding: 17px 28px; border-radius: 10px; text-decoration: none; transition: transform .2s ease;
        }
        .o-btn:hover { transform: translateY(-2px); }
        .o-btn svg { width: 20px; height: 20px; }
        .o-btn2 { color: var(--deep-ink); font-weight: 600; font-size: 15px; text-align: center; text-decoration: underline; text-underline-offset: 4px; }

        @media (min-width: 768px) {
          .o-hero { padding-block: 32px 96px; }
          .o-top { margin-bottom: 72px; }
          .o-h1 { font-size: 72px; }
          .o-lead { font-size: 19px; }
          .o-video-wrap { margin-top: 56px; }
          .o-video { border-radius: 18px; }
          .o-som { position: absolute; left: 50%; bottom: 28px; transform: translateX(-50%); font-size: 16px; padding: 14px 24px; }
          .o-som:hover { transform: translateX(-50%) scale(1.04); }
          .o-passos { grid-template-columns: repeat(4, 1fr); column-gap: 28px; }
          .o-passo { display: block; padding-bottom: 0; }
          .o-passo::before { left: 56px; right: -28px; top: 23px; bottom: auto; width: auto; height: 2px; }
          .o-passo.feito::before { background: var(--lime); }
          .o-passo b { padding-top: 22px; font-size: 30px; }
          .o-passo.feito b::after { display: block; width: fit-content; margin: 10px 0 0; }
          .o-insta { grid-template-columns: 1.3fr 1fr; gap: 64px; }
          .o-botoes { align-items: flex-start; }
          .o-btn2 { text-align: left; }
        }
        @media (min-width: 1024px) {
          .o-h1 { font-size: 88px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .o-btn, .o-som { transition: none; }
        }
      `}</style>

      <main>
        <section className="o-hero tone-deep">
          <div className="b-wrap">
            <div className="o-top">
              <Link to="/" aria-label="Legacy BrandCo. — Início">
                <img src={LOGO_LIGHT} alt="Legacy BrandCo." width={120} height={43} />
              </Link>
              <Link to="/" className="o-voltar">
                Voltar ao site
              </Link>
            </div>

            <p className="o-ok">
              <i>
                <Check aria-hidden="true" />
              </i>
              Cadastro recebido
            </p>
            <h1 className="b-d o-h1">
              Obrigado! Agora <em>é com a gente.</em>
            </h1>
            <p className="o-lead">
              Enquanto preparamos o seu atendimento, veja em menos de um minuto algumas das marcas
              que construímos. <strong>Em até 1 dia útil</strong> falamos com você no WhatsApp.
            </p>

            <VideoCases />
          </div>
        </section>

        <section className="b-sec tone-paper">
          <div className="b-wrap">
            <p className="b-kicker">Próximos passos</p>
            <h2 className="b-d b-h2">O que acontece a partir de agora</h2>
            <ol className="o-passos">
              {PASSOS.map((p, i) => (
                <li key={p.t} className={`o-passo${p.feito ? " feito" : ""}`}>
                  <span className="o-num" aria-hidden="true">
                    {p.feito ? <Check /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <b>{p.t}</b>
                    <p>{p.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="o-dica">
              <strong>Fique de olho no WhatsApp.</strong> A mensagem vem do número da Legacy
              BrandCo. Se preferir outro horário, é só responder por lá.
            </p>
          </div>
        </section>

        <section className="b-sec tone-deep">
          <div className="b-wrap o-insta">
            <div>
              <p className="b-kicker">Enquanto isso</p>
              <h2 className="b-d b-h2" style={{ marginBottom: 0 }}>
                Acompanhe a Legacy no Instagram
              </h2>
              <p>Bastidores dos projetos, cases novos e conteúdo sobre posicionamento de marca.</p>
            </div>
            <div className="o-botoes">
              <a className="o-btn" href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
                <Instagram aria-hidden="true" />
                Seguir @legacybc.com.br
              </a>
              <a href="/cases" className="o-btn2">
                Ver todos os cases
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
