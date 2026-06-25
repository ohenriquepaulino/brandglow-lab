import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ContactSection } from "@/components/site/ContactSection";
import { HeroSlider } from "@/components/site/HeroSlider";
import { cases } from "@/lib/cases";
import img308OutBanner from "@/assets/308-network/308-network-out-banner.webp.asset.json";
import imgMoewaPosterManifesto from "@/assets/moewa/moewa-poster-manifesto.png.asset.json";
import imgGeri from "@/assets/geriacademy/geriacademy-page-0060.webp.asset.json";
import imgJoanaBillboardQuote from "@/assets/joana-ulmer/joana-ulmer-billboard-quote.webp.asset.json";

const heroSlides = [
  { src: img308OutBanner.url, alt: "308NETWORK — campanha out of home" },
  { src: imgMoewaPosterManifesto.url, alt: "MOEWA — manifesto da marca" },
  { src: imgGeri.url, alt: "Geriacademy — identidade de marca" },
  { src: imgJoanaBillboardQuote.url, alt: "Joana Ulmer Co — campanha de marca" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Legacy BrandCo. — Estratégia e identidade visual de marca" },
      {
        name: "description",
        content:
          "Consultoria brasileira de estratégia de marca e identidade visual. Posicionamento, narrativa e sistema visual para negócios que querem liderar.",
      },
      { property: "og:title", content: "Legacy BrandCo." },
      {
        property: "og:description",
        content: "Criamos a estratégia e a identidade visual da sua marca.",
      },
    ],
    links: [
      { rel: "preload", as: "image", href: heroSlides[0].src, fetchpriority: "high" },
    ],
  }),
  component: Home,
});


