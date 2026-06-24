import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ContactSection } from "@/components/site/ContactSection";
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
  }),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container-page py-32 text-center">
        <h1 className="text-3xl font-bold text-ink">Case não encontrado</h1>
        <Link
          to="/cases"
          className="mt-6 inline-block text-sm text-ink underline underline-offset-4 hover:text-orange-brand"
        >
          Voltar para cases
        </Link>
      </div>
      <Footer />
    </div>
  ),
  component: CasePage,
});

function CasePage() {
  const { caseStudy: c } = Route.useLoaderData();
  const others = cases.filter((x) => x.slug !== c.slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <section className="container-page py-24 md:py-32">
        <Link
          to="/cases"
          className="text-xs font-normal uppercase tracking-[0.18em] text-muted-foreground hover:text-ink"
        >
          ← Todos os cases
        </Link>
        <p className="mt-12 section-label">{c.segment}</p>
        <h1 className="mt-6 max-w-4xl text-[40px] font-bold leading-[1.05] tracking-tight text-ink md:text-[56px]">
          {c.name}
        </h1>
        <p className="mt-8 max-w-2xl text-[18px] leading-[1.7] text-muted-foreground">
          {c.short}
        </p>
      </section>

      {/* Hero visual */}
      <section className="container-page">
        <div className="flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[8px] bg-[#ECE9E4]">
          {c.heroImage ? (
            <img src={c.heroImage} alt={c.name} loading="eager" className="h-full w-full object-cover" />
          ) : (
            <span className="text-6xl font-semibold tracking-tight text-ink/40">
              {c.name}
            </span>
          )}
        </div>
      </section>

      {/* Content blocks */}
      <section className="container-page grid gap-16 py-32 md:grid-cols-[1fr_2fr] md:py-40">
        <Block label="Contexto" body={c.context} />
        <Block label="Desafio" body={c.challenge} />
        <Block label="O que foi feito" body={c.delivery} />
      </section>

      {/* Gallery */}
      <section className="border-t border-ink/10">
        <div className="container-page py-32 md:py-40">
          <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
            <p className="section-label">Resultado</p>
            <h2 className="text-[28px] font-bold leading-tight tracking-tight text-ink md:text-[36px]">
              Aplicações da marca.
            </h2>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-[8px] bg-[#ECE9E4]"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink/10">
        <div className="container-page grid gap-10 py-32 md:grid-cols-[1.5fr_1fr] md:items-center md:py-40">
          <h2 className="text-[32px] font-bold leading-[1.15] tracking-tight text-ink md:text-[44px]">
            Quero uma marca assim.
          </h2>
          <div className="flex flex-col gap-4 md:items-end">
            <a
              href="/#contato"
              className="inline-flex w-fit items-center justify-center rounded-[4px] bg-orange-brand px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Começar meu projeto
            </a>
            <Link
              to="/cases"
              className="text-xs font-normal uppercase tracking-[0.18em] text-muted-foreground hover:text-ink"
            >
              Ver outros cases →
            </Link>
          </div>
        </div>
      </section>

      {/* Other cases */}
      <section className="border-t border-ink/10">
        <div className="container-page py-24">
          <p className="section-label">Outros cases</p>
          <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                to="/cases/$slug"
                params={{ slug: o.slug }}
                className="group flex flex-col"
              >
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[8px] bg-[#ECE9E4] transition-opacity group-hover:opacity-90">
                  <span className="text-3xl font-semibold tracking-tight text-ink/40">
                    {o.name}
                  </span>
                </div>
                <p className="mt-5 text-lg font-semibold text-ink">{o.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{o.segment}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </div>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <>
      <p className="section-label md:sticky md:top-24 md:self-start">{label}</p>
      <div className="text-[17px] leading-[1.75] text-ink/85">
        <p>{body}</p>
      </div>
    </>
  );
}
