import { createFileRoute, Link } from "@tanstack/react-router";
import { useStickyCta } from "@/lib/useStickyCta";
import { EstiloSite, FONTE_PRELOAD } from "@/components/novo/Estilo";
import {
  CaseCarousel,
  Contato,
  Cta,
  Footer,
  Form,
  Header,
  Kicker,
  VITRINE,
} from "@/components/novo/Site";
import print1 from "@/assets/ads/IMG_1693.webp.asset.json";
import print2 from "@/assets/ads/IMG_1694.webp.asset.json";
import print3 from "@/assets/ads/IMG_1695.webp.asset.json";
import print4 from "@/assets/ads/IMG_1696.webp.asset.json";
import print5 from "@/assets/ads/IMG_1697.webp.asset.json";

// Home no visual da página B do teste A/B (/adsb), com a estrutura de site:
// menu, quem somos, cases com página própria, metodologia e contato.
// Não registra visita no teste A/B: os leads daqui entram com pagina "/",
// que o painel /crm/ab não conta.
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
        content: "Sua empresa é boa. Sua marca precisa mostrar isso.",
      },
    ],
    links: [FONTE_PRELOAD],
  }),
  component: Home,
});

const DEPOIMENTOS = [
  { src: print1.url, w: 900, h: 1314, alt: "Mensagem de cliente elogiando o projeto" },
  { src: print4.url, w: 900, h: 495, alt: "Mensagem de cliente sobre identidade visual" },
  { src: print2.url, w: 900, h: 1035, alt: "Mensagem de cliente sobre o resultado" },
  { src: print5.url, w: 900, h: 722, alt: "Mensagem de cliente elogiando o trabalho" },
  { src: print3.url, w: 900, h: 329, alt: "Mensagem de cliente sobre expectativas superadas" },
];

const PILARES = [
  {
    n: "01",
    t: "Diagnóstico e posicionamento",
    d: "Mapeamos o negócio, o mercado e o consumidor. Definimos como a marca deve se comportar, qual é o seu diferencial e o que ela vai comunicar.",
  },
  {
    n: "02",
    t: "Estratégia de marca",
    d: "Posicionamento, mensagem central, personalidade e tom de voz. A marca ganha clareza sobre o que falar, para quem e como.",
  },
  {
    n: "03",
    t: "Identidade visual",
    d: "Com a estratégia definida, criamos o sistema visual completo: logotipo, cores, tipografia, elementos de apoio e guia de marca.",
  },
];

const ETAPAS = [
  {
    sem: "Semana 1",
    t: "Pesquisa",
    d: "Você responde o Legacy Brand Canvas e fazemos as calls de alinhamento.",
  },
  { sem: "Semana 2", t: "Moodboard", d: "A direção visual da sua marca." },
  { sem: "Semanas 3 a 5", t: "Criação", d: "Testes, validação e apresentação da identidade." },
  { sem: "Semana 6", t: "Entrega", d: "Todos os arquivos organizados no Google Drive." },
];

const ENTREGAS = [
  "Narrativa da marca",
  "Logotipo e suas versões",
  "Elementos visuais",
  "Paleta de cores",
  "Tipografia da marca",
  "Aplicações no dia a dia",
  "Identidade do Instagram",
  "Todos os arquivos",
];

const FAQ = [
  {
    q: "O diagnóstico é pago?",
    a: "Não. São 25 minutos por vídeo em que mostramos onde a sua marca está perdendo valor e o que resolver primeiro. Você sai com essa leitura, contratando ou não.",
  },
  {
    q: "Quanto custa um projeto?",
    a: "Cada projeto é dimensionado para o momento do negócio. Apresentamos o investimento na reunião, junto com o que faz sentido para você.",
  },
  {
    q: "Quanto tempo leva?",
    a: "Cerca de 6 semanas, contadas a partir do momento em que você responde o Legacy Brand Canvas, a nossa ferramenta de estratégia.",
  },
  {
    q: "Vocês atendem a minha área?",
    a: "Atendemos profissionais liberais e empresas em todo o Brasil: saúde, estética, educação, advocacia, imobiliário, tecnologia e muito mais. O método começa pelo seu mercado, não por um modelo pronto.",
  },
  {
    q: "Já tenho logo. Ainda faz sentido?",
    a: "Faz. Muitos clientes chegam com uma logo e saem com uma marca: posicionamento, mensagem e um sistema visual que funciona em todos os pontos de contato.",
  },
  {
    q: "Meu negócio ainda não fatura. Posso preencher?",
    a: "Pode. Olhamos o momento do seu negócio e dizemos com sinceridade o que faz sentido agora.",
  },
];

