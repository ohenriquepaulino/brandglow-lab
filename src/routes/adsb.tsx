import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ContactSection } from "@/components/site/ContactSection";
import { PrivacyButton } from "@/components/site/PrivacyDialog";
import { useAbVisit } from "@/lib/ab";
import { useStickyCta } from "@/lib/useStickyCta";
import n308Banner from "@/assets/308-network/308-network-out-banner.webp.asset.json";
import n308Correndo from "@/assets/308-network/308-network-308-foto-correndo.webp.asset.json";
import n308Metro from "@/assets/308-network/308-network-banner-metro-moema.webp.asset.json";
import n308Bone from "@/assets/308-network/308-network-bone-e-moletom-juntos.webp.asset.json";
import n308Cartao from "@/assets/308-network/308-network-cartao-de-visitas.webp.asset.json";
import n308Site from "@/assets/308-network/308-network-site-tela-pc.webp.asset.json";
import moewaPoster from "@/assets/ads/moewa-poster-manifesto.webp.asset.json";
import geri60 from "@/assets/geriacademy/geriacademy-page-0060.webp.asset.json";
import geri44 from "@/assets/geriacademy/geriacademy-page-0044.webp.asset.json";
import geri49 from "@/assets/geriacademy/geriacademy-page-0049.webp.asset.json";
import geri53 from "@/assets/geriacademy/geriacademy-page-0053.webp.asset.json";
import geri54 from "@/assets/geriacademy/geriacademy-page-0054.webp.asset.json";
import geri57 from "@/assets/geriacademy/geriacademy-page-0057.webp.asset.json";
import joanaQuote from "@/assets/joana-ulmer/joana-ulmer-billboard-quote.webp.asset.json";
import joanaBag from "@/assets/joana-ulmer/joana-ulmer-bag.webp.asset.json";
import joanaEvent from "@/assets/joana-ulmer/joana-ulmer-billboard-event.webp.asset.json";
import joanaHoodies from "@/assets/joana-ulmer/joana-ulmer-hoodies.webp.asset.json";
import joanaLaptop from "@/assets/joana-ulmer/joana-ulmer-laptop.webp.asset.json";
import joanaPhone from "@/assets/joana-ulmer/joana-ulmer-phone.webp.asset.json";
import print1 from "@/assets/ads/IMG_1693.webp.asset.json";
import print2 from "@/assets/ads/IMG_1694.webp.asset.json";
import print3 from "@/assets/ads/IMG_1695.webp.asset.json";
import print4 from "@/assets/ads/IMG_1696.webp.asset.json";
import print5 from "@/assets/ads/IMG_1697.webp.asset.json";

