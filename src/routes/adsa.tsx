import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ContactSection } from "@/components/site/ContactSection";
import { PrivacyButton } from "@/components/site/PrivacyDialog";
import { useAbVisit } from "@/lib/ab";
import { useStickyCta } from "@/lib/useStickyCta";
import logo from "@/assets/logo-legacy-v2.png.asset.json";
import img308OutBanner from "@/assets/308-network/308-network-out-banner.webp.asset.json";
import imgMoewaPosterManifesto from "@/assets/ads/moewa-poster-manifesto.webp.asset.json";
import imgGeri from "@/assets/geriacademy/geriacademy-page-0060.webp.asset.json";
import imgJoanaBillboardQuote from "@/assets/joana-ulmer/joana-ulmer-billboard-quote.webp.asset.json";
import print1 from "@/assets/ads/IMG_1693.webp.asset.json";
import print2 from "@/assets/ads/IMG_1694.webp.asset.json";
import print3 from "@/assets/ads/IMG_1695.webp.asset.json";
import print4 from "@/assets/ads/IMG_1696.webp.asset.json";
import print5 from "@/assets/ads/IMG_1697.webp.asset.json";

// Versão A do teste A/B (antiga /ads). As campanhas apontam para /ads, que
// sorteia entre esta página e a /adsb — ver src/lib/ab.ts.
export const Route = createFileRoute("/adsa")({
  head: () => ({
    meta: [
      { title: "Diagnóstico de marca | Legacy BrandCo." },
      {
        name: "description",
        content:
          "Consultoria de estratégia de marca e identidade visual. Preencha o formulário e receba um diagnóstico da sua marca.",
      },
      { property: "og:title", content: "Diagnóstico de marca | Legacy BrandCo." },
      {
        property: "og:description",
        content:
          "Estratégia de marca e identidade visual para negócios que já entregam resultado.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: AdsPage,
});

/* SUBSTITUIR: prints de depoimentos. Editar array abaixo. */
const depoimentos = [
  { src: print1.url, w: 900, h: 1314, alt: "Mensagem de cliente elogiando o projeto" },
  { src: print4.url, w: 900, h: 495, alt: "Mensagem de cliente sobre identidade visual" },
  { src: print2.url, w: 900, h: 1035, alt: "Mensagem de cliente sobre o resultado" },
  { src: print5.url, w: 900, h: 722, alt: "Mensagem de cliente elogiando o trabalho" },
  { src: print3.url, w: 900, h: 329, alt: "Mensagem de cliente sobre expectativas superadas" },
];

const heroSlides = [
  { src: img308OutBanner.url, nome: "308NETWORK", seg: "Decisões patrimoniais" },
  { src: imgMoewaPosterManifesto.url, nome: "MOEWA", seg: "Estética e longevidade" },
  { src: imgGeri.url, nome: "Geriacademy", seg: "Educação médica" },
  { src: imgJoanaBillboardQuote.url, nome: "Joana co*", seg: "Educação financeira" },
];

const PASSOS = [
  { n: "01", t: "Você preenche", d: "Leva menos de um minuto." },
  { n: "02", t: "Analisamos seu perfil", d: "Chegamos na conversa sabendo do seu negócio." },
  {
    n: "03",
    t: "Diagnóstico de 25 min",
    d: "Por vídeo. Mostramos onde sua marca perde valor e o que resolver primeiro, contratando ou não.",
  },
];

function AdsSlider() {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % heroSlides.length;
        setLoaded((l) => Math.max(l, next + 1));
        return next;
      });
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <a href="#formulario" className="ads-slider-link" aria-label="Ir para o formulário">
      <div className="ads-slider">
        {heroSlides.slice(0, loaded).map((s, i) => (
          <img
            key={s.src}
            src={s.src}
            alt=""
            aria-hidden="true"
            width={1600}
            height={900}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            {...(i === 0 ? { fetchPriority: "high" as const } : {})}
            style={{ opacity: i === index ? 1 : 0 }}
          />
        ))}
        <div className="ads-slider-cap">
          <span className="ads-slider-seg">{heroSlides[index]!.seg}</span>
          <span className="ads-slider-nome">{heroSlides[index]!.nome}</span>
          <span className="ads-slider-dots" aria-hidden="true">
            {heroSlides.map((s, i) => (
              <i key={s.src} className={i === index ? "on" : ""} />
            ))}
          </span>
        </div>
      </div>
    </a>
  );
}



function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="ads-label">{children}</p>
  );
}

