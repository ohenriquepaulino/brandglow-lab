import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ContactSection } from "@/components/site/ContactSection";
import { PrivacyButton } from "@/components/site/PrivacyDialog";
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

// Peças do site institucional (home e cases) no visual da página B. A /adsb
// tem as dela; aqui ficam cópias com navegação e links para os cases.

export const LOGO = "/proposta/brand/legacy-logo-preto.webp";
export const LOGO_LIGHT = "/proposta/brand/legacy-logo-branco.webp";

const FORM_PROPS = {
  redirectTo: "/obrigado",
  redirectToNoRevenue: "/tks",
  hideInstagram: true,
  showProfession: true,
  revenueLabel: "Faturamento mensal da empresa",
  ctaLabel: "Quero meu diagnóstico",
  ctaNote: "Gratuito · 25 min por vídeo · resposta em até 1 dia útil",
} as const;

// MOEWA: os assets originais têm 2 MB cada; as versões da proposta são leves.
const MOEWA = (f: string) => `/proposta/cases/moewa/moewa-${f}.jpg`;

/** Os cases da home, com o slug da página de cada um (src/lib/cases.ts). */
export const VITRINE = [
  {
    slug: "308-network",
    imgs: [n308Banner, n308Correndo, n308Metro, n308Bone, n308Cartao, n308Site].map((a) => a.url),
    nome: "308NETWORK",
    seg: "Decisões patrimoniais",
    antes: "Imobiliária tradicional",
    depois: "Referência em decisões patrimoniais inteligentes, pronta para expandir.",
  },
  {
    slug: "moewa",
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
    slug: "geriacademy",
    imgs: [geri60, geri44, geri49, geri53, geri54, geri57].map((a) => a.url),
    nome: "Geriacademy",
    seg: "Educação médica",
    antes: "Cursos de geriatria",
    depois: "Uma instituição que lidera um movimento de valorização da saúde do idoso.",
  },
  {
    slug: "joana-co",
    imgs: [joanaQuote, joanaBag, joanaEvent, joanaHoodies, joanaLaptop, joanaPhone].map(
      (a) => a.url,
    ),
    nome: "Joana co*",
    seg: "Educação financeira",
    antes: "Marca pessoal sem direção",
    depois: "Um posicionamento que cabe numa pergunta: quanto você investiria na sua paz?",
  },
];

const NAV = [
  { label: "Cases", href: "/cases" },
  { label: "Processo", href: "/#processo" },
  { label: "Contato", href: "/#contato" },
];

export function Header({ tom = "tone-paper" }: { tom?: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <header className={`b-header ${tom}`}>
      <div className="b-wrap">
        <div className="b-header-row">
          <Link to="/" className="b-header-logo" aria-label="Legacy BrandCo. — Início">
            <img src={LOGO} alt="Legacy BrandCo." width={172} height={61} />
          </Link>
          <nav className="b-nav" aria-label="Principal">
            {NAV.map((l) => (
              <a key={l.label} href={l.href}>
                {l.label}
              </a>
            ))}
            <a href="/#contato" className="b-nav-cta">
              Diagnóstico gratuito
            </a>
          </nav>
          <button
            className="b-menu-btn"
            aria-expanded={aberto}
            aria-controls="menu-site"
            onClick={() => setAberto((v) => !v)}
          >
            {aberto ? "Fechar" : "Menu"}
          </button>
        </div>
        {aberto && (
          <ul className="b-menu" id="menu-site">
            {[...NAV, { label: "Diagnóstico gratuito", href: "/#contato" }].map((l) => (
              <li key={l.label}>
                <a href={l.href} onClick={() => setAberto(false)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="b-footer tone-deep">
      <div className="b-wrap b-footer-row">
        <img src={LOGO_LIGHT} alt="Legacy BrandCo." width={120} height={43} loading="lazy" />
        <nav className="b-footer-nav" aria-label="Rodapé">
          {NAV.map((l) => (
            <a key={l.label} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <div>
          © 2026 Legacy BrandCo. · <PrivacyButton />
        </div>
      </div>
    </footer>
  );
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="b-kicker">{children}</p>;
}

export function Form({ id }: { id?: string }) {
  return (
    <div className="b-form" id={id}>
      <p className="b-form-title">Diagnóstico gratuito</p>
      <p className="b-form-sub">Preencha e agendamos 25 minutos por vídeo com você.</p>
      <ContactSection {...FORM_PROPS} />
    </div>
  );
}

export function Cta({ href = "#contato", children = "Quero meu diagnóstico" }) {
  return (
    <a href={href} className="b-cta">
      {children}
    </a>
  );
}

/** Seção final com o formulário (âncora #contato). */
export function Contato({ titulo = "Vamos olhar a sua marca de perto" }: { titulo?: string }) {
  return (
    <section className="b-sec tone-lime b-last" id="contato">
      <div className="b-wrap b-hero-grid">
        <div>
          <Kicker>Próximo passo</Kicker>
          <h2 className="b-d b-h2">{titulo}</h2>
          <p className="b-lead">
            Nossa equipe analisa o seu perfil e entra em contato em <strong>até 1 dia útil</strong>{" "}
            para agendar.
          </p>
        </div>
        <Form />
      </div>
    </section>
  );
}

const INTERVALO_MS = 1800;

/**
 * Imagens do case trocando sozinhas a cada 1,8 s. Para carregar rápido: só a
 * primeira vem com a página; as outras são baixadas uma a uma, só com o card
 * perto da tela, e a troca só acontece depois que a próxima já decodificou.
 */
export function CaseCarousel({
  imgs,
  nome,
  eager,
}: {
  imgs: string[];
  nome: string;
  eager: boolean;
}) {
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