function Home() {
  const sticky = useStickyCta(".b-hero, .b-last, .b-footer");

  return (
    <div className="lbc">
      {/* PRIMEIRA DOBRA */}
      <section className="b-hero b-hero-site tone-lime">
        <Header tom="tone-lime" />
        <div className="b-wrap b-hero-grid">
          <div className="b-hero-copy">
            <Kicker>Estratégia de marca e identidade visual</Kicker>
            <h1 className="b-d b-h1">
              <span>Sua empresa é boa.</span> <span>Sua marca precisa mostrar isso.</span>
            </h1>
            <p className="b-lead">
              Criamos a <strong>estratégia</strong> e a <strong>identidade visual</strong> de
              negócios que entregam bem, mas ainda não comunicam o próprio valor. O primeiro passo é
              um diagnóstico de <strong>25 minutos</strong>, sem custo.
            </p>
            <ul className="b-facts">
              <li>
                <b>+8 anos</b> construindo marcas
              </li>
              <li>
                <b>Brasil inteiro</b> de clientes
              </li>
              <li>
                <b>80%</b> estratégia
              </li>
            </ul>
          </div>
          <Form id="diagnostico" />
        </div>
      </section>

      {/* O QUE FAZEMOS */}
      <section className="b-sec tone-deep">
        <div className="b-wrap">
          <Kicker>O que fazemos</Kicker>
          <h2 className="b-d b-h2">Estratégia de marca e identidade visual</h2>
          <p className="b-promise">
            Primeiro definimos <strong>como sua marca se posiciona</strong>, o que ela fala e o que
            a diferencia. Só depois isso vira logo, cor e tipografia.
          </p>
          <div className="b-flow">
            {[
              ["Estratégia", "Posicionamento"],
              ["Estratégia", "Base de comunicação"],
              ["Estratégia", "Diferencial"],
              ["Resultado", "Identidade de alto padrão"],
            ].map(([k, v]) => (
              <div key={v}>
                <small>{k}</small>
                <b>{v}</b>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUEM SOMOS */}
      <section className="b-sec tone-surface">
        <div className="b-wrap">
          <Kicker>Quem somos</Kicker>
          <h2 className="b-d b-h2">Uma consultoria de marca, não um estúdio de logo</h2>
          <div className="b-about">
            <p>
              A Legacy BrandCo. é especializada em{" "}
              <strong>estratégia de marca e identidade visual</strong>, com mais de 8 anos de
              experiência. Atendemos negócios em todo o Brasil, de profissionais liberais a empresas
              em crescimento, e trabalhamos com grandes players do mercado.
            </p>
            <p>
              Nosso trabalho começa antes do visual. Entendemos o negócio, o mercado e o consumidor
              para depois traduzir tudo isso em uma{" "}
              <strong>marca coesa, profissional e de alto padrão</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* CASES */}
      <section className="b-sec tone-paper" id="cases">
        <div className="b-wrap">
          <Kicker>Cases</Kicker>
          <h2 className="b-d b-h2">Marcas que construímos</h2>
          <div className="b-cases">
            {VITRINE.map((c, i) => (
              <Link key={c.slug} to="/cases/$slug" params={{ slug: c.slug }} className="b-case">
                <CaseCarousel imgs={c.imgs} nome={c.nome} eager={i === 0} />
                <div className="b-case-txt">
                  <p className="b-case-seg">{c.seg}</p>
                  <h3 className="b-d">{c.nome}</h3>
                  <p className="b-case-antes">Antes: {c.antes}</p>
                  <p className="b-case-depois">{c.depois}</p>
                  <span className="b-case-mais">Ver case →</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="b-cta-row">
            <Cta />
            <Link to="/cases" className="b-link">
              Ver todos os cases →
            </Link>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="b-sec tone-deep">
        <div className="b-wrap">
          <Kicker>Depoimentos</Kicker>
          <h2 className="b-d b-h2">O que dizem os clientes</h2>
          <div className="b-shots">
            {DEPOIMENTOS.map((d) => (
              <figure key={d.src} className="b-shot">
                <img
                  src={d.src}
                  alt={d.alt}
                  width={d.w}
                  height={d.h}
                  loading="lazy"
                  decoding="async"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* METODOLOGIA */}
      <section className="b-sec tone-paper" id="processo">
        <div className="b-wrap">
          <Kicker>Metodologia</Kicker>
          <p className="b-big">
            80% estratégia. <em>20% execução visual.</em>
          </p>
          <p className="b-method-txt">
            Antes de criar qualquer logotipo, cor ou tipografia, entendemos o seu negócio, o mercado
            em que você atua e o consumidor que você quer atrair.{" "}
            <strong>A identidade visual é a consequência de tudo isso</strong>, não o ponto de
            partida.
          </p>
          <ol className="b-steps">
            {PILARES.map((p) => (
              <li key={p.n}>
                <small>{p.n}</small>
                <b>{p.t}</b>
                <p>{p.d}</p>
              </li>
            ))}
          </ol>

          <p className="b-method-sub">Da pesquisa à entrega final, em cerca de 6 semanas</p>
          <ol className="b-timeline">
            {ETAPAS.map((e, i) => (
              <li key={e.t} className={i === 2 ? "hot" : ""}>
                <small>{e.sem}</small>
                <b>{e.t}</b>
                <p>{e.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ENTREGAS */}
      <section className="b-sec tone-surface">
        <div className="b-wrap">
          <Kicker>O que você recebe</Kicker>
          <h2 className="b-d b-h2">Oito entregas que formam a sua marca</h2>
          <ol className="b-dl">
            {ENTREGAS.map((t, i) => (
              <li key={t}>
                <small>{String(i + 1).padStart(2, "0")}</small>
                <b>{t}</b>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="b-sec tone-paper">
        <div className="b-wrap b-faq-wrap">
          <div>
            <Kicker>Perguntas frequentes</Kicker>
            <h2 className="b-d b-h2">Antes de você preencher</h2>
          </div>
          <div className="b-faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Contato />
      <Footer />

      <a
        href="#contato"
        className={`b-sticky${sticky ? " on" : ""}`}
        aria-hidden={!sticky}
        tabIndex={sticky ? 0 : -1}
      >
        Quero meu diagnóstico gratuito
      </a>

      <EstiloSite />
    </div>
  );
}
