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
        content: "Criamos a estratégia e a identidade visual da sua marca.",
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
    <section className="container-page py-32 md:py-44">
      <div className="fade-up max-w-4xl">
        <h1 className="text-[34px] font-bold leading-[1.15] tracking-tight text-ink md:text-[56px] md:leading-[1.08]">
          Criamos a <span className="font-semibold italic">estratégia</span> e a{" "}
          <span className="font-semibold italic">identidade visual</span> da sua marca.
        </h1>
        <p className="mt-8 max-w-xl text-[18px] leading-[1.7] text-muted-foreground">
          Para negócios com um bom produto ou serviço que ainda não sabem como
          comunicar isso com clareza e precisam de uma marca que{" "}
          <span className="font-semibold text-ink">posicione, atraia e convença</span>.
        </p>
        <div className="mt-12">
          <a
            href="#contato"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-lime-brand to-[#a8f25a] px-7 py-3.5 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
          >
            Quero transformar minha marca
          </a>
        </div>
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

        <div className="mt-24 grid gap-12 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-5xl font-semibold tracking-tight text-ink md:text-6xl">
                {s.value}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
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
          {cases.map((c) => (
            <Link
              key={c.slug}
              to="/cases/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col"
            >
              <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-[8px] bg-[#ECE9E4] transition-opacity group-hover:opacity-90">
                <span className="text-3xl font-semibold tracking-tight text-ink/40">
                  {c.name}
                </span>
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
              80% estratégia. 20% execução visual.
            </p>
            <p className="text-[16px] leading-[1.75] text-muted-foreground">
              Antes de criar qualquer logotipo, cor ou tipografia, entendemos
              profundamente o seu negócio, o mercado em que você atua e o
              consumidor que você quer atrair. A identidade visual é a
              consequência de tudo isso, não o ponto de partida.
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
