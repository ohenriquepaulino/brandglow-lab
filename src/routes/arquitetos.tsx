import { createFileRoute } from "@tanstack/react-router";
import { ADS_CSS, depoimentos } from "@/components/ads/PaginaAdsA";
import { ContactSection } from "@/components/site/ContactSection";
import { PrivacyButton } from "@/components/site/PrivacyDialog";
import { useAbrirNoTopo } from "@/lib/useAbrirNoTopo";
import { useStickyCta } from "@/lib/useStickyCta";

// Teste só com arquitetos (desde 2026-11-17): a narrativa da aba ICP da
// /central, camada 2 ("ser bom não bastou"), escrita para o arquiteto se
// reconhecer. Mesmo visual, formulário e depoimentos da /adsa; o lead chega no
// CRM com pagina=/arquitetos. Fora do teste A/B da /ads.
export const Route = createFileRoute("/arquitetos")({
  head: () => ({
    meta: [
      { title: "Marca para escritórios de arquitetura | Legacy BrandCo." },
      {
        name: "description",
        content:
          "Consultoria de marca para arquitetos: estudamos o seu mercado, definimos o que o seu escritório faz de diferente e criamos a identidade visual e a comunicação a partir disso.",
      },
      { property: "og:title", content: "Marca para escritórios de arquitetura | Legacy BrandCo." },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      {
        rel: "preload",
        href: "/proposta/fonts/inter-400.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/proposta/fonts/inter-600.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: PaginaArquitetos,
});

const LOGO = "/proposta/brand/legacy-logo-preto.webp";

const CASES = [
  { src: "/proposta/cases/moewa-1.jpg", nome: "MOEWA", seg: "Estética e longevidade" },
  { src: "/proposta/cases/308-network-1.jpg", nome: "308NETWORK", seg: "Decisões patrimoniais" },
  { src: "/proposta/cases/mariana-brumatti.jpg", nome: "Mariana Brumatti", seg: "Estética" },
];

const PARA_QUEM = [
  "Tem escritório próprio de arquitetura ou de interiores.",
  "Já tem projetos entregues e clientes que indicam você.",
  "Manda muito orçamento e fecha pouco.",
  "Quer parar de disputar cliente pelo preço.",
];

const NAO_PARA_QUEM = [
  "Está começando e ainda não tem projetos entregues.",
  "Procura só um logo novo.",
  "Procura alguém para postar no seu Instagram.",
];

function Label({ children }: { children: React.ReactNode }) {
  return <p className="ads-label">{children}</p>;
}

function Formulario() {
  return (
    <div className="ads-card ads-form-slot">
      <p className="ads-form-title">Quero saber mais</p>
      <p className="ads-form-sub">A gente te chama no WhatsApp</p>
      <ContactSection
        redirectTo="/obrigado"
        redirectToNoRevenue="/tks"
        hideInstagram
        showProfession
        revenueLabel="Faturamento mensal do escritório"
        ctaLabel="Quero saber mais"
        ctaNote="Resposta em até 1 dia útil"
        hidePrivacy
      />
    </div>
  );
}

function PaginaArquitetos() {
  useAbrirNoTopo();
  const sticky = useStickyCta(".ads-first, .ads-last, .ads-footer");
  return (
    <div className="ads-page arq-page">
      <header className="ads-topbar">
        <div className="ads-container ads-topbar-inner">
          <a href="#formulario" className="ads-logo-link" aria-label="Ir para o formulário">
            <img
              src={LOGO}
              alt="Legacy BrandCo."
              className="ads-logo"
              width={172}
              height={61}
              loading="eager"
            />
          </a>
        </div>
      </header>

      <main>
        {/* Dobra com formulário */}
        <section className="ads-section ads-first">
          <div className="ads-container ads-hero-grid">
            <div className="ads-hero-copy">
              <Label>ARQUITETOS E ESCRITÓRIOS</Label>
              <h1 className="ads-h1 arq-h1">
                Você estudou, se especializou e projeta melhor que o escritório concorrente.{" "}
                <strong>Mesmo assim, é ele que fecha as obras que você queria.</strong>
              </h1>
              <p className="ads-body ads-measure">
                A Legacy é uma consultoria de marca. A gente estuda o seu mercado, define o que o
                seu escritório faz de diferente e cria a sua identidade visual e a sua comunicação a
                partir disso.
              </p>
            </div>
            <Formulario />
          </div>
        </section>

        {/* O dia a dia */}
        <section className="ads-section arq-dia">
          <div className="ads-container">
            <p className="arq-texto">
              O cliente pede orçamento para três escritórios e escolhe pelo valor. Pergunta se dá
              para fazer só a planta, ou se você cobre o preço do outro. Na maioria das vezes, ele
              nem chegou a entender o que o seu projeto tem de diferente.
            </p>
          </div>
        </section>

        {/* Para quem é */}
        <section className="ads-section arq-para">
          <div className="ads-container">
            <Label>PARA QUEM É</Label>
            <div className="arq-colunas">
              <div>
                <h2 className="ads-h2">
                  É <strong>para você</strong> se
                </h2>
                <ul className="arq-lista">
                  {PARA_QUEM.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="ads-h2 ads-dim">Não é para você se</h2>
                <ul className="arq-lista arq-lista-nao">
                  {NAO_PARA_QUEM.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Cases */}
        <section className="ads-section arq-cases-sec">
          <div className="ads-container">
            <Label>CASES</Label>
            <h2 className="ads-h2">
              Algumas marcas que <strong>construímos</strong>
            </h2>
            <div className="arq-cases">
              {CASES.map((c) => (
                <a key={c.nome} href="#formulario" className="arq-case">
                  <img src={c.src} alt={`Projeto ${c.nome}`} loading="lazy" decoding="async" />
                  <div className="ads-slider-cap">
                    <span className="ads-slider-seg">{c.seg}</span>
                    <span className="ads-slider-nome">{c.nome}</span>
                  </div>
                </a>
              ))}
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
                    <img
                      src={d.src}
                      alt={d.alt}
                      width={d.w}
                      height={d.h}
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                </a>
              ))}
            </div>
            <div className="ads-cta-row">
              <a href="#formulario" className="ads-cta">
                Quero saber mais
              </a>
            </div>
          </div>
        </section>

        {/* Formulário final */}
        <section id="formulario" className="ads-section ads-last">
          <div className="ads-container ads-hero-grid">
            <div>
              <Label>PRÓXIMO PASSO</Label>
              <h2 className="ads-h2">
                Entenda como funciona para o <strong>seu escritório</strong>.
              </h2>
              <p className="ads-body ads-measure">
                Deixe o seu contato para entender como funciona o projeto da Legacy para o seu
                escritório. A gente te chama no WhatsApp.
              </p>
            </div>
            <Formulario />
          </div>
        </section>
      </main>

      <footer className="ads-footer">
        <div className="ads-container ads-footer-row">
          <img src={LOGO} alt="Legacy BrandCo." width={172} height={61} loading="lazy" />
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
        Quero saber mais
      </a>

      <style>{ADS_CSS}</style>
      <style>{`
        .arq-page .arq-h1 { font-size: 30px; line-height: 1.12; }
        .arq-dia { background: #121110; color: #F4F2EF; }
        .arq-texto { font-size: 22px; line-height: 1.4; letter-spacing: -0.03em; max-width: 34ch; margin: 0 auto; text-align: center; }
        .arq-colunas { display: grid; gap: 48px; text-align: left; }
        .arq-lista { list-style: none; padding: 0; margin: 0; border-top: 1px solid rgba(18,17,16,0.15); }
        .arq-lista li { padding: 14px 0 14px 28px; border-bottom: 1px solid rgba(18,17,16,0.1); position: relative; font-size: 16px; line-height: 1.4; }
        .arq-lista li::before { content: "✓"; position: absolute; left: 0; top: 14px; color: #D75631; font-weight: 600; }
        .arq-lista-nao li { color: rgba(18,17,16,0.6); }
        .arq-lista-nao li::before { content: "✕"; color: rgba(18,17,16,0.4); }
        .arq-cases { display: grid; gap: 16px; }
        .arq-case { position: relative; display: block; overflow: hidden; border-radius: 12px; aspect-ratio: 16 / 10; background: #ddd; }
        .arq-case img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        @media (max-width: 767px) {
          .arq-page .ads-first .arq-h1 { font-size: 24px; }
          .arq-texto { font-size: 19px; }
        }
        @media (min-width: 768px) {
          .arq-colunas { grid-template-columns: 1fr 1fr; gap: 64px; }
          .arq-cases { grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .arq-case { aspect-ratio: 4 / 5; }
        }
        @media (min-width: 1024px) {
          .arq-page .arq-h1 { font-size: 44px; }
          .arq-texto { font-size: 30px; }
        }
      `}</style>
    </div>
  );
}
