import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Check, Instagram, Play } from "lucide-react";
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
 * Vídeo dos cases: começa sozinho e sem som (regra dos navegadores). O play
 * discreto no meio volta ao início com a trilha e mostra os controles.
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
      {!comSom && (
        <button
          type="button"
          className="o-som"
          onClick={ligarSom}
          aria-label="Assistir com som"
          title="Assistir com som"
        >
          <Play aria-hidden="true" fill="currentColor" />
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
        .o-hero { padding-block: 20px 56px; position: relative; overflow: hidden; }
        .o-hero::before {
          content: ""; position: absolute; width: 900px; height: 700px; right: -260px; top: -320px;
          background: radial-gradient(closest-side, rgba(255,150,80,.14), rgba(255,150,80,0));
          pointer-events: none;
        }
        .o-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; position: relative; }
        .o-top img { height: 26px; width: auto; display: block; }
        .o-top a.o-voltar { color: var(--deep-muted); font-size: 14px; text-decoration: none; }
        .o-top a.o-voltar:hover { color: var(--deep-ink); }
        .o-ok {
          display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 600;
          letter-spacing: .14em; text-transform: uppercase; color: var(--lime); margin-bottom: 14px;
        }
        .o-ok i { width: 20px; height: 20px; border-radius: 50%; background: var(--lime); color: var(--ink); display: grid; place-items: center; }
        .o-ok svg { width: 12px; height: 12px; stroke-width: 3; }
        .o-h1 { font-size: 34px; position: relative; }
        .o-h1 em { font-style: normal; color: var(--lime); }
        .o-lead { font-size: 16px; line-height: 1.55; color: var(--deep-muted); margin-top: 14px !important; max-width: 54ch; position: relative; }
        .o-lead strong { color: var(--deep-ink); font-weight: 500; }

        .o-video {
          position: relative; margin-top: 32px; border-radius: 12px; overflow: hidden; background: #000;
          aspect-ratio: 16 / 9; box-shadow: 0 30px 80px -30px rgba(0,0,0,.85), 0 0 0 1px rgba(242,242,242,.08);
        }
        .o-video video { position: absolute; inset: 0; width: 100%; height: 100%; display: block; object-fit: cover; }
        .o-som {
          position: absolute; right: 12px; bottom: 12px;
          width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center;
          background: rgba(17,17,17,.38); color: #fff; cursor: pointer;
          border: 1px solid rgba(255,255,255,.35);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          transition: background .2s ease, transform .2s ease;
        }
        .o-som:hover { background: rgba(17,17,17,.55); transform: scale(1.06); }
        .o-som svg { width: 16px; height: 16px; margin-left: 2px; }

        .o-sec { padding-block: 56px; }
        .o-h2 { font-size: 28px; margin-bottom: 28px; }

        .o-passos { list-style: none; padding: 0; display: grid; }
        .o-passo { display: grid; grid-template-columns: 36px 1fr; column-gap: 14px; position: relative; padding-bottom: 24px; }
        .o-passo:last-child { padding-bottom: 0; }
        .o-passo::before {
          content: ""; position: absolute; left: 17px; top: 36px; bottom: 0; width: 1.5px; background: var(--line);
        }
        .o-passo:last-child::before { display: none; }
        .o-num {
          width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center;
          border: 1.5px solid rgba(17,17,17,.4); font-size: 13px; font-weight: 600; background: var(--paper);
          position: relative; font-variant-numeric: tabular-nums;
        }
        .o-passo.feito .o-num { background: var(--lime); border-color: var(--lime); }
        .o-passo.feito .o-num svg { width: 16px; height: 16px; stroke-width: 3; }
        .o-passo b { display: block; font-size: 17px; font-weight: 600; line-height: 1.3; padding-top: 7px; }
        .o-passo p { color: var(--muted); font-size: 15px; line-height: 1.5; margin-top: 4px !important; max-width: 40ch; }
        .o-tag {
          display: inline-block; margin-left: 8px; vertical-align: 2px; font-size: 10px; font-weight: 600;
          letter-spacing: .1em; text-transform: uppercase; padding: 3px 7px; border-radius: 4px;
          background: var(--ink); color: var(--lime);
        }
        .o-dica {
          margin-top: 32px !important; padding: 14px 18px; border-radius: 10px; background: var(--surface);
          font-size: 14px; line-height: 1.5; color: var(--muted); border-left: 3px solid var(--lime);
        }
        .o-dica strong { color: var(--ink); }

        .o-insta { display: grid; gap: 24px; align-items: center; }
        .o-insta .o-h2 { margin-bottom: 0; }
        .o-insta p { color: var(--deep-muted); font-size: 15px; max-width: 44ch; margin-top: 10px !important; }
        .o-botoes { display: flex; flex-direction: column; gap: 12px; align-items: stretch; }
        .o-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          background: var(--lime); color: var(--ink); font-weight: 600; font-size: 15px;
          padding: 14px 24px; border-radius: 10px; text-decoration: none; transition: transform .2s ease;
        }
        .o-btn:hover { transform: translateY(-2px); }
        .o-btn svg { width: 18px; height: 18px; }
        .o-btn2 { color: var(--deep-muted); font-weight: 500; font-size: 14px; text-align: center; text-decoration: underline; text-underline-offset: 4px; }
        .o-btn2:hover { color: var(--deep-ink); }

        @media (min-width: 768px) {
          .o-hero { padding-block: 28px 80px; }
          .o-top { margin-bottom: 56px; }
          .o-h1 { font-size: 48px; }
          .o-lead { font-size: 17px; }
          .o-video { margin-top: 40px; border-radius: 16px; }
          .o-som { right: 24px; bottom: 24px; width: 56px; height: 56px; }
          .o-som svg { width: 20px; height: 20px; }
          .o-sec { padding-block: 80px; }
          .o-h2 { font-size: 36px; margin-bottom: 40px; }
          .o-passos { grid-template-columns: repeat(4, 1fr); column-gap: 28px; }
          .o-passo { display: block; padding-bottom: 0; }
          .o-passo::before { left: 48px; right: -16px; top: 18px; bottom: auto; width: auto; height: 1.5px; }
          .o-passo.feito::before { background: var(--lime); }
          .o-passo b { padding-top: 18px; }
          .o-insta { grid-template-columns: 1.4fr 1fr; gap: 56px; }
          .o-botoes { align-items: flex-start; }
          .o-btn2 { text-align: left; }
        }
        @media (min-width: 1024px) {
          .o-h1 { font-size: 56px; }
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

        <section className="o-sec tone-paper">
          <div className="b-wrap">
            <p className="b-kicker">Próximos passos</p>
            <h2 className="b-d o-h2">O que acontece a partir de agora</h2>
            <ol className="o-passos">
              {PASSOS.map((p, i) => (
                <li key={p.t} className={`o-passo${p.feito ? " feito" : ""}`}>
                  <span className="o-num" aria-hidden="true">
                    {p.feito ? <Check /> : String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <b>
                      {p.t}
                      {p.feito && <span className="o-tag">Feito</span>}
                    </b>
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

        <section className="o-sec tone-deep">
          <div className="b-wrap o-insta">
            <div>
              <p className="b-kicker">Enquanto isso</p>
              <h2 className="b-d o-h2">Acompanhe a Legacy no Instagram</h2>
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
