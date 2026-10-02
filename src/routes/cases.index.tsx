import { createFileRoute, Link } from "@tanstack/react-router";
import { EstiloSite, FONTE_PRELOAD } from "@/components/novo/Estilo";
import { CaseCarousel, Contato, Footer, Header, Kicker, VITRINE } from "@/components/novo/Site";
import { cases } from "@/lib/cases";

export const Route = createFileRoute("/cases/")({
  head: () => ({
    meta: [
      { title: "Cases — Legacy BrandCo." },
      {
        name: "description",
        content:
          "Marcas que construímos: estratégia, posicionamento e identidade visual para negócios em todo o Brasil.",
      },
      { property: "og:title", content: "Cases — Legacy BrandCo." },
      {
        property: "og:description",
        content: "Conheça os projetos de marca da Legacy BrandCo.",
      },
    ],
    links: [FONTE_PRELOAD],
  }),
  component: CasesIndex,
});

function CasesIndex() {
  return (
    <div className="lbc">
      <Header />
      <section className="b-sec tone-paper">
        <div className="b-wrap">
          <Kicker>Cases</Kicker>
          <h1 className="b-d b-case-h1">Marcas que construímos</h1>
          <p className="b-lead">
            Cada projeto começa com diagnóstico e termina com uma marca pronta para liderar.
          </p>

          <div className="b-cases" style={{ marginTop: 48 }}>
            {cases.map((c, i) => {
              const vitrine = VITRINE.find((v) => v.slug === c.slug);
              return (
                <Link key={c.slug} to="/cases/$slug" params={{ slug: c.slug }} className="b-case">
                  {vitrine ? (
                    <CaseCarousel imgs={vitrine.imgs} nome={c.name} eager={i === 0} />
                  ) : (
                    <div className="b-static">
                      {c.heroImage && <img src={c.heroImage} alt={c.name} loading="lazy" />}
                    </div>
                  )}
                  <div className="b-case-txt">
                    <p className="b-case-seg">{c.segment}</p>
                    <h2 className="b-d" style={{ fontSize: 30, margin: "6px 0 12px" }}>
                      {c.name}
                    </h2>
                    <p className="b-case-depois">{c.short}</p>
                    <span className="b-case-mais">Ver case →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <Contato titulo="Quer uma marca assim?" />
      <Footer />
      <EstiloSite />
    </div>
  );
}