// Mesmo formulário e mesma oferta do /adsb: o teste compara a página, não a oferta.
function FormSlot() {
  return (
    <div className="ads-card ads-form-slot">
      <p className="ads-form-title">Diagnóstico gratuito</p>
      <p className="ads-form-sub">Preencha e agendamos 25 minutos por vídeo com você.</p>
      <ContactSection
        redirectTo="/obrigado"
        redirectToNoRevenue="/tks"
        hideInstagram
        showProfession
        revenueLabel="Faturamento mensal da empresa"
        ctaLabel="Quero meu diagnóstico"
        ctaNote="Gratuito · 25 min por vídeo · resposta em até 1 dia útil"
      />
    </div>
  );
}

function AdsPage() {
  useAbVisit("a");
  const sticky = useStickyCta(".ads-first, .ads-last, .ads-footer");
  return (
    <div className="ads-page">
      <header className="ads-topbar">
        <div className="ads-container ads-topbar-inner">
          <img
            src={logo.url}
            alt="Legacy BrandCo."
            className="ads-logo"
            width={160}
            height={32}
            loading="eager"
          />
        </div>
      </header>

      <main>
        {/* Dobra com formulário */}
        <section className="ads-section ads-first">
          <div className="ads-container ads-hero-grid">
            <div className="ads-hero-copy">
              <Label>CONSULTORIA DE MARCA</Label>
              <h1 className="ads-h1">
                Construímos a <strong>estratégia</strong> e a{" "}
                <strong>identidade visual</strong> da sua empresa
              </h1>
              <p className="ads-body ads-measure">
                Em <strong>poucos dias</strong> você sai com sua identidade
                visual renovada e com a <strong>comunicação clara</strong> para
                poder atender melhor seus clientes e <strong>vender mais</strong>
              </p>
              <ul className="ads-facts">
                <li>
                  <b>+8</b> anos de operação
                </li>
                <li>
                  <b>BR</b> clientes em todo o Brasil
                </li>
                <li>
                  <b>80%</b> estratégia
                </li>
              </ul>
            </div>
            <FormSlot />
          </div>
        </section>

        {/* Slider full-bleed com imagens dos cases */}
        <section className="ads-fullbleed">
          <AdsSlider />
        </section>

        {/* Como funciona */}
        <section className="ads-section">
          <div className="ads-container">
            <Label>COMO FUNCIONA</Label>
            <h2 className="ads-h2">
              Três passos até o seu <strong>diagnóstico</strong>
            </h2>
            <ol className="ads-steps">
              {PASSOS.map((p) => (
                <li key={p.n}>
                  <span className="ads-step-num">{p.n}</span>
                  <p className="ads-h3">{p.t}</p>
                  <p className="ads-body ads-secondary">{p.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Sobre */}
        <section className="ads-section">
          <div className="ads-container ads-about">
            <div className="ads-about-cols">
              <div>
                <Label>SOBRE</Label>
                <p className="ads-body ads-about-text">
                  A Legacy BrandCo. é uma consultoria de{" "}
                  <strong>estratégia de marca</strong> e{" "}
                  <strong>identidade visual</strong> com{" "}
                  <strong>mais de 8 anos</strong> de operação. Atendemos
                  negócios em todo o Brasil, de profissionais liberais a
                  empresas em crescimento.
                </p>
              </div>
              <div>
                <p className="ads-body ads-about-text">
                  Nosso trabalho <strong>começa antes do visual</strong>.
                  Entendemos o negócio, o mercado e o consumidor, e só depois
                  traduzimos isso em uma marca.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="ads-section ads-section-dark">
          <div className="ads-container">
            <Label>DEPOIMENTOS</Label>
            <h2 className="ads-h2">
              O que dizem sobre o <strong>nosso trabalho</strong>
            </h2>
            <div className="ads-testimonials">
              {depoimentos.map((d) => (
                <a key={d.src} href="#formulario" className="ads-shot-link">
                  <figure className="ads-shot ads-shot-dark">
                    <img src={d.src} alt={d.alt} width={d.w} height={d.h} loading="lazy" decoding="async" />
                  </figure>
                </a>
              ))}
            </div>
            <div className="ads-cta-row">
              <a href="#formulario" className="ads-cta">
                Quero meu diagnóstico
              </a>
            </div>
          </div>
        </section>

        {/* Método 80/20 */}
        <section className="ads-section">
          <div className="ads-container ads-method">
            <div>
              <Label>MÉTODO</Label>
              <p className="ads-method-title">
                <span className="ads-accent">80%</span> estratégia.
                <br />
                <span className="ads-dim">20% execução visual.</span>
              </p>
            </div>
            <p className="ads-body ads-measure">
              Antes de definir logotipo, cor ou tipografia, entendemos{" "}
              <strong>o que o seu negócio faz</strong>,{" "}
              <strong>contra quem ele compete</strong> e{" "}
              <strong>quem precisa ser convencido</strong>. A identidade visual é
              a <strong>conclusão</strong> desse processo, não o começo dele.
            </p>
          </div>
        </section>

        {/* Formulário final */}
        <section id="formulario" className="ads-section ads-last">
          <div className="ads-container ads-hero-grid">
            <div>
              <Label>DIAGNÓSTICO</Label>
              <h2 className="ads-h2">
                Vamos olhar sua marca <strong>de perto</strong>.
              </h2>
              <p className="ads-body ads-measure">
                Preencha o formulário. Nossa equipe analisa seu perfil e entra
                em contato em <strong>até 1 dia útil</strong> para agendar.
              </p>
            </div>
            <FormSlot />
          </div>
        </section>
      </main>

      <footer className="ads-footer">
        <div className="ads-container ads-footer-row">
          <img src={logo.url} alt="Legacy BrandCo." width={120} height={24} loading="lazy" />
          <div>
            © 2026 Legacy BrandCo. · <PrivacyButton />
          </div>
        </div>
      </footer>

      <a
        href="#formulario"
        className={`ads-sticky${sticky ? " on" : ""}`}
        aria-hidden={!sticky}
        tabIndex={sticky ? 0 : -1}
      >
        Quero meu diagnóstico gratuito
      </a>

      <style>{`
        .ads-page {
          background: #F4F2EF;
          color: #121110;
          font-family: Inter, system-ui, sans-serif;
          letter-spacing: -0.02em;
          scroll-behavior: smooth;
        }
        .ads-page strong { font-weight: 600; color: inherit; }
        /* Selo do Lovable (injetado na publicação) só some aqui: este bloco de
           estilo existe apenas enquanto o /ads está na tela. Nunca escrever
           tag HTML dentro deste CSS: o servidor escapa e a página quebra na
           hidratação (erro React #418), o que jogava a tela para o fim. */
        #lovable-badge { display: none !important; }
        .ads-container {
          max-width: 1200px;
          margin-inline: auto;
          padding-inline: 24px;
        }
        .ads-topbar { height: 64px; display: flex; align-items: center; }
        .ads-topbar-inner { width: 100%; display: flex; justify-content: center; }
        .ads-logo { height: 28px; width: auto; }
        .ads-section { padding-block: 80px; }
        .ads-first { padding-top: 24px; }
        .ads-last { padding-bottom: 64px; }
        .ads-label {
          font-size: 11px; font-weight: 500; text-transform: uppercase;
          letter-spacing: 0.1em; color: #D75631; margin: 0 0 16px;
        }
        .ads-h1 {
          font-size: 34px; font-weight: 400; line-height: 1.05;
          letter-spacing: -0.035em; margin: 0; font-style: normal;
        }
        .ads-h1 strong { font-weight: 600; }
        .ads-h2 { font-size: 26px; font-weight: 400; line-height: 1.1; letter-spacing: -0.03em; margin: 0 0 24px; }
        .ads-h3 { font-size: 20px; font-weight: 400; line-height: 1.15; letter-spacing: -0.03em; margin: 0 0 8px; }
        .ads-body { font-size: 16px; font-weight: 400; line-height: 1.4; letter-spacing: -0.02em; margin: 0; }
        .ads-measure { max-width: 40ch; margin-top: 24px; }
        .ads-secondary, .ads-secondary * { color: rgba(18,17,16,0.6); }
        .ads-accent { color: #D75631; }
        .ads-dim { color: rgba(18,17,16,0.4); }
        .ads-hero-grid { display: grid; gap: 40px; }
        .ads-card {
          background: #FFFFFF; padding: 24px 20px; border: 1px solid rgba(18,17,16,0.08);
          border-radius: 12px; box-shadow: 0 12px 36px rgba(18,17,16,0.06);
          scroll-margin-top: 16px;
        }
        .ads-form-title { font-size: 22px; font-weight: 600; letter-spacing: -0.03em; margin: 0; }
        .ads-form-sub { font-size: 14px; color: rgba(18,17,16,0.6); margin: 4px 0 20px; }
        .ads-form-slot form { gap: 18px !important; }
        .ads-form-slot form > div { gap: 18px !important; grid-template-columns: 1fr !important; }
        .ads-form-slot button[type="submit"] {
          width: 100% !important; background: #CFFF87 !important; color: #121110 !important;
          border-radius: 8px !important; font-size: 15px !important; padding: 16px 24px !important;
        }

        .ads-facts {
          list-style: none; padding: 0; margin: 28px 0 0; display: flex; flex-wrap: wrap;
          gap: 10px 24px; font-size: 14px; color: rgba(18,17,16,0.6);
        }
        .ads-facts b { color: #D75631; font-weight: 600; font-size: 18px; margin-right: 4px; }

        .ads-steps { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
        .ads-steps li {
          background: #FFFFFF; border: 1px solid rgba(18,17,16,0.08); border-radius: 12px;
          padding: 20px;
        }
        .ads-step-num { display: block; color: #D75631; font-size: 28px; font-weight: 600; letter-spacing: -0.03em; margin-bottom: 8px; }
        .ads-steps .ads-h3 { font-weight: 600; margin-bottom: 4px; }

        .ads-slider-cap {
          position: absolute; left: 0; right: 0; bottom: 0; padding: 48px 24px 18px;
          background: linear-gradient(to top, rgba(18,17,16,0.75), rgba(18,17,16,0));
          color: #F4F2EF; display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
          text-align: left;
        }
        .ads-slider-seg { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.75; }
        .ads-slider-nome { font-size: 22px; font-weight: 600; letter-spacing: -0.03em; }
        .ads-slider-dots { display: flex; gap: 5px; margin-top: 8px; }
        .ads-slider-dots i { width: 6px; height: 6px; border-radius: 50%; background: rgba(244,242,239,0.45); transition: width .2s, background .2s; }
        .ads-slider-dots i.on { width: 16px; border-radius: 3px; background: #CFFF87; }

        .ads-about-cols { display: grid; gap: 20px; }
        .ads-method { display: grid; gap: 24px; }

        .ads-sticky {
          position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 50;
          display: flex; justify-content: center; padding: 16px; border-radius: 10px;
          background: #CFFF87; color: #121110; font-weight: 600; font-size: 15px;
          text-decoration: none; box-shadow: 0 10px 30px rgba(18,17,16,0.25);
          transform: translateY(140%); transition: transform .25s ease;
        }
        .ads-sticky.on { transform: none; }
        @media (prefers-reduced-motion: reduce) {
          .ads-sticky, .ads-slider img, .ads-slider-dots i { transition: none; }
        }
        .ads-fullbleed { width: 100%; }
        .ads-slider { position: relative; width: 100%; height: 320px; background: #121110; overflow: hidden; }
        .ads-slider img {
          position: absolute; inset: 0; display: block; width: 100%; height: 100%;
          object-fit: cover; transition: opacity 1200ms ease-in-out;
        }
        .ads-testimonials { display: grid; gap: 16px; }
        .ads-shot {
          margin: 0; background: #FFFFFF; border: 1px solid rgba(18,17,16,0.08);
          border-radius: 12px; overflow: hidden; break-inside: avoid;
        }
        .ads-shot img { display: block; width: 100%; height: auto; }
        .ads-shot-link { display: block; text-decoration: none; color: inherit; break-inside: avoid; }
        .ads-slider-link { display: block; }
        .ads-fit { display: grid; gap: 32px; }
        .ads-fit-col-right { border-top: 1px solid rgba(18,17,16,0.1); padding-top: 32px; }
        .ads-list { list-style: none; margin: 16px 0 0; padding: 0; }
        .ads-list li { padding-block: 16px; border-bottom: 1px solid rgba(18,17,16,0.1); }
        .ads-list li:first-child { border-top: 1px solid rgba(18,17,16,0.1); }
        .ads-cta-row { margin-top: 40px; display: flex; }
        .ads-cta {
          display: inline-flex; align-items: center; justify-content: center;
          background: #CFFF87; color: #121110; font-size: 15px; font-weight: 600;
          padding: 16px 28px; border-radius: 8px; text-decoration: none;
          width: 100%;
        }
        .ads-cta:focus-visible, .ads-page a:focus-visible, .ads-page button:focus-visible,
        .ads-page input:focus-visible, .ads-page select:focus-visible {
          outline: 2px solid #121110; outline-offset: 2px;
        }
        .ads-footer {
          padding-block: 24px 96px; border-top: 1px solid rgba(18,17,16,0.08);
          font-size: 12px; color: rgba(18,17,16,0.5);
        }
        .ads-footer-row { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .ads-footer-row img { height: 20px; width: auto; max-width: 120px; object-fit: contain; opacity: 0.8; }

        /* Depoimentos em dark mode */
        .ads-section-dark {
          background: #121110;
          color: #F4F2EF;
        }
        .ads-section-dark .ads-h2,
        .ads-section-dark .ads-h2 strong { color: #F4F2EF; }
        .ads-section-dark .ads-shot-dark {
          background: #1C1B1A;
          border-color: rgba(244,242,239,0.10);
        }
        .ads-section-dark .ads-shot-dark img {
          border-radius: 12px;
        }

        /* Reaproveita o componente de formulário existente sem alterá-lo */
        .ads-form-slot > section { border: 0 !important; background: transparent !important; }
        .ads-form-slot > section > div { padding: 0 !important; max-width: none !important; width: 100% !important; }
        .ads-form-slot > section > div > div {
          display: block !important; gap: 0 !important;
        }
        .ads-form-slot > section > div > div > *:first-child { display: none !important; }
        .ads-form-slot > section > div > div > * + * { border: 0 !important; padding: 0 !important; }

        /* Mobile: logo pequeno no topo, textos centralizados */
        @media (max-width: 767px) {
          .ads-topbar { height: 56px; }
          .ads-logo { height: 22px; }
          .ads-page { text-align: center; }
          .ads-measure, .ads-about-text { margin-inline: auto; }
          .ads-facts { justify-content: center; }
          .ads-cta-row { justify-content: center; }
          .ads-form-slot { text-align: left; }
          .ads-first { padding-top: 8px; }
        }

        @media (min-width: 768px) {
          .ads-slider { height: 520px; }
          .ads-slider-cap { padding: 64px 40px 28px; }
          .ads-slider-nome { font-size: 28px; }
          .ads-testimonials {
            display: block; columns: 2; column-gap: 24px;
          }
          .ads-shot { margin-bottom: 0; }
          .ads-shot-link { margin-bottom: 24px; display: inline-block; width: 100%; }
          .ads-steps { grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .ads-cta { width: auto; }
          .ads-footer { padding-bottom: 24px; }
          .ads-footer-row { flex-direction: row; justify-content: space-between; }
          .ads-sticky { display: none; }
        }

        @media (min-width: 1024px) {
          .ads-testimonials { columns: 3; column-gap: 28px; }
          .ads-shot-link { margin-bottom: 28px; }
          .ads-container { padding-inline: 80px; }
          .ads-topbar { height: 80px; }
          .ads-topbar-inner { justify-content: flex-start; }
          .ads-logo { height: 32px; }
          .ads-section { padding-block: 140px; }
          .ads-first { padding-top: 40px; }
          .ads-last { padding-bottom: 120px; }
          .ads-label { font-size: 12px; }
          .ads-h1 { font-size: 56px; }
          .ads-h2 { font-size: 36px; }
          .ads-body { font-size: 17px; }
          .ads-hero-grid { grid-template-columns: 55% 45%; gap: 80px; align-items: start; }
          .ads-card { padding: 32px; }
          .ads-about { display: grid; grid-template-columns: 1fr 2fr; }
          .ads-about-cols { grid-column: 2; grid-template-columns: repeat(2, minmax(0, 420px)); gap: 80px; }
          .ads-method { grid-template-columns: 1fr 1fr; gap: 80px; }
          .ads-method-title { font-size: 72px; }
          .ads-fit { grid-template-columns: 1fr 1fr; gap: 64px; }
          .ads-fit-col-right {
            border-top: 0; padding-top: 0; border-left: 1px solid rgba(18,17,16,0.1);
            padding-left: 64px;
          }
          .ads-slider-cap { padding-inline: 80px; }
          .ads-steps li { padding: 28px; }
        }
      `}</style>
    </div>
  );
}
