import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ContactSection } from "@/components/site/ContactSection";
import { cases } from "@/lib/cases";

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
        content:
          "Criamos a estratégia e a identidade visual da sua marca.",
      },
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
    <section className="container-page grid items-center gap-12 py-20 md:grid-cols-[1.2fr_1fr] md:gap-16 md:py-32">
      <div className="fade-up">
        <p className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
          Consultoria de marca
        </p>
        <h1 className="mt-6 text-5xl leading-[0.92] md:text-7xl lg:text-[5.5rem]">
          Criamos a estratégia e a identidade visual da sua{" "}
          <span className="italic text-orange-brand">marca.</span>
        </h1>
        <p className="mt-8 max-w-xl text-lg text-foreground/70 md:text-xl">
          Para negócios com um bom produto ou serviço que ainda não sabem como
          comunicar isso com clareza e precisam de uma marca que posicione,
          atraia e convença.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="#contato"
            className="inline-flex items-center justify-center rounded-full bg-orange-brand px-8 py-4 text-base font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            Quero transformar minha marca
          </a>
          <a
            href="#processo"
            className="inline-flex items-center justify-center rounded-full border border-ink/15 px-8 py-4 text-base font-semibold text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            Como trabalhamos
          </a>
        </div>
      </div>

      <div className="relative">
        <div className="aspect-square w-full overflow-hidden rounded-3xl bg-ink p-10 text-cream">
          <div className="flex h-full flex-col justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-lime-brand">
              Legacy BrandCo.®
            </p>
            <div>
              <p className="text-[clamp(3rem,9vw,6rem)] font-black leading-[0.85] tracking-tight">
                Estratégia
                <br />
                antes do
                <br />
                <span className="text-lime-brand italic">visual.</span>
              </p>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-cream/60">
              <span>Estab. 2017</span>
              <span>BR</span>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-6 -left-6 hidden h-24 w-24 rounded-2xl bg-orange-brand md:block" />
      </div>
    </section>
  );
}

function About() {
  const stats = [
    { value: "8+", label: "anos de experiência" },
    { value: "BR", label: "clientes em todo o Brasil" },
    { value: "★", label: "grandes players atendidos" },
  ];
  return (
    <section className="border-t border-ink/10">
      <div className="container-page grid gap-16 py-24 md:grid-cols-[1fr_1.4fr] md:py-32">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
            01 — Quem somos
          </p>
          <h2 className="mt-4 text-4xl md:text-5xl">
            Marca começa <br />
            <span className="text-orange-brand italic">antes</span> do visual.
          </h2>
        </div>
        <div className="space-y-6 text-lg text-foreground/75 md:text-xl">
          <p>
            A Legacy BrandCo. é uma consultoria especializada em estratégia de
            marca e identidade visual com mais de 8 anos de experiência.
            Atendemos negócios em todo o Brasil, de profissionais liberais a
            empresas em crescimento, e trabalhamos com grandes players do
            mercado.
          </p>
          <p>
            Nosso trabalho começa antes do visual. Entendemos o negócio, o
            mercado e o consumidor para depois traduzir tudo isso em uma marca
            coesa, profissional e de alto padrão.
          </p>
        </div>
      </div>

      <div className="container-page grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-background p-8">
            <p className="text-5xl font-black tracking-tight text-orange-brand md:text-6xl">
              {s.value}
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-widest text-foreground/60">
              {s.label}
            </p>
          </div>
        ))}
      </div>
      <div className="h-24" />
    </section>
  );
}

function Cases() {
  return (
    <section id="cases" className="border-t border-ink/10 bg-background">
      <div className="container-page py-24 md:py-32">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
              02 — Cases
            </p>
            <h2 className="mt-4 text-4xl md:text-5xl">
              Marcas que <span className="italic text-orange-brand">construímos.</span>
            </h2>
          </div>
          <p className="max-w-md text-lg text-foreground/70">
            Cada projeto começa com diagnóstico e termina com uma marca pronta
            para liderar.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cases.map((c, i) => (
            <Link
              key={c.slug}
              to="/cases/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-card transition-all hover:-translate-y-1 hover:border-orange-brand"
            >
              <div
                className="flex aspect-[4/3] items-end p-6"
                style={{
                  backgroundColor: c.accent,
                  color: c.accentText === "cream" ? "#f4f2ef" : "#121110",
                }}
              >
                <p className="text-[clamp(1.75rem,4vw,2.75rem)] font-black leading-none tracking-tight">
                  {c.name}
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6">
                <span className="inline-flex w-fit rounded-full border border-ink/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground/70">
                  {c.segment}
                </span>
                <p className="text-base text-foreground/75">{c.short}</p>
                <span className="mt-auto text-sm font-semibold text-orange-brand">
                  Ver case completo →
                </span>
              </div>
              <span className="sr-only">{`Case ${i + 1}: ${c.name}`}</span>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <Link
            to="/cases"
            className="text-base font-semibold text-foreground underline-offset-4 hover:text-orange-brand hover:underline"
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
    <section id="processo" className="border-t border-ink/10 bg-background">
      <div className="container-page py-24 md:py-32">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-foreground/60">
              03 — Processo
            </p>
            <h2 className="mt-4 text-4xl md:text-5xl">
              Como <span className="italic text-orange-brand">trabalhamos.</span>
            </h2>
            <p className="mt-6 max-w-md text-lg text-foreground/70">
              A maioria das agências começa pelo visual. Nós começamos pela
              estratégia.
            </p>
          </div>

          <div className="rounded-3xl bg-ink p-8 text-cream md:p-12">
            <p className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-[0.95] tracking-tight">
              <span className="text-lime-brand">80%</span> estratégia.
              <br />
              <span className="text-orange-brand">20%</span> execução visual.
            </p>
            <p className="mt-6 text-base text-cream/70 md:text-lg">
              Antes de criar qualquer logotipo, cor ou tipografia, entendemos
              profundamente o seu negócio, o mercado em que você atua e o
              consumidor que você quer atrair. A identidade visual é a
              consequência de tudo isso, não o ponto de partida.
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.n}
              className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-card p-8"
            >
              <p className="text-sm font-semibold text-orange-brand">{p.n}</p>
              <h3 className="text-2xl font-extrabold">{p.title}</h3>
              <p className="text-base text-foreground/70">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
