import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { EstiloSite, FONTE_PRELOAD } from "@/components/novo/Estilo";
import { Contato, Footer, Header, Kicker } from "@/components/novo/Site";
import { cases, getCase } from "@/lib/cases";

export const Route = createFileRoute("/cases/$slug")({
  loader: ({ params }) => {
    const c = getCase(params.slug);
    if (!c) throw notFound();
    return { caseStudy: c };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.caseStudy.name} — Case Legacy BrandCo.` },
          { name: "description", content: loaderData.caseStudy.short },
          {
            property: "og:title",
            content: `${loaderData.caseStudy.name} — Legacy BrandCo.`,
          },
          { property: "og:description", content: loaderData.caseStudy.short },
        ]
      : [],
    links: [FONTE_PRELOAD],
  }),
  notFoundComponent: () => (
    <div className="lbc">
      <Header />
      <section className="b-sec tone-paper">
        <div className="b-wrap">
          <h1 className="b-d b-h2">Case não encontrado</h1>
          <Link to="/cases" className="b-link">
            Voltar para os cases
          </Link>
        </div>
      </section>
      <Footer />
      <EstiloSite />
    </div>
  ),
  component: CasePage,
});

function CasePage() {
  const { caseStudy: c } = Route.useLoaderData();
  const outros = cases.filter((x) => x.slug !== c.slug);
  const galeria = (c.gallery ?? []).filter((src) => src !== c.heroImage);

  return (
    <div className="lbc">
      <Header />

      <section className="b-sec tone-paper" style={{ paddingTop: 40 }}>
        <div className="b-wrap">
          <Link to="/cases" className="b-back">
            ← Todos os cases
          </Link>
          <Kicker>{c.segment}</Kicker>
          <h1 className="b-d b-case-h1">{c.name}</h1>
          <p className="b-lead">{c.short}</p>
          {c.heroImage && (
            <div className="b-case-cover">
              <img src={c.heroImage} alt={c.name} loading="eager" />
            </div>
          )}
        </div>
      </section>

      <section className="b-sec tone-surface">
        <div className={`b-wrap b-blocks${c.result ? " quatro" : ""}`}>
          <Bloco titulo="Contexto" texto={c.context} />
          <Bloco titulo="Desafio" texto={c.challenge} />
          <Bloco titulo="O que fizemos" texto={c.delivery} />
          {c.result && <Bloco titulo="Resultado" texto={c.result} />}
        </div>
      </section>

      {galeria.length > 0 && (
        <section className="b-sec tone-paper">
          <div className="b-wrap">
            <Kicker>Galeria</Kicker>
            <h2 className="b-d b-h2">Aplicações da marca</h2>
            <div className="b-gallery">
              {galeria.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`${c.name} — aplicação ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="b-sec tone-deep">
        <div className="b-wrap">
          <Kicker>Outros cases</Kicker>
          <div className="b-cases">
            {outros.map((o) => (
              <Link key={o.slug} to="/cases/$slug" params={{ slug: o.slug }} className="b-case">
                <div className="b-static">
                  {o.heroImage && <img src={o.heroImage} alt={o.name} loading="lazy" />}
                </div>
                <div className="b-case-txt">
                  <p className="b-case-seg">{o.segment}</p>
                  <h3 className="b-d">{o.name}</h3>
                  <span className="b-case-mais">Ver case →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Contato titulo="Quero uma marca assim" />
      <Footer />
      <EstiloSite />
    </div>
  );
}

function Bloco({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="b-block">
      <Kicker>{titulo}</Kicker>
      <p>{texto}</p>
    </div>
  );
}
