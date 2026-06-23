import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ContactSection } from "@/components/site/ContactSection";
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
  }),
  component: CasesIndex,
});

function CasesIndex() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="container-page py-20 md:py-32">
        <p className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
          Cases
        </p>
        <h1 className="mt-4 text-5xl md:text-7xl">
          Marcas que <span className="italic text-orange-brand">construímos.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-foreground/70">
          Cada projeto começa com diagnóstico e termina com uma marca pronta
          para liderar.
        </p>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {cases.map((c) => (
            <Link
              key={c.slug}
              to="/cases/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col overflow-hidden rounded-3xl border border-ink/10 bg-card transition-all hover:-translate-y-1 hover:border-orange-brand"
            >
              <div
                className="flex aspect-[16/10] items-end p-8"
                style={{
                  backgroundColor: c.accent,
                  color: c.accentText === "cream" ? "#f4f2ef" : "#121110",
                }}
              >
                <p className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-none tracking-tight">
                  {c.name}
                </p>
              </div>
              <div className="flex flex-col gap-4 p-8">
                <span className="inline-flex w-fit rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  {c.segment}
                </span>
                <p className="text-base text-foreground/75">{c.short}</p>
                <span className="text-sm font-semibold text-orange-brand">
                  Ver case completo →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <ContactSection />
      <Footer />
    </div>
  );
}