// Versão B do teste A/B (a A é /adsa; as campanhas apontam para /ads, que
// sorteia). Mesmo formulário e mesmo fluxo (CRM, WhatsApp, Pixel); muda a
// página: visual da proposta (Anton + verde-limão), promessa do diagnóstico,
// cases em carrossel, processo, entregas e FAQ. Sem links que saiam da página.
export const Route = createFileRoute("/adsb")({
  head: () => ({
    meta: [
      { title: "Diagnóstico de marca gratuito | Legacy BrandCo." },
      {
        name: "description",
        content:
          "Estratégia de marca e identidade visual. Comece com um diagnóstico gratuito de 25 minutos por vídeo.",
      },
      { property: "og:title", content: "Diagnóstico de marca gratuito | Legacy BrandCo." },
      {
        property: "og:description",
        content: "Sua empresa é boa. Sua marca precisa mostrar isso.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      {
        rel: "preload",
        href: "/proposta/fonts/anton-400.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/proposta/fonts/inter-400.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: AdsBPage,
});

const LOGO = "/proposta/brand/legacy-logo-preto.webp";
const LOGO_LIGHT = "/proposta/brand/legacy-logo-branco.webp";

const FORM_PROPS = {
  redirectTo: "/obrigado",
  redirectToNoRevenue: "/tks",
  hideInstagram: true,
  showProfession: true,
  revenueLabel: "Faturamento mensal da empresa",
  ctaLabel: "Quero meu diagnóstico",
  ctaNote: "Gratuito · 25 min por vídeo · resposta em até 1 dia útil",
  // A política fica só no rodapé.
  hidePrivacy: true,
} as const;

const PASSOS = [
  { n: "01", t: "Você preenche", d: "Leva menos de um minuto." },
  { n: "02", t: "Analisamos seu perfil", d: "Chegamos na conversa sabendo do seu negócio." },
  {
    n: "03",
    t: "Diagnóstico de 25 min",
    d: "Por vídeo. Mostramos onde sua marca perde valor e apresentamos como funciona o nosso trabalho de identidade visual.",
  },
];

// MOEWA: os assets originais têm 2 MB cada; as versões da proposta são leves.
const MOEWA = (f: string) => `/proposta/cases/moewa/moewa-${f}.jpg`;

const CASES = [
  {
    imgs: [n308Banner, n308Correndo, n308Metro, n308Bone, n308Cartao, n308Site].map((a) => a.url),
    nome: "308NETWORK",
    seg: "Decisões patrimoniais",
    antes: "Imobiliária tradicional",
    depois: "Referência em decisões patrimoniais inteligentes, pronta para expandir.",
  },
  {
    imgs: [
      moewaPoster.url,
      MOEWA("clube-card"),
      MOEWA("uniform"),
      MOEWA("wellness-shot"),
      MOEWA("sacola"),
      MOEWA("cartao"),
    ],
    nome: "MOEWA",
    seg: "Estética e longevidade",
    antes: "Mais uma clínica de estética",
    depois: "Um ecossistema de alto valor: a única rosa branca num mar de rosas vermelhas.",
  },
  {
    imgs: [geri60, geri44, geri49, geri53, geri54, geri57].map((a) => a.url),
    nome: "Geriacademy",
    seg: "Educação médica",
    antes: "Cursos de geriatria",
    depois: "Uma instituição que lidera um movimento de valorização da saúde do idoso.",
  },
  {
    imgs: [joanaQuote, joanaBag, joanaEvent, joanaHoodies, joanaLaptop, joanaPhone].map(
      (a) => a.url,
    ),
    nome: "Joana co*",
    seg: "Educação financeira",
    antes: "Marca pessoal sem direção",
    depois: "Um posicionamento que cabe numa pergunta: quanto você investiria na sua paz?",
  },
];

const DEPOIMENTOS = [
  { src: print1.url, w: 900, h: 1314, alt: "Mensagem de cliente elogiando o projeto" },
  { src: print4.url, w: 900, h: 495, alt: "Mensagem de cliente sobre identidade visual" },
  { src: print2.url, w: 900, h: 1035, alt: "Mensagem de cliente sobre o resultado" },
  { src: print5.url, w: 900, h: 722, alt: "Mensagem de cliente elogiando o trabalho" },
  { src: print3.url, w: 900, h: 329, alt: "Mensagem de cliente sobre expectativas superadas" },
];

const ETAPAS = [
  {
    sem: "Semana 1",
    t: "Pesquisa",
    d: "Você responde o Legacy Brand Canvas e fazemos as calls de alinhamento.",
  },
  { sem: "Semana 2", t: "Moodboard", d: "A direção visual da sua marca." },
  { sem: "Semanas 3 a 5", t: "Criação", d: "Testes, validação e apresentação da identidade." },
  { sem: "Semana 6", t: "Entrega", d: "Todos os arquivos organizados no Google Drive." },
];

const ENTREGAS = [
  "Narrativa da marca",
  "Logotipo e suas versões",
  "Elementos visuais",
  "Paleta de cores",
  "Tipografia da marca",
  "Aplicações no dia a dia",
  "Identidade do Instagram",
  "Todos os arquivos",
];

const FAQ = [
  {
    q: "Para que serve o diagnóstico?",
    a: "Para você conhecer o nosso trabalho de estratégia e identidade visual antes de decidir. Em 25 minutos por vídeo, olhamos a sua marca, mostramos onde ela está perdendo valor e apresentamos como funciona o projeto: etapas, prazo e investimento.",
  },
  {
    q: "O diagnóstico é pago?",
    a: "Não. A conversa é sem custo e sem compromisso: você sai com a leitura da sua marca e decide depois se quer seguir com o projeto.",
  },
  {
    q: "Quanto custa um projeto?",
    a: "Cada projeto é dimensionado para o momento do negócio. Apresentamos o investimento na reunião, junto com o que faz sentido para você.",
  },
  {
    q: "Quanto tempo leva?",
    a: "Cerca de 6 semanas, contadas a partir do momento em que você responde o Legacy Brand Canvas, a nossa ferramenta de estratégia.",
  },
  {
    q: "Vocês atendem a minha área?",
    a: "Atendemos profissionais liberais e empresas em todo o Brasil: saúde, estética, educação, advocacia, imobiliário, tecnologia e muito mais. O método começa pelo seu mercado, não por um modelo pronto.",
  },
  {
    q: "Já tenho logo. Ainda faz sentido?",
    a: "Faz. Muitos clientes chegam com uma logo e saem com uma marca: posicionamento, mensagem e um sistema visual que funciona em todos os pontos de contato.",
  },
  {
    q: "Meu negócio ainda não fatura. Posso preencher?",
    a: "Pode, sim. Mas, sendo transparentes: o nosso trabalho faz mais sentido para quem já tem faturamento e uma verba separada para investir numa identidade visual estratégica. Se você ainda está começando, a conversa serve para entender o seu momento e dizer com sinceridade quando vale a pena dar esse passo.",
  },
];

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="b-kicker">{children}</p>;
}

function Form({ id }: { id: string }) {
  return (
    <div className="b-form" id={id}>
      <p className="b-form-title">Diagnóstico gratuito</p>
      <p className="b-form-sub">
        25 min por vídeo, sem custo: olhamos a sua marca e apresentamos o nosso trabalho de
        identidade visual.
      </p>
      <ContactSection {...FORM_PROPS} />
    </div>
  );
}

function Cta({ href = "#formulario", children = "Quero meu diagnóstico" }) {
  return (
    <a href={href} className="b-cta">
      {children}
    </a>
  );
}

const INTERVALO_MS = 1800;

/**
 * Imagens do case trocando sozinhas a cada 1,8 s. Para carregar rápido: só a
 * primeira vem com a página; as outras são baixadas uma a uma, só com o card
 * perto da tela, e a troca só acontece depois que a próxima já decodificou.
 */
function CaseCarousel({ imgs, nome, eager }: { imgs: string[]; nome: string; eager: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [montadas, setMontadas] = useState(1);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting), {
      rootMargin: "200px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visivel || imgs.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const prox = (idx + 1) % imgs.length;
    let cancelado = false;
    const pre = new Image();
    pre.src = imgs[prox]!;
    const pronta = pre.decode().catch(() => undefined);
    const t = window.setTimeout(() => {
      void pronta.then(() => {
        if (cancelado) return;
        setMontadas((m) => Math.max(m, prox + 1));
        setIdx(prox);
      });
    }, INTERVALO_MS);
    return () => {
      cancelado = true;
      window.clearTimeout(t);
    };
  }, [visivel, idx, imgs]);

  return (
    <div className="b-carousel" ref={ref}>
      {imgs.slice(0, montadas).map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === 0 ? `Identidade visual ${nome}` : ""}
          aria-hidden={i === 0 ? undefined : true}
          width={1600}
          height={900}
          loading={eager && i === 0 ? "eager" : "lazy"}
          decoding="async"
          style={{ opacity: i === idx ? 1 : 0 }}
        />
      ))}
      <div className="b-dots" aria-hidden="true">
        {imgs.map((src, i) => (
          <i key={src} className={i === idx ? "on" : ""} />
        ))}
      </div>
    </div>
  );
}