function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <About />
      <Cases />
      <Process />
      <ContactSection />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-ink text-cream">
      {/* subtle texture / vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 85% 90%, rgba(207,255,135,0.18), transparent 60%)",
        }}
      />
      <div className="container-page relative z-10 grid min-h-[calc(100vh-4rem)] grid-cols-1 items-center gap-12 py-20 md:grid-cols-12 md:gap-10 md:py-28">
        {/* Left: copy */}
        <div className="fade-up md:col-span-7">
          <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-cream/60">
            <span className="h-px w-8 bg-cream/40" />
            <span>Estratégia & Identidade Visual</span>
          </div>

          <h1 className="mt-7 text-[40px] font-bold leading-[0.98] tracking-[-0.02em] text-cream sm:text-[56px] md:text-[76px] lg:text-[88px]">
            Marcas que
            <br />
            <span className="text-cream/40">posicionam,</span>
            <br />
            atraem
            <br />
            <span className="text-orange-brand">e convencem.</span>
          </h1>

          <p className="mt-8 max-w-md text-[15px] leading-[1.7] text-cream/70 md:text-[16px]">
            Consultoria de estratégia e identidade visual para negócios com
            bom produto que ainda não comunicam isso com clareza.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
            <a
              href="#contato"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-lime-brand to-[#a8f25a] px-7 py-3.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
            >
              Quero transformar minha marca
            </a>
            <a
              href="#cases"
              className="inline-flex items-center text-sm font-medium text-cream/80 underline underline-offset-4 hover:text-cream"
            >
              Ver cases →
            </a>
          </div>

          {/* Credibility row */}
          <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-cream/15 pt-8">
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-cream/50">Experiência</dt>
              <dd className="mt-2 text-2xl font-bold text-cream">+8 anos</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-cream/50">Atuação</dt>
              <dd className="mt-2 text-2xl font-bold text-cream">Brasil</dd>
            </div>
            <div>
              <dt className="text-[11px] uppercase tracking-[0.18em] text-cream/50">Método</dt>
              <dd className="mt-2 text-2xl font-bold text-cream">80/20</dd>
            </div>
          </dl>
        </div>

        {/* Right: contained slider panel */}
        <div className="md:col-span-5">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-cream/10 bg-ink/40 shadow-2xl shadow-black/40">
            <HeroSlider slides={heroSlides} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-ink/80 to-transparent p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-cream/70">
                Cases em destaque
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



function About() {
  return (
    <section className="border-t border-ink/10">
      <div className="container-page py-32 md:py-40">
        <div className="grid gap-16 md:grid-cols-[1fr_2fr]">
          <p className="section-label">02 — Quem somos</p>
          <div className="grid gap-10 text-[17px] leading-[1.75] text-ink/85 md:grid-cols-2">
            <p>
              A Legacy BrandCo. é uma consultoria especializada em{" "}
              <span className="font-semibold text-ink">estratégia de marca e identidade visual</span>{" "}
              com mais de 8 anos de experiência. Atendemos negócios em todo o
              Brasil, de profissionais liberais a empresas em crescimento, e
              trabalhamos com grandes players do mercado.
            </p>
            <p>
              Nosso trabalho começa antes do visual. Entendemos o negócio, o
              mercado e o consumidor para depois traduzir tudo isso em uma{" "}
              <span className="font-semibold text-ink">marca coesa, profissional e de alto padrão</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Cases() {
  return (
    <section id="cases" className="border-t border-ink/10">
      <div className="container-page py-32 md:py-40">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <p className="section-label">03 — Cases</p>
          <p className="max-w-xl text-[17px] leading-[1.7] text-muted-foreground">
            Cada projeto começa com diagnóstico e termina com uma marca pronta
            para liderar.
          </p>
        </div>

        <div className="mt-20 grid gap-x-8 gap-y-16 md:grid-cols-3">
          {cases.filter((c) => c.slug !== "joana-co").slice(0, 3).map((c) => (
            <Link
              key={c.slug}
              to="/cases/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col"
            >
              <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-[#ECE9E4] transition-opacity group-hover:opacity-90">
                {c.heroImage ? (
                  <img src={c.heroImage} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-semibold tracking-tight text-ink/40">
                    {c.name}
                  </span>
                )}
              </div>
              <p className="mt-6 text-lg font-semibold text-ink">{c.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.segment}</p>
              <span className="mt-4 text-xs font-normal uppercase tracking-[0.18em] text-ink/70 group-hover:text-orange-brand">
                Ver case →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-16">
          <Link
            to="/cases"
            className="text-sm text-ink underline underline-offset-4 hover:text-orange-brand"
          >
            Ver todos os cases →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Process() {
  const pillars = [
    {
      n: "01",
      title: "Diagnóstico e Posicionamento",
      body:
        "Mapeamos o negócio, o mercado e o consumidor. Definimos como a marca deve se comportar, qual é o seu diferencial e o que ela vai comunicar.",
    },
    {
      n: "02",
      title: "Estratégia de Marca",
      body:
        "Construímos o posicionamento, a mensagem central, a personalidade e o tom de voz. A marca ganha clareza sobre o que falar, para quem falar e como falar.",
    },
    {
      n: "03",
      title: "Identidade Visual",
      body:
        "Com a estratégia definida, criamos o sistema visual completo: logotipo, paleta de cores, tipografia, elementos de apoio e guia de marca para aplicação consistente.",
    },
  ];

  return (
    <section id="processo" className="border-t border-ink/10">
      <div className="container-page py-32 md:py-40">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <p className="section-label">04 — Metodologia</p>
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <p className="text-[32px] font-bold leading-[1.15] tracking-tight text-ink md:text-[40px]">
              <span className="text-orange-brand">80%</span> estratégia.{" "}
              <span className="text-ink/40">20% execução visual.</span>
            </p>
            <p className="text-[16px] leading-[1.75] text-muted-foreground">
              Antes de criar qualquer logotipo, cor ou tipografia, entendemos
              profundamente o seu negócio, o mercado em que você atua e o
              consumidor que você quer atrair.{" "}
              <span className="font-semibold text-ink">A identidade visual é a consequência de tudo isso</span>,
              não o ponto de partida.
            </p>
          </div>
        </div>

        <div className="mt-24 border-t border-ink/10">
          {pillars.map((p) => (
            <div
              key={p.n}
              className="grid gap-6 border-b border-ink/10 py-10 md:grid-cols-[80px_1fr_2fr] md:gap-12 md:py-12"
            >
              <p className="text-sm text-muted-foreground">{p.n}</p>
              <h3 className="text-lg font-semibold text-ink">{p.title}</h3>
              <p className="text-[16px] leading-[1.75] text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
