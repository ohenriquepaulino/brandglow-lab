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
      <section className="container-page py-32 md:py-40">
        <p className="section-label">Cases</p>
        <h1 className="mt-8 max-w-3xl text-[34px] font-bold leading-[1.15] tracking-tight text-ink md:text-[56px] md:leading-[1.08]">
          Marcas que construímos.
        </h1>
        <p className="mt-8 max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
          Cada projeto começa com diagnóstico e termina com uma marca pronta
          para liderar.
        </p>

        <div className="mt-24 grid gap-x-8 gap-y-16 md:grid-cols-2">
          {cases.map((c) => (
            <Link
              key={c.slug}
              to="/cases/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col"
            >
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[8px] bg-[#ECE9E4] transition-opacity group-hover:opacity-90">
                <span className="text-4xl font-semibold tracking-tight text-ink/40">
                  {c.name}
                </span>
              </div>
              <p className="mt-6 text-xl font-semibold text-ink">{c.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.segment}</p>
              <p className="mt-3 max-w-md text-[15px] leading-[1.7] text-ink/75">
                {c.short}
              </p>
              <span className="mt-4 text-xs font-normal uppercase tracking-[0.18em] text-ink/70 group-hover:text-orange-brand">
                Ver case →
              </span>
            </Link>
          ))}
        </div>
      </section>
      <ContactSection />
      <Footer />
    </div>
  );
}