function AdsBPage() {
  useAbVisit("b");
  const sticky = useStickyCta(".b-hero, .b-last, .b-footer");

  return (
    <div className="adsb">
      {/* PRIMEIRA DOBRA */}
      <section className="b-hero tone-lime">
        <div className="b-wrap b-hero-grid">
          <div className="b-hero-copy">
            <img src={LOGO} alt="Legacy BrandCo." className="b-logo" width={172} height={61} />
            <Kicker>Diagnóstico de marca gratuito</Kicker>
            <h1 className="b-d b-h1">
              <span>Sua empresa é boa.</span> <span>Sua marca precisa mostrar isso.</span>
            </h1>
            <p className="b-lead">
              <strong>Estratégia</strong> e <strong>identidade visual</strong> para negócios que
              entregam bem.
            </p>
          </div>
          <Form id="diagnostico" />
          {/* No celular os números vêm depois do formulário, para ele caber na primeira tela. */}
          <ul className="b-facts">
            <li>
              <b>+8 anos</b> construindo marcas
            </li>
            <li>
              <b>Brasil inteiro</b> de clientes
            </li>
            <li>
              <b>80%</b> estratégia
            </li>
          </ul>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="b-sec tone-paper">
        <div className="b-wrap">
          <Kicker>Como funciona</Kicker>
          <h2 className="b-d b-h2">Três passos até o seu diagnóstico</h2>
          <ol className="b-steps">
            {PASSOS.map((p) => (
              <li key={p.n}>
                <small>{p.n}</small>
                <b>{p.t}</b>
                <p>{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* O QUE FAZEMOS */}
      <section className="b-sec tone-deep">
        <div className="b-wrap">
          <Kicker>O que fazemos</Kicker>
          <h2 className="b-d b-h2">Estratégia de marca e identidade visual</h2>
          <p className="b-promise">
            Primeiro definimos <strong>como sua marca se posiciona</strong>, o que ela fala e o que
            a diferencia. Só depois isso vira logo, cor e tipografia.
          </p>
          <div className="b-flow">
            {[
              ["Estratégia", "Posicionamento"],
              ["Estratégia", "Base de comunicação"],
              ["Estratégia", "Diferencial"],
              ["Resultado", "Identidade de alto padrão"],
            ].map(([k, v]) => (
              <div key={v}>
                <small>{k}</small>
                <b>{v}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASES */}
      <section className="b-sec tone-paper">
        <div className="b-wrap">
          <Kicker>Portfólio</Kicker>
          <h2 className="b-d b-h2">Marcas que construímos</h2>
          <div className="b-cases">
            {CASES.map((c, i) => (
              <article key={c.nome} className="b-case">
                <CaseCarousel imgs={c.imgs} nome={c.nome} eager={i === 0} />
                <div className="b-case-txt">
                  <p className="b-case-seg">{c.seg}</p>
                  <h3 className="b-d">{c.nome}</h3>
                  <p className="b-case-antes">Antes: {c.antes}</p>
                  <p className="b-case-depois">{c.depois}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="b-cta-row">
            <Cta />
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="b-sec tone-deep">
        <div className="b-wrap">
          <Kicker>Depoimentos</Kicker>
          <h2 className="b-d b-h2">O que dizem os clientes</h2>
          <div className="b-shots">
            {DEPOIMENTOS.map((d) => (
              <figure key={d.src} className="b-shot">
                <img
                  src={d.src}
                  alt={d.alt}
                  width={d.w}
                  height={d.h}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* COMO TRABALHAMOS */}
      <section className="b-sec tone-paper">
        <div className="b-wrap">
          <Kicker>Como trabalhamos</Kicker>
          <h2 className="b-d b-h2">Da pesquisa à entrega final</h2>
          <ol className="b-timeline">
            {ETAPAS.map((e, i) => (
              <li key={e.t} className={i === 2 ? "hot" : ""}>
                <small>{e.sem}</small>
                <b>{e.t}</b>
                <p>{e.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ENTREGAS */}
      <section className="b-sec tone-surface">
        <div className="b-wrap">
          <Kicker>O que você recebe</Kicker>
          <h2 className="b-d b-h2">Oito entregas que formam a sua marca</h2>
          <ol className="b-dl">
            {ENTREGAS.map((t, i) => (
              <li key={t}>
                <small>{String(i + 1).padStart(2, "0")}</small>
                <b>{t}</b>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="b-sec tone-paper">
        <div className="b-wrap b-faq-wrap">
          <div>
            <Kicker>Perguntas frequentes</Kicker>
            <h2 className="b-d b-h2">Antes de você preencher</h2>
          </div>
          <div className="b-faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULÁRIO FINAL */}
      <section className="b-sec tone-lime b-last">
        <div className="b-wrap b-hero-grid">
          <div>
            <Kicker>Próximo passo</Kicker>
            <h2 className="b-d b-h2">Vamos olhar a sua marca de perto</h2>
            <p className="b-lead">
              Nossa equipe analisa o seu perfil e entra em contato em{" "}
              <strong>até 1 dia útil</strong> para agendar.
            </p>
          </div>
          <Form id="formulario" />
        </div>
      </section>

      <footer className="b-footer tone-deep">
        <div className="b-wrap b-footer-row">
          <img src={LOGO_LIGHT} alt="Legacy BrandCo." width={120} height={43} loading="lazy" />
          <div>
            © 2026 Legacy BrandCo. · <PrivacyButton />
          </div>
        </div>
      </footer>

      <a
        href="#formulario"
        className={`b-sticky${sticky ? " on" : ""}`}
        aria-hidden={!sticky}
        tabIndex={sticky ? 0 : -1}
      >
        Quero meu diagnóstico gratuito
      </a>

      <style>{`
        @font-face { font-family: "LBC Anton"; font-weight: 400; font-display: swap; src: url("/proposta/fonts/anton-400.woff2") format("woff2"); }
        @font-face { font-family: "LBC Inter"; font-weight: 400; font-display: swap; src: url("/proposta/fonts/inter-400.woff2") format("woff2"); }
        @font-face { font-family: "LBC Inter"; font-weight: 500; font-display: swap; src: url("/proposta/fonts/inter-500.woff2") format("woff2"); }
        @font-face { font-family: "LBC Inter"; font-weight: 600; font-display: swap; src: url("/proposta/fonts/inter-600.woff2") format("woff2"); }

        html:has(.adsb) { scroll-behavior: smooth; }
        /* Selo do Lovable escondido aqui também, como no /ads. */
        #lovable-badge { display: none !important; }

        .adsb {
          --lime: #b8ff80; --ink: #111111; --paper: #f2f2f2; --surface: #ffffff;
          --muted: #6e6e6e; --line: rgba(17,17,17,0.12);
          --deep-ink: #f2f2f2; --deep-muted: #9a9a9a; --deep-line: rgba(242,242,242,0.14);
          --display: "LBC Anton", "Anton", Impact, "Arial Narrow Bold", sans-serif;
          font-family: "LBC Inter", Inter, system-ui, sans-serif;
          color: var(--ink); background: var(--paper);
          font-size: 16px; line-height: 1.5; -webkit-font-smoothing: antialiased;
        }
        /* :where zera a especificidade: o reset não pode vencer as margens das classes. */
        :where(.adsb) :where(h1, h2, h3, p, ol, ul, figure) { margin: 0; }
        .adsb h1, .adsb h2, .adsb h3 { text-wrap: balance; }
        .adsb p { text-wrap: pretty; }
        .adsb strong { font-weight: 600; }
        .tone-lime { background: var(--lime); color: var(--ink); }
        .tone-paper { background: var(--paper); color: var(--ink); }
        .tone-surface { background: var(--surface); color: var(--ink); }
        .tone-deep { background: var(--ink); color: var(--deep-ink); }

        .b-wrap { max-width: 1200px; margin-inline: auto; padding-inline: 20px; }
        .b-sec { padding-block: 72px; }
        .b-d { font-family: var(--display); font-weight: 400; line-height: 1.02; letter-spacing: 0.002em; }
        .b-h1 { font-size: 42px; }
        .b-h1 span { display: block; }
        .b-h1 span + span { margin-top: 4px; }
        .b-h2 { font-size: 36px; margin-bottom: 28px; }
        .b-kicker {
          font-size: 13px; font-weight: 500; color: var(--muted); margin-bottom: 16px;
          display: flex; gap: 12px; align-items: center;
        }
        .b-kicker::before { content: ""; width: 28px; height: 2px; background: currentColor; opacity: 0.5; }
        .tone-lime .b-kicker { color: rgba(17,17,17,0.65); }
        .tone-deep .b-kicker { color: var(--deep-muted); }

        /* primeira dobra */
        .b-hero { padding-block: 28px 56px; }
        .b-logo { height: 34px; width: auto; margin-bottom: 36px; display: block; }
        .b-lead { font-size: 17px; line-height: 1.45; margin-top: 20px; max-width: 46ch; }
        .b-facts { list-style: none; padding: 0; margin-top: 28px !important; display: grid; gap: 0; border-top: 1.5px solid var(--ink); }
        .b-facts li { padding: 12px 0; border-bottom: 1px solid var(--line); font-size: 15px; }
        .b-facts b { font-family: var(--display); font-weight: 400; font-size: 22px; margin-right: 6px; }
        /* minmax(0, 1fr): sem isso, o campo de WhatsApp (país + número) alargava a
           coluna além da tela em celulares estreitos e cortava o texto (Clarity). */
        .b-hero-grid {
          display: grid; grid-template-columns: minmax(0, 1fr); gap: 36px;
          grid-template-areas: "copy" "form" "facts";
        }
        .b-hero-copy { grid-area: copy; min-width: 0; }
        .b-hero .b-form { grid-area: form; min-width: 0; }
        .b-hero .b-facts { grid-area: facts; }

        /* formulário (reaproveita o ContactSection sem o bloco de texto dele) */
        .b-form {
          background: var(--surface); color: var(--ink); border-radius: 16px;
          padding: 24px 20px; box-shadow: 0 18px 48px rgba(17,17,17,0.10);
          scroll-margin-top: 16px;
        }
        .b-form-title { font-family: var(--display); font-size: 28px; line-height: 1.05; }
        .b-form-sub { font-size: 14px; color: var(--muted); margin: 6px 0 20px !important; }
        .b-form > section { border: 0 !important; background: transparent !important; }
        .b-form > section > div { padding: 0 !important; max-width: none !important; width: 100% !important; }
        .b-form > section > div > div { display: block !important; gap: 0 !important; }
        .b-form > section > div > div > *:first-child { display: none !important; }
        .b-form > section > div > div > * + * { border: 0 !important; padding: 0 !important; }
        .b-form form { gap: 18px !important; }
        .b-form form > div { gap: 18px !important; grid-template-columns: minmax(0, 1fr) !important; }
        .b-form button[type="submit"] {
          width: 100% !important; background: var(--ink) !important; color: var(--lime) !important;
          border-radius: 10px !important; font-size: 16px !important; padding: 17px 24px !important;
        }
        /* 16px nos campos: abaixo disso o iPhone dá zoom na página ao tocar no campo. */
        .b-form .input-light, .b-form .phone-wrap input { font-size: 16px; }

        /* Celular: texto e formulário inteiros na primeira tela. */
        @media (max-width: 767px) {
          .b-hero { padding-block: 12px 44px; }
          .b-hero .b-logo { height: 24px; margin-bottom: 12px; }
          .b-hero .b-kicker { display: none; }
          .b-hero .b-h1 { font-size: 32px; }
          .b-hero .b-h1 span + span { margin-top: 0; }
          .b-hero .b-lead { font-size: 15px; line-height: 1.4; margin-top: 10px; }
          .b-hero-grid { gap: 16px; }
          .b-hero .b-facts { margin-top: 10px !important; }
          .b-form { padding: 16px 16px 14px; border-radius: 14px; }
          .b-form-title { font-size: 22px; }
          .b-form-sub { font-size: 13px; margin: 2px 0 12px !important; }
          .b-form form { gap: 10px !important; }
          .b-form form > div { gap: 10px !important; }
          .b-form label, .b-form form > div > div { gap: 5px !important; }
          /* Rótulos numa linha só e sem a dica do WhatsApp: o formulário cabe na tela. */
          .b-form label > span:first-child, .b-form form > div > div > label:first-child,
          .b-form form > div > div > span:first-child { letter-spacing: 0.06em !important; font-size: 10.5px !important; }
          .b-form .phone-dica { display: none; }
          .b-form .input-light { padding: 0.55rem 0.85rem; }
          .b-form .phone-wrap input { padding-block: 0.55rem; }
          .b-form button[type="submit"] { padding: 15px 20px !important; margin-top: 2px !important; }
          .b-form button[type="submit"] + p { display: none; }
        }

        /* passos */
        .b-steps { list-style: none; padding: 0; display: grid; gap: 0; border-top: 1.5px solid var(--ink); }
        .b-steps li { padding: 22px 0; border-bottom: 1px solid var(--line); display: grid; grid-template-columns: 44px 1fr; column-gap: 12px; }
        .b-steps small { grid-row: span 2; font-family: var(--display); font-size: 26px; line-height: 1; }
        .b-steps b { font-size: 18px; font-weight: 600; }
        .b-steps p { color: var(--muted); font-size: 15px; margin-top: 4px !important; }

        /* o que fazemos */
        .b-promise { font-size: 20px; line-height: 1.35; font-weight: 400; max-width: 38ch; color: var(--deep-ink); }
        .b-promise strong { color: var(--lime); }
        .b-flow { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 40px; border-top: 1px solid var(--deep-line); }
        .b-flow div { padding: 18px 16px 18px 0; border-bottom: 1px solid var(--deep-line); }
        .b-flow div:nth-child(even) { padding-left: 16px; border-left: 1px solid var(--deep-line); }
        .b-flow small { display: block; color: var(--deep-muted); font-size: 12px; margin-bottom: 6px; }
        .b-flow b { font-family: var(--display); font-weight: 400; font-size: 24px; line-height: 1.05; }
        .b-flow div:last-child b { color: var(--lime); }

        /* cases */
        .b-cases { display: grid; gap: 20px; }
        .b-case { background: var(--surface); border-radius: 16px; overflow: hidden; }
        .b-carousel { position: relative; aspect-ratio: 16/10; background: #e6e6e6; overflow: hidden; }
        .b-carousel img {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;
          transition: opacity 350ms ease;
        }
        .b-dots { position: absolute; left: 12px; bottom: 10px; display: flex; gap: 5px; }
        .b-dots i { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.55); box-shadow: 0 0 0 1px rgba(0,0,0,0.12); transition: background .2s, width .2s; }
        .b-dots i.on { background: #fff; width: 16px; border-radius: 3px; }
        .b-case-txt { padding: 20px; }
        .b-case-seg { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
        .b-case h3 { font-size: 30px; margin: 6px 0 12px; }
        .b-case-antes { font-size: 14px; color: var(--muted); text-decoration: line-through; text-decoration-color: rgba(17,17,17,0.35); }
        .b-case-depois { font-size: 16px; margin-top: 4px !important; }
        .b-cta-row { margin-top: 32px; display: flex; justify-content: center; }
        .b-cta {
          display: inline-flex; align-items: center; justify-content: center; width: 100%;
          background: var(--ink); color: var(--lime); font-weight: 600; font-size: 16px;
          padding: 17px 28px; border-radius: 10px; text-decoration: none;
        }
        .tone-deep .b-cta { background: var(--lime); color: var(--ink); }

        /* depoimentos */
        .b-shots { columns: 1; column-gap: 16px; }
        .b-shot { break-inside: avoid; margin-bottom: 16px !important; background: #1c1b1a; border: 1px solid var(--deep-line); border-radius: 12px; overflow: hidden; }
        .b-shot img { display: block; width: 100%; height: auto; }

        /* linha do tempo */
        .b-timeline { list-style: none; padding: 0; display: grid; gap: 10px; }
        .b-timeline li { background: var(--surface); border-radius: 12px; padding: 18px 20px; border-left: 6px solid var(--line); }
        .b-timeline li.hot { border-left-color: var(--lime); }
        .b-timeline small { font-size: 12px; color: var(--muted); }
        .b-timeline b { display: block; font-family: var(--display); font-weight: 400; font-size: 26px; margin: 2px 0 4px; }
        .b-timeline p { font-size: 15px; color: var(--muted); }

        /* entregas */
        .b-dl { list-style: none; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1.5px solid var(--ink); }
        .b-dl li { padding: 16px 12px 16px 0; border-bottom: 1px solid var(--line); }
        .b-dl small { display: block; font-size: 12px; color: var(--muted); }
        .b-dl b { font-size: 16px; font-weight: 600; line-height: 1.25; }

        /* faq */
        .b-faq-wrap { display: grid; gap: 8px; }
        .b-faq { border-top: 1.5px solid var(--ink); }
        .b-faq details { border-bottom: 1px solid var(--line); }
        .b-faq summary {
          cursor: pointer; list-style: none; padding: 18px 36px 18px 0; position: relative;
          font-size: 17px; font-weight: 600;
        }
        .b-faq summary::-webkit-details-marker { display: none; }
        .b-faq summary::after {
          content: "+"; position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
          font-size: 24px; font-weight: 400; transition: transform .2s;
        }
        .b-faq details[open] summary::after { transform: translateY(-50%) rotate(45deg); }
        .b-faq details p { padding: 0 0 20px; color: var(--muted); font-size: 16px; max-width: 60ch; }

        .b-last { padding-bottom: 88px; }
        .b-footer { padding-block: 28px 96px; font-size: 13px; color: var(--deep-muted); }
        .b-footer-row { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
        .b-footer img { height: 26px; width: auto; max-width: 140px; object-fit: contain; }

        /* botão fixo no celular */
        .b-sticky {
          position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 50;
          display: flex; justify-content: center; padding: 16px; border-radius: 12px;
          background: var(--ink); color: var(--lime); font-weight: 600; font-size: 16px;
          text-decoration: none; box-shadow: 0 10px 30px rgba(17,17,17,0.25);
          transform: translateY(140%); transition: transform .25s ease;
        }
        .b-sticky.on { transform: none; }
        .adsb a:focus-visible, .adsb summary:focus-visible, .adsb button:focus-visible {
          outline: 3px solid var(--ink); outline-offset: 3px; border-radius: 6px;
        }
        .tone-deep a:focus-visible { outline-color: var(--lime); }
        @media (prefers-reduced-motion: reduce) {
          .b-sticky, .b-carousel img { transition: none; }
          html:has(.adsb) { scroll-behavior: auto; }
        }

        @media (min-width: 768px) {
          .b-wrap { padding-inline: 40px; }
          .b-h1 { font-size: 68px; }
          .b-h2 { font-size: 54px; }
          .b-sec { padding-block: 104px; }
          .b-steps { grid-template-columns: repeat(3, 1fr); column-gap: 32px; }
          .b-steps li { display: block; }
          .b-steps small { display: block; margin-bottom: 14px; }
          .b-flow { grid-template-columns: repeat(4, 1fr); }
          .b-flow div, .b-flow div:nth-child(even) { padding: 22px 24px; border-left: 1px solid var(--deep-line); border-bottom: 0; }
          .b-flow div:first-child { border-left: 0; padding-left: 0; }
          .b-cases { grid-template-columns: 1fr 1fr; gap: 24px; }
          .b-shots { columns: 2; column-gap: 20px; }
          .b-timeline { grid-template-columns: 1fr 1fr 1.6fr 1fr; }
          .b-dl { grid-template-columns: repeat(4, 1fr); column-gap: 24px; }
          .b-cta { width: auto; }
          .b-form { padding: 32px; }
          .b-footer { padding-bottom: 28px; }
          .b-footer-row { flex-direction: row; justify-content: space-between; align-items: center; }
          .b-h1 span + span { margin-top: 0; }
          .b-sticky { display: none; }
        }
        @media (min-width: 1024px) {
          .b-wrap { padding-inline: 64px; }
          .b-hero { padding-block: 36px 96px; }
          .b-logo { margin-bottom: 64px; }
          .b-h1 { font-size: 84px; }
          .b-h2 { font-size: 64px; }
          .b-lead { font-size: 19px; }
          .b-hero-grid {
            grid-template-columns: 1.1fr 0.9fr; grid-template-rows: auto 1fr;
            grid-template-areas: "copy form" "facts form"; column-gap: 72px; row-gap: 0;
            align-items: start;
          }
          .b-hero .b-form { margin-top: 70px; }
          .b-promise { font-size: 26px; }
          .b-flow b { font-size: 34px; }
          .b-shots { columns: 3; }
          .b-faq-wrap { grid-template-columns: 0.8fr 1.2fr; gap: 64px; }
        }
      `}</style>
    </div>
  );
}
