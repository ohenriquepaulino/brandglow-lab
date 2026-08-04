import { createFileRoute } from "@tanstack/react-router";
import { ContactSection } from "@/components/site/ContactSection";
import logo from "@/assets/logo-legacy-v2.png.asset.json";
import heroImage from "@/assets/ads/ads-hero-placeholder.jpg";

export const Route = createFileRoute("/ads")({
  head: () => ({
    meta: [
      { title: "Diagnóstico de marca | Legacy BrandCo." },
      {
        name: "description",
        content:
          "Consultoria de estratégia de marca e identidade visual. Preencha o formulário e receba um diagnóstico da sua marca.",
      },
      { property: "og:title", content: "Diagnóstico de marca | Legacy BrandCo." },
      {
        property: "og:description",
        content:
          "Estratégia de marca e identidade visual para negócios que já entregam resultado.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: AdsPage,
});

/* SUBSTITUIR: depoimentos reais. Editar array abaixo. */
const depoimentos = [
  {
    texto:
      "Depoimento de exemplo. Substituir por texto do cliente descrevendo o que mudou no negócio depois do projeto.",
    nome: "Nome do Cliente",
    cargo: "Cargo, Empresa",
    foto: "",
  },
  {
    texto:
      "Depoimento de exemplo. Substituir por texto do cliente descrevendo o que mudou no negócio depois do projeto.",
    nome: "Nome do Cliente",
    cargo: "Cargo, Empresa",
    foto: "",
  },
  {
    texto:
      "Depoimento de exemplo. Substituir por texto do cliente descrevendo o que mudou no negócio depois do projeto.",
    nome: "Nome do Cliente",
    cargo: "Cargo, Empresa",
    foto: "",
  },
];

const etapas = [
  {
    numero: "01",
    titulo: "Diagnóstico e Posicionamento",
    descricao:
      "Mapeamos o negócio, o mercado e o consumidor. Definimos como a marca deve se comportar, qual é o diferencial e o que ela vai comunicar.",
  },
  {
    numero: "02",
    titulo: "Estratégia de Marca",
    descricao:
      "Construímos o posicionamento, a mensagem central, a personalidade e o tom de voz. A marca ganha clareza sobre o que falar, para quem falar e como falar.",
  },
  {
    numero: "03",
    titulo: "Identidade Visual",
    descricao:
      "Criamos o sistema visual completo: logotipo, paleta de cores, tipografia, elementos de apoio e guia de marca para aplicação consistente.",
  },
];

const fazSentido = [
  "Já tem um produto ou serviço que entrega resultado",
  "Vende, mas sente que cobra abaixo do que entrega",
  "Cresceu e a marca ficou para trás",
  "Parece igual aos seus concorrentes",
];

const naoFazSentido = [
  "Está começando agora e ainda testando a oferta",
  "Procura só um logotipo rápido",
  "Não quer participar do processo de decisão",
];

const diagnostico = [
  { numero: "01", texto: "Você preenche o formulário. Leva menos de um minuto." },
  {
    numero: "02",
    texto:
      "Analisamos seu perfil antes da conversa. Chegamos sabendo do que se trata.",
  },
  {
    numero: "03",
    texto:
      "Sessão de 40 minutos por vídeo. Mostramos onde sua marca está perdendo valor e o que precisa ser resolvido primeiro. Você sai com essa leitura, contratando ou não.",
  },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="ads-label">{children}</p>
  );
}

function FormSlot() {
  return (
    <div className="ads-card ads-form-slot">
      <ContactSection />
    </div>
  );
}

function AdsPage() {
  return (
    <div className="ads-page">
      <header className="ads-topbar">
        <div className="ads-container ads-topbar-inner">
          <img
            src={logo.url}
            alt="Legacy BrandCo."
            className="ads-logo"
            width={160}
            height={32}
            loading="eager"
          />
        </div>
      </header>

      <main>
        {/* Dobra com formulário */}
        <section className="ads-section ads-first">
          <div className="ads-container ads-hero-grid">
            <div className="ads-hero-copy">
              <Label>CONSULTORIA DE MARCA</Label>
              <h1 className="ads-h1">
                Construímos a estratégia e a identidade visual da sua empresa
              </h1>
              <p className="ads-body ads-measure">
                Em poucos dias você sai com sua identidade visual renovada e com
                a comunicação clara para poder atender melhor seus clientes e
                vender mais
              </p>
            </div>
            <FormSlot />
          </div>
        </section>

        {/* Imagem full-bleed */}
        <section className="ads-fullbleed">
          {/* SUBSTITUIR: imagem principal da dobra */}
          <img
            src={heroImage}
            alt=""
            aria-hidden="true"
            width={1920}
            height={1080}
            loading="eager"
          />
        </section>

        {/* Sobre */}
        <section className="ads-section">
          <div className="ads-container ads-about">
            <div className="ads-about-cols">
              <div>
                <Label>SOBRE</Label>
                <p className="ads-body ads-about-text">
                  A Legacy BrandCo. é uma consultoria de estratégia de marca e
                  identidade visual com mais de 8 anos de operação. Atendemos
                  negócios em todo o Brasil, de profissionais liberais a
                  empresas em crescimento.
                </p>
              </div>
              <div>
                <p className="ads-body ads-about-text">
                  Nosso trabalho começa antes do visual. Entendemos o negócio, o
                  mercado e o consumidor, e só depois traduzimos isso em uma
                  marca.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Método 80/20 */}
        <section className="ads-section">
          <div className="ads-container ads-method">
            <div>
              <Label>MÉTODO</Label>
              <p className="ads-method-title">
                <span className="ads-accent">80%</span> estratégia.
                <br />
                <span className="ads-dim">20% execução visual.</span>
              </p>
            </div>
            <p className="ads-body ads-measure">
              Antes de definir logotipo, cor ou tipografia, entendemos o que o
              seu negócio faz, contra quem ele compete e quem precisa ser
              convencido. A identidade visual é a conclusão desse processo, não
              o começo dele.
            </p>
          </div>
        </section>

        {/* Três etapas */}
        <section className="ads-section">
          <div className="ads-container">
            <ul className="ads-steps">
              {etapas.map((e) => (
                <li key={e.numero} className="ads-step">
                  <span className="ads-step-num">{e.numero}</span>
                  <h3 className="ads-step-title">{e.titulo}</h3>
                  <p className="ads-body ads-secondary">{e.descricao}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="ads-section">
          <div className="ads-container">
            <Label>DEPOIMENTOS</Label>
            <h2 className="ads-h2">O que dizem sobre o nosso trabalho</h2>
            <div className="ads-testimonials">
              {depoimentos.map((d, i) => (
                <figure key={i} className="ads-card ads-testimonial">
                  <blockquote className="ads-body">{d.texto}</blockquote>
                  <div className="ads-spacer" />
                  <figcaption className="ads-person">
                    {d.foto ? (
                      <img
                        src={d.foto}
                        alt={d.nome}
                        className="ads-avatar"
                        width={44}
                        height={44}
                        loading="lazy"
                      />
                    ) : (
                      <span className="ads-avatar ads-avatar-empty" aria-hidden="true" />
                    )}
                    <span>
                      <span className="ads-person-name">{d.nome}</span>
                      <span className="ads-person-role">{d.cargo}</span>
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Para quem é */}
        <section className="ads-section">
          <div className="ads-container">
            <Label>PARA QUEM É</Label>
            <div className="ads-fit">
              <div className="ads-fit-col">
                <h2 className="ads-h3">Faz sentido se você</h2>
                <ul className="ads-list">
                  {fazSentido.map((t) => (
                    <li key={t} className="ads-body">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="ads-fit-col ads-fit-col-right">
                <h2 className="ads-h3">Não faz sentido se você</h2>
                <ul className="ads-list ads-secondary">
                  {naoFazSentido.map((t) => (
                    <li key={t} className="ads-body">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="ads-cta-row">
              <a href="#formulario" className="ads-cta">
                Quero meu diagnóstico
              </a>
            </div>
          </div>
        </section>

        {/* Como funciona a conversa */}
        <section className="ads-section">
          <div className="ads-container">
            <Label>O DIAGNÓSTICO</Label>
            <div className="ads-diag">
              {diagnostico.map((d) => (
                <div key={d.numero}>
                  <span className="ads-diag-num">{d.numero}</span>
                  <p className="ads-body">{d.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulário final */}
        <section id="formulario" className="ads-section ads-last">
          <div className="ads-container ads-hero-grid">
            <div>
              <Label>DIAGNÓSTICO</Label>
              <h2 className="ads-h2">Vamos olhar sua marca de perto.</h2>
              <p className="ads-body ads-measure">
                Preencha o formulário. Nossa equipe analisa seu perfil e entra
                em contato em até 1 dia útil para agendar.
              </p>
            </div>
            <FormSlot />
          </div>
        </section>
      </main>

      <style>{`
        .ads-page {
          background: #F4F2EF;
          color: #121110;
          font-family: Inter, system-ui, sans-serif;
          letter-spacing: normal;
          scroll-behavior: smooth;
        }
        .ads-container {
          max-width: 1200px;
          margin-inline: auto;
          padding-inline: 24px;
        }
        .ads-topbar { height: 64px; display: flex; align-items: center; }
        .ads-topbar-inner { width: 100%; display: flex; justify-content: center; }
        .ads-logo { height: 28px; width: auto; }
        .ads-section { padding-block: 80px; }
        .ads-first { padding-top: 24px; }
        .ads-last { padding-bottom: 64px; }
        .ads-label {
          font-size: 11px; font-weight: 500; text-transform: uppercase;
          letter-spacing: 0.12em; color: #D75631; margin: 0 0 16px;
        }
        .ads-h1 {
          font-size: 34px; font-weight: 600; line-height: 1.1;
          letter-spacing: -0.02em; margin: 0; font-style: normal;
        }
        .ads-h2 { font-size: 26px; font-weight: 600; line-height: 1.15; margin: 0 0 24px; }
        .ads-h3 { font-size: 20px; font-weight: 600; line-height: 1.2; margin: 0 0 8px; }
        .ads-body { font-size: 16px; font-weight: 400; line-height: 1.6; margin: 0; }
        .ads-measure { max-width: 40ch; margin-top: 24px; }
        .ads-secondary, .ads-secondary * { color: rgba(18,17,16,0.6); }
        .ads-accent { color: #D75631; }
        .ads-dim { color: rgba(18,17,16,0.4); }
        .ads-hero-grid { display: grid; gap: 40px; }
        .ads-card {
          background: #FFFFFF; padding: 24px; border: 1px solid rgba(18,17,16,0.08);
          border-radius: 8px;
        }
        .ads-fullbleed { width: 100%; }
        .ads-fullbleed img { display: block; width: 100%; height: 320px; object-fit: cover; }
        .ads-about-cols { display: grid; gap: 32px; }
        .ads-about-text { max-width: 42ch; }
        .ads-method { display: grid; gap: 32px; }
        .ads-method-title {
          font-size: 44px; font-weight: 700; line-height: 1; letter-spacing: -0.02em; margin: 0;
        }
        .ads-steps { list-style: none; margin: 0; padding: 0; border-top: 1px solid rgba(18,17,16,0.1); }
        .ads-step { padding-block: 32px; border-bottom: 1px solid rgba(18,17,16,0.1); }
        .ads-step-num { display: block; color: #D75631; font-weight: 500; font-size: 14px; }
        .ads-step-title { font-size: 20px; font-weight: 600; margin: 8px 0 12px; }
        .ads-step p { color: rgba(18,17,16,0.6); }
        .ads-testimonials { display: grid; gap: 24px; }
        .ads-testimonial { display: flex; flex-direction: column; }
        .ads-testimonial blockquote { margin: 0; }
        .ads-spacer { flex: 1 1 auto; min-height: 24px; }
        .ads-person { display: flex; align-items: center; gap: 12px; }
        .ads-avatar { width: 44px; height: 44px; border-radius: 9999px; object-fit: cover; flex: 0 0 auto; }
        .ads-avatar-empty { background: rgba(18,17,16,0.08); display: block; }
        .ads-person-name { display: block; font-size: 15px; font-weight: 600; }
        .ads-person-role { display: block; font-size: 13px; color: rgba(18,17,16,0.6); }
        .ads-fit { display: grid; gap: 32px; }
        .ads-fit-col-right { border-top: 1px solid rgba(18,17,16,0.1); padding-top: 32px; }
        .ads-list { list-style: none; margin: 16px 0 0; padding: 0; }
        .ads-list li { padding-block: 16px; border-bottom: 1px solid rgba(18,17,16,0.1); }
        .ads-list li:first-child { border-top: 1px solid rgba(18,17,16,0.1); }
        .ads-cta-row { margin-top: 40px; display: flex; }
        .ads-cta {
          display: inline-flex; align-items: center; justify-content: center;
          background: #CFFF87; color: #121110; font-size: 15px; font-weight: 600;
          padding: 16px 28px; border-radius: 8px; text-decoration: none;
          width: 100%;
        }
        .ads-cta:focus-visible, .ads-page a:focus-visible, .ads-page button:focus-visible,
        .ads-page input:focus-visible, .ads-page select:focus-visible {
          outline: 2px solid #121110; outline-offset: 2px;
        }
        .ads-diag { display: grid; gap: 32px; }
        .ads-diag-num { display: block; color: #D75631; font-size: 32px; font-weight: 600; margin-bottom: 12px; }

        /* Reaproveita o componente de formulário existente sem alterá-lo */
        .ads-form-slot > section { border: 0 !important; background: transparent !important; }
        .ads-form-slot > section > div { padding: 0 !important; max-width: none !important; width: 100% !important; }
        .ads-form-slot > section > div > div {
          display: block !important; gap: 0 !important;
        }
        .ads-form-slot > section > div > div > *:first-child { display: none !important; }
        .ads-form-slot > section > div > div > * + * { border: 0 !important; padding: 0 !important; }

        @media (min-width: 768px) {
          .ads-fullbleed img { height: 520px; }
          .ads-testimonials { grid-template-columns: repeat(3, 1fr); gap: 32px; }
          .ads-diag { grid-template-columns: repeat(3, 1fr); gap: 48px; }
          .ads-cta { width: auto; }
        }

        @media (min-width: 1024px) {
          .ads-container { padding-inline: 80px; }
          .ads-topbar { height: 80px; }
          .ads-topbar-inner { justify-content: flex-start; }
          .ads-logo { height: 32px; }
          .ads-section { padding-block: 140px; }
          .ads-first { padding-top: 40px; }
          .ads-last { padding-bottom: 120px; }
          .ads-label { font-size: 12px; }
          .ads-h1 { font-size: 56px; }
          .ads-h2 { font-size: 36px; }
          .ads-body { font-size: 17px; }
          .ads-hero-grid { grid-template-columns: 55% 45%; gap: 80px; align-items: start; }
          .ads-card { padding: 32px; }
          .ads-about { display: grid; grid-template-columns: 1fr 2fr; }
          .ads-about-cols { grid-column: 2; grid-template-columns: repeat(2, minmax(0, 420px)); gap: 80px; }
          .ads-method { grid-template-columns: 1fr 1fr; gap: 80px; }
          .ads-method-title { font-size: 72px; }
          .ads-step {
            display: grid; grid-template-columns: 60px 280px 1fr; gap: 24px;
            padding-block: 40px; align-items: start;
          }
          .ads-step-title { margin: 0; }
          .ads-fit { grid-template-columns: 1fr 1fr; gap: 64px; }
          .ads-fit-col-right {
            border-top: 0; padding-top: 0; border-left: 1px solid rgba(18,17,16,0.1);
            padding-left: 64px;
          }
          .ads-diag-num { font-size: 32px; }
        }
      `}</style>
    </div>
  );
}
