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
        <h1 className="text-4xl font-black">Case não encontrado</h1>
        <Link
          to="/cases"
          className="mt-6 inline-block text-orange-brand underline"
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
      <section
        className="border-b border-ink/10"
        style={{
          backgroundColor: c.accent,
          color: c.accentText === "cream" ? "#f4f2ef" : "#121110",
        }}
      >
        <div className="container-page py-20 md:py-32">
          <Link
            to="/cases"
            className="text-sm font-semibold uppercase tracking-widest opacity-70 hover:opacity-100"
          >
            ← Todos os cases
          </Link>
          <span className="mt-8 inline-flex w-fit rounded-full border border-current/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            {c.segment}
          </span>
          <h1 className="mt-6 text-[clamp(3rem,10vw,7rem)] font-black leading-[0.9] tracking-tight">
            {c.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg opacity-80 md:text-xl">
            {c.short}
          </p>
        </div>
      </section>

      {/* Content blocks */}
      <section className="container-page grid gap-16 py-20 md:grid-cols-[1fr_2fr] md:py-32">
        <Block label="Contexto" body={c.context} />
        <Block label="Desafio" body={c.challenge} />
        <Block label="O que foi feito" body={c.delivery} />
      </section>

      {/* Gallery placeholder */}
      <section className="border-t border-ink/10 bg-background">
        <div className="container-page py-20 md:py-32">
          <p className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
            Resultado
          </p>
          <h2 className="mt-4 text-3xl md:text-5xl">
            Aplicações da <span className="italic text-orange-brand">marca.</span>
          </h2>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl"
                style={{
                  backgroundColor:
                    i % 3 === 0
                      ? c.accent
                      : i % 3 === 1
                        ? "#121110"
                        : "#ece9e4",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink/10">
        <div className="container-page grid gap-8 py-20 md:grid-cols-[1.5fr_1fr] md:items-center md:py-28">
          <h2 className="text-4xl md:text-6xl">
            Quero uma <span className="italic text-orange-brand">marca assim.</span>
          </h2>
          <div className="flex flex-col gap-4 md:items-end">
            <a
              href="/#contato"
              className="inline-flex items-center justify-center rounded-full bg-orange-brand px-8 py-4 text-base font-semibold text-white"
            >
              Começar meu projeto
            </a>
            <Link
              to="/cases"
              className="text-sm font-semibold text-foreground/70 hover:text-orange-brand"
            >
              Ver outros cases →
            </Link>
          </div>
        </div>
      </section>

      {/* Other cases */}
      <section className="border-t border-ink/10 bg-background">
        <div className="container-page py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
            Outros cases
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {others.map((o) => (
              <Link
                key={o.slug}
                to="/cases/$slug"
                params={{ slug: o.slug }}
                className="group flex items-center justify-between rounded-2xl border border-ink/10 bg-card p-8 transition-colors hover:border-orange-brand"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-foreground/60">
                    {o.segment}
                  </p>
                  <p className="mt-2 text-3xl font-black tracking-tight">
                    {o.name}
                  </p>
                </div>
                <span className="text-orange-brand">→</span>
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
      <p className="text-sm font-semibold uppercase tracking-widest text-foreground/60 md:sticky md:top-24 md:self-start">
        {label}
      </p>
      <div className="text-lg text-foreground/80 md:text-xl">
        <p>{body}</p>
      </div>
    </>
  );
}
