import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PrivacyButton } from "@/components/site/PrivacyDialog";
import { captureUtmsFromUrl, type UtmData } from "@/lib/utm";
import { dispararConversoesLead, eventoMeta } from "@/lib/conversoes";
import { useAbrirNoTopo } from "@/lib/useAbrirNoTopo";
import { useStickyCta } from "@/lib/useStickyCta";
import {
  BRASIL,
  PAISES,
  erroBR,
  erroExterior,
  limparBR,
  mascaraBR,
  telefoneLegivel,
  telefoneParaEnvio,
  type Pais,
} from "@/lib/telefone";
import { erroNome } from "@/lib/checkup";
import {
  PERGUNTAS,
  SEM_FATURAMENTO,
  foraDoRecorte,
  montarQualificacao,
  type Respostas,
} from "@/lib/identidade";

// Página do anúncio campeão da Principal ("Procuro 3 empresários"), escrita
// com a skill Página SPICED em 24/11/2026. Copy na ordem dos 10 movimentos;
// formulário de 5 perguntas + nome e WhatsApp no fim (#formulario).
// Regras do lead (recorte, mensagem da Lais) em src/lib/identidade.ts.

const LOGO = "/proposta/brand/legacy-logo-preto.webp";
const PAGINA = "/identidade";

export const Route = createFileRoute("/identidade")({
  head: () => ({
    meta: [
      { title: "Estratégia e identidade visual | Legacy BrandCo." },
      {
        name: "description",
        content:
          "Consultoria de marca para prestadores de serviço que já faturam. Definimos o que a sua empresa faz de diferente e transformamos isso em identidade visual e comunicação.",
      },
      { property: "og:title", content: "Estratégia e identidade visual | Legacy BrandCo." },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      {
        rel: "preload",
        href: "/proposta/fonts/inter-400.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/proposta/fonts/inter-600.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: PaginaIdentidade,
});

const CASES = [
  {
    src: "/proposta/cases/nutri-yuri-gomes.jpg",
    nome: "Yuri Gomes",
    seg: "Nutrição",
    texto:
      "Ele atendia só em Santos, com um valor de consulta abaixo do que o trabalho dele valia. Com a nova comunicação e a identidade visual, aumentou o valor das consultas, fechou a agenda do ano e hoje também atende em São Paulo e Alphaville.",
  },
  {
    src: "/proposta/cases/joana-co-1.jpg",
    nome: "Joana Ulmer",
    seg: "Educação financeira",
    texto:
      "Num mercado em que todo mundo comunica igual, definimos um posicionamento para o público de alta renda. Hoje ela vende produtos a partir de R$ 19 mil.",
  },
  {
    src: "/proposta/cases/308-network-1.jpg",
    nome: "308",
    seg: "Mercado imobiliário",
    texto:
      "O Leandro já tinha reputação construída no atendimento. A marca passou a deixar isso claro, literalmente preto no branco, para o cliente lembrar da 308 quando o assunto é imóvel.",
  },
];

const ENTREGAS = [
  {
    titulo: "O que você faz de diferente.",
    texto:
      "Estudamos o seu mercado e os seus concorrentes e definimos como a sua empresa quer ser vista e por que alguém deveria escolher você.",
  },
  {
    titulo: "O que dizer e como dizer.",
    texto:
      "A frase que apresenta o seu negócio, o tom de voz, as respostas para quem pede desconto e um guia para o Instagram e o site.",
  },
  {
    titulo: "A identidade visual.",
    texto: "Logotipo, cores, tipografia e aplicações, criados a partir das decisões anteriores.",
  },
];

// Rola suave até o formulário (o href fica de reserva).
function irParaFormulario(e: React.MouseEvent<HTMLAnchorElement>) {
  const alvo = document.getElementById("formulario");
  if (!alvo) return;
  e.preventDefault();
  alvo.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Cta() {
  return (
    <a href="#formulario" className="idt-cta" onClick={irParaFormulario}>
      Quero saber mais
    </a>
  );
}

function PaginaIdentidade() {
  useAbrirNoTopo();
  const sticky = useStickyCta(".idt-hero, .idt-form-sec, .idt-footer");
  return (
    <div className="idt">
      <EstiloIdentidade />
      <header className="idt-wrap idt-top">
        <img src={LOGO} alt="Legacy BrandCo." className="idt-logo" width={172} height={61} />
      </header>

      <main>
        {/* 1 · Desejo + próximo passo */}
        <section className="idt-hero">
          <div className="idt-wrap idt-hero-grid">
            <div>
              <h1 className="idt-h1">
                Identidade visual para o cliente entender por que escolher você, e não o
                concorrente.
              </h1>
              <p className="idt-lead">
                A Legacy é uma consultoria de marca para prestadores de serviço que já faturam.
                Primeiro a gente define o que a sua empresa faz de diferente. Depois transforma isso
                em identidade visual e comunicação. Projetos a partir de R$ 4.500.
              </p>
              <Cta />
              <p className="idt-note">
                Você responde 5 perguntas rápidas e a Lais, do nosso time, te chama no WhatsApp.
              </p>
            </div>
            <figure className="idt-foto idt-foto-hero">
              <img src="/proposta/cases/308-network-2.jpg" alt="Marca da 308" loading="eager" />
            </figure>
          </div>
        </section>

        {/* 2 · Ceticismo + autoridade */}
        <section className="idt-sec">
          <div className="idt-wrap idt-texto">
            <h2 className="idt-h2">Se você já trocou o logo e nada mudou</h2>
            <p>
              Pode ser que você já tenha pago por um logo novo, um site ou um social media, e o
              cliente continuou perguntando o preço antes de qualquer outra coisa. Isso acontece
              porque o visual veio antes da decisão sobre o que a marca precisa dizer.
            </p>
            <p>
              Há mais de 8 anos a Legacy constrói marcas para clínicas, consultórios, imobiliárias,
              escolas e especialistas. Em todos os projetos a ordem é a mesma: primeiro a
              estratégia, depois o visual.
            </p>
          </div>
        </section>

        {/* 3 · Dor + cena */}
        <section className="idt-sec idt-dark">
          <div className="idt-wrap idt-texto">
            <h2 className="idt-h2">O seu dia hoje</h2>
            <p className="idt-cena">
              São dez da noite e você ainda está respondendo mensagem. Alguém quer saber a diferença
              entre você e o lugar que cobra menos. Outra pessoa recebeu o orçamento há três dias e
              sumiu. Você explica de novo como funciona, por que custa isso e o que está incluído, e
              muitas vezes termina dando desconto para fechar.
            </p>
            <p>
              Enquanto isso, você vê um concorrente que você sabe que entrega menos com a agenda
              cheia e cobrando mais. É difícil não se perguntar se o problema é você.
            </p>
          </div>
        </section>

        {/* 4 · Custo de continuar */}
        <section className="idt-sec">
          <div className="idt-wrap idt-texto">
            <h2 className="idt-h2">O que isso custa</h2>
            <p>
              Cada desconto sai do seu resultado e cada orçamento sem resposta foi tempo de trabalho
              perdido. Somando tudo, boa parte da sua semana vai para convencer cliente em vez de
              atender. Os anos passam, você trabalha mais e o faturamento fica parecido. Aos poucos,
              o trabalho que você gostava de fazer vira obrigação.
            </p>
          </div>
        </section>

        {/* 5 · Causa + transformação */}
        <section className="idt-sec idt-linha">
          <div className="idt-wrap idt-texto">
            <h2 className="idt-h2">Por que isso acontece</h2>
            <p>
              Quando o cliente conversa com você, ele costuma fechar, porque pessoalmente você
              mostra o que faz de diferente. O problema é que, antes dessa conversa, ele olha o seu
              Instagram, o seu site e o seu orçamento. Se ali você parece igual aos outros, ele faz
              a única comparação possível, que é pelo preço.
            </p>
            <p>
              Por isso postar mais, baixar o preço ou trocar o logo não resolve. Nenhuma dessas
              saídas explica por que escolher você. E{" "}
              <strong className="idt-destaque">ninguém compra o que não entende</strong>.
            </p>
            <p>
              O nosso trabalho é organizar o que você faz de diferente e colocar isso em tudo o que
              o cliente vê antes de falar com você. Assim ele chega sabendo por que você, e você
              passa menos tempo convencendo e mais tempo fazendo o seu trabalho.
            </p>
          </div>
        </section>

        {/* 6 · Prova */}
        <section className="idt-sec idt-linha">
          <div className="idt-wrap">
            <h2 className="idt-h2">Marcas que fizemos</h2>
            <div className="idt-cases">
              {CASES.map((c) => (
                <article key={c.nome} className="idt-case">
                  <figure className="idt-foto">
                    <img src={c.src} alt={`Marca ${c.nome}`} loading="lazy" decoding="async" />
                  </figure>
                  <p className="idt-case-seg">{c.seg}</p>
                  <h3 className="idt-h3">{c.nome}</h3>
                  <p className="idt-case-texto">{c.texto}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 7 · O que a pessoa encontra */}
        <section className="idt-sec idt-linha">
          <div className="idt-wrap idt-texto">
            <h2 className="idt-h2">O que você recebe</h2>
            <ol className="idt-lista">
              {ENTREGAS.map((e, i) => (
                <li key={e.titulo}>
                  <span className="idt-num">{String(i + 1).padStart(2, "0")}</span>
                  <p>
                    <strong>{e.titulo}</strong> {e.texto}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 8 · Jornada */}
        <section className="idt-sec idt-linha">
          <div className="idt-wrap idt-texto">
            <h2 className="idt-h2">Como funciona</h2>
            <p>
              Começamos conversando para entender o seu negócio e os seus clientes. Depois estudamos
              o mercado e apresentamos o posicionamento e a mensagem para você validar. Só então
              criamos a identidade visual. No fim, você recebe a apresentação da marca, que também
              serve de guia para quem cuida da sua comunicação, e todos os arquivos. O projeto leva
              cerca de seis semanas.
            </p>
          </div>
        </section>

        {/* 9 · Condições */}
        <section className="idt-sec idt-linha">
          <div className="idt-wrap idt-texto">
            <h2 className="idt-h2">Condições</h2>
            <p>
              Os projetos começam em <strong>R$ 4.500</strong>. Trabalhamos com prestadores de
              serviço que já faturam: clínicas, consultórios, escritórios, consultorias,
              imobiliárias e especialistas com marca própria. Não atendemos restaurantes, bares,
              varejo nem moda.
            </p>
            <p>
              Da sua parte, o projeto pede tempo para as conversas e disposição para aplicar o que
              for decidido. A Legacy define e cria a marca. A gestão de redes, o tráfego e as vendas
              continuam com a sua empresa.
            </p>
          </div>
        </section>

        {/* 10 · Fecho + ação */}
        <section id="formulario" className="idt-sec idt-dark idt-form-sec">
          <div className="idt-wrap idt-hero-grid">
            <div className="idt-texto">
              <h2 className="idt-h2">Quem já é seu cliente sabe por que escolheu você.</h2>
              <p>
                A ideia é que quem ainda não é também perceba isso antes de pedir o preço. São 5
                perguntas, e depois a Lais te chama no WhatsApp.
              </p>
            </div>
            <Formulario />
          </div>
        </section>
      </main>

      <footer className="idt-footer">
        <div className="idt-wrap idt-footer-row">
          <img src={LOGO} alt="Legacy BrandCo." width={120} height={43} loading="lazy" />
          <div>
            © 2026 Legacy BrandCo. · <PrivacyButton className="idt-priv" />
          </div>
        </div>
      </footer>

      <a
        href="#formulario"
        className={`idt-sticky${sticky ? " on" : ""}`}
        aria-hidden={!sticky}
        tabIndex={sticky ? 0 : -1}
        onClick={irParaFormulario}
      >
        Quero saber mais
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Formulário: uma pergunta por tela, depois nome e WhatsApp.

type Tela = { t: "pergunta"; i: number } | { t: "nome" } | { t: "whatsapp" } | { t: "fim" };

function Formulario() {
  const [tela, setTela] = useState<Tela>({ t: "pergunta", i: 0 });
  const [respostas, setRespostas] = useState<Respostas>({});
  const [nome, setNome] = useState("");
  const [pais, setPais] = useState<Pais>(BRASIL);
  const [fone, setFone] = useState("");
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [fora, setFora] = useState(false);
  const utms = useRef<UtmData>({});
  const caixa = useRef<HTMLDivElement>(null);
  const primeiraTela = useRef(true);

  useEffect(() => {
    utms.current = captureUtmsFromUrl();
  }, []);

  // Foco no campo de cada tela nova, sem rolar a página no carregamento.
  useEffect(() => {
    if (primeiraTela.current) {
      primeiraTela.current = false;
      return;
    }
    caixa.current?.querySelector<HTMLElement>("input")?.focus({ preventScroll: true });
    if (tela.t === "nome") eventoMeta("IdentidadeContato");
  }, [tela]);

  function escolher(i: number, opcao: string) {
    if (i === 0 && !respostas.area) eventoMeta("IdentidadeInicio");
    const id = PERGUNTAS[i]!.id;
    setRespostas((r) => ({ ...r, [id]: opcao }));
    window.setTimeout(() => {
      setTela(i + 1 < PERGUNTAS.length ? { t: "pergunta", i: i + 1 } : { t: "nome" });
    }, 200);
  }

  function voltar() {
    setTentou(false);
    if (tela.t === "pergunta" && tela.i > 0) setTela({ t: "pergunta", i: tela.i - 1 });
    else if (tela.t === "nome") setTela({ t: "pergunta", i: PERGUNTAS.length - 1 });
    else if (tela.t === "whatsapp") setTela({ t: "nome" });
  }

  const erroFone = pais.iso === "BR" ? erroBR(fone) : erroExterior(fone);
  const erroDoNome = erroNome(nome);

  async function enviar() {
    if (erroFone) {
      setTentou(true);
      return;
    }
    setEnviando(true);
    setErro(null);
    const faturamento = respostas.faturamento ?? "";
    const semFaturamento = faturamento === SEM_FATURAMENTO;
    const foraRecorte = foraDoRecorte(respostas.area);
    const eventId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());
    try {
      const res = await fetch("/api/public/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim().replace(/\s+/g, " "),
          whatsapp: telefoneParaEnvio(pais, fone),
          faturamento,
          profissao: respostas.area ?? null,
          pagina: PAGINA,
          qualificacao: montarQualificacao(respostas),
          skip_meta: semFaturamento || foraRecorte,
          utm_source: utms.current.utm_source ?? null,
          utm_medium: utms.current.utm_medium ?? null,
          utm_campaign: utms.current.utm_campaign ?? null,
          utm_content: utms.current.utm_content ?? null,
          utm_term: utms.current.utm_term ?? null,
          gclid: utms.current.gclid ?? null,
          event_id: eventId,
          page_url: window.location.href,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Só quem fatura e está no recorte conta como Lead para a Meta.
      if (foraRecorte) eventoMeta("LeadForaDoRecorte");
      else if (semFaturamento) eventoMeta("LeadSemFaturamento");
      else
        dispararConversoesLead(
          eventId,
          faturamento,
          `+${telefoneLegivel(pais, fone).replace(/\D/g, "")}`,
        );

      setFora(foraRecorte);
      setTela({ t: "fim" });
    } catch (e) {
      console.error("[identidade] erro ao enviar", e);
      setErro("Não deu para enviar agora. Confira a conexão e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  const total = PERGUNTAS.length + 1;
  const passo = tela.t === "pergunta" ? tela.i + 1 : total;

  return (
    <div className="idt-card" ref={caixa}>
      {tela.t !== "fim" && (
        <>
          <div className="idt-card-top">
            <span>Quero saber mais</span>
            <span className="idt-count">
              {tela.t === "pergunta" ? `${passo} de ${PERGUNTAS.length}` : "Último passo"}
            </span>
          </div>
          <div className="idt-bar" aria-hidden>
            <i style={{ width: `${(passo / total) * 100}%` }} />
          </div>
        </>
      )}

      {tela.t === "pergunta" && (
        <div key={tela.i} className="idt-step">
          <h3 className="idt-q">{PERGUNTAS[tela.i]!.titulo}</h3>
          <div className="idt-opcoes">
            {PERGUNTAS[tela.i]!.opcoes.map((o) => (
              <button
                key={o}
                type="button"
                className={`idt-op ${respostas[PERGUNTAS[tela.i]!.id] === o ? "is-on" : ""}`}
                onClick={() => escolher(tela.i, o)}
              >
                {o}
              </button>
            ))}
          </div>
          {tela.i > 0 && (
            <button type="button" className="idt-back" onClick={voltar}>
              ← Voltar
            </button>
          )}
        </div>
      )}

      {tela.t === "nome" && (
        <form
          className="idt-step"
          onSubmit={(e) => {
            e.preventDefault();
            if (erroDoNome) return setTentou(true);
            setTentou(false);
            setTela({ t: "whatsapp" });
          }}
        >
          <h3 className="idt-q">Como você se chama?</h3>
          <input
            className={`idt-input ${tentou && erroDoNome ? "is-err" : ""}`}
            name="name"
            autoComplete="name"
            autoCapitalize="words"
            placeholder="Seu nome"
            value={nome}
            maxLength={100}
            onChange={(e) => {
              setTentou(false);
              setNome(e.target.value);
            }}
          />
          {tentou && erroDoNome && <p className="idt-err">{erroDoNome}</p>}
          <button className="idt-btn" type="submit">
            Continuar
          </button>
          <button type="button" className="idt-back" onClick={voltar}>
            ← Voltar
          </button>
        </form>
      )}

      {tela.t === "whatsapp" && (
        <form
          className="idt-step"
          onSubmit={(e) => {
            e.preventDefault();
            void enviar();
          }}
        >
          <h3 className="idt-q">Qual é o seu WhatsApp?</h3>
          <CampoWhatsApp
            pais={pais}
            digitos={fone}
            erro={erroFone}
            tentouEnviar={tentou}
            onPais={(p) => {
              setPais(p);
              setFone("");
            }}
            onDigitos={setFone}
          />
          {erro && <p className="idt-err">{erro}</p>}
          <button className="idt-btn" type="submit" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar"}
          </button>
          <p className="idt-note idt-note-form">Seus dados ficam só com a Legacy.</p>
          <button type="button" className="idt-back" onClick={voltar}>
            ← Voltar
          </button>
        </form>
      )}

      {tela.t === "fim" && (
        <div className="idt-step" role="status">
          {fora ? (
            <>
              <h3 className="idt-q">Recebemos o seu contato.</h3>
              <p className="idt-fim">
                No momento a Legacy trabalha só com prestadores de serviço, então não vamos
                conseguir atender o seu negócio agora. Obrigado pelo interesse.
              </p>
            </>
          ) : (
            <>
              <h3 className="idt-q">Recebemos as suas respostas.</h3>
              <p className="idt-fim">
                A Lais, do nosso time, vai te chamar no WhatsApp
                <strong> {telefoneLegivel(pais, fone)}</strong> para entender melhor o seu negócio.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/** WhatsApp igual ao do /checkup: país na frente (Brasil já escolhido), só DDD + número. */
function CampoWhatsApp({
  pais,
  digitos,
  erro,
  tentouEnviar,
  onPais,
  onDigitos,
}: {
  pais: Pais;
  digitos: string;
  erro: string | null;
  tentouEnviar: boolean;
  onPais: (p: Pais) => void;
  onDigitos: (d: string) => void;
}) {
  const [saiu, setSaiu] = useState(false);
  const br = pais.iso === "BR";
  const erro55 = !!erro && erro.includes("55 do país");
  const mostrarErro = !!erro && (tentouEnviar || (saiu && digitos.length > 0) || erro55);
  return (
    <>
      <div className={`idt-fone ${mostrarErro ? "is-err" : ""}`}>
        <div className="idt-pais">
          <span aria-hidden="true">
            {pais.bandeira} +{pais.ddi}
          </span>
          <select
            aria-label="País do WhatsApp"
            value={pais.iso}
            onChange={(e) => onPais(PAISES.find((p) => p.iso === e.target.value) ?? BRASIL)}
          >
            {PAISES.map((p) => (
              <option key={p.iso} value={p.iso}>
                {p.bandeira} {p.nome} (+{p.ddi})
              </option>
            ))}
          </select>
        </div>
        <input
          type="tel"
          name="tel"
          inputMode="tel"
          maxLength={20}
          autoComplete={br ? "tel-national" : "tel"}
          placeholder={br ? "(11) 98888-7777" : "Número com código de área"}
          value={br ? mascaraBR(digitos) : digitos}
          onChange={(e) => {
            setSaiu(false);
            onDigitos(
              br ? limparBR(e.target.value) : e.target.value.replace(/\D/g, "").slice(0, 15),
            );
          }}
          onBlur={() => setSaiu(true)}
          aria-invalid={mostrarErro}
        />
      </div>
      <p className="idt-fone-ajuda" aria-live="polite">
        {mostrarErro ? (
          <span className="idt-err">{erro}</span>
        ) : !erro ? (
          <span className="idt-ok">
            ✓ Confere: <b>{telefoneLegivel(pais, digitos)}</b>
          </span>
        ) : br ? (
          <span className="idt-dica">Só DDD + número. O +55 já está aí.</span>
        ) : null}
      </p>
    </>
  );
}

function EstiloIdentidade() {
  return (
    <style>{`
      @font-face { font-family: "LBC Inter"; font-weight: 400; font-display: swap; src: url("/proposta/fonts/inter-400.woff2") format("woff2"); }
      @font-face { font-family: "LBC Inter"; font-weight: 500; font-display: swap; src: url("/proposta/fonts/inter-500.woff2") format("woff2"); }
      @font-face { font-family: "LBC Inter"; font-weight: 600; font-display: swap; src: url("/proposta/fonts/inter-600.woff2") format("woff2"); }
      #lovable-badge { display: none !important; }
      .idt {
        --ink: #121212; --paper: #f2f2f0; --surface: #ffffff; --muted: #6e6e6e;
        --line: rgba(18,18,18,0.12); --lime: #b8ff80;
        min-height: 100svh; background: var(--paper); color: var(--ink);
        font-family: "LBC Inter", Inter, system-ui, sans-serif; font-size: 17px; line-height: 1.55;
        -webkit-font-smoothing: antialiased; overflow-x: hidden;
      }
      :where(.idt) :where(h1, h2, h3, p, ol, figure) { margin: 0; }
      .idt-wrap { max-width: 1120px; margin-inline: auto; padding-inline: 20px; }
      .idt-top { height: 64px; display: flex; align-items: center; }
      .idt-logo { height: 22px; width: auto; display: block; }

      .idt-hero { padding: 24px 0 64px; }
      .idt-hero-grid { display: grid; gap: 40px; }
      .idt-h1 { font-weight: 600; font-size: 32px; line-height: 1.06; letter-spacing: -0.045em; text-wrap: balance; }
      .idt-lead { font-size: 18px; color: #3a3a3a; margin-top: 20px !important; max-width: 46ch; text-wrap: pretty; }
      .idt-cta {
        display: inline-block; margin-top: 28px; padding: 17px 28px; border-radius: 10px;
        background: var(--ink); color: var(--paper); font-weight: 600; font-size: 16px; text-decoration: none;
      }
      .idt-cta:focus-visible { outline: 2px solid var(--ink); outline-offset: 3px; }
      .idt-note { font-size: 14px; color: var(--muted); margin-top: 12px !important; max-width: 46ch; }

      .idt-foto { position: relative; overflow: hidden; border-radius: 12px; background: #dcdcd8; aspect-ratio: 4 / 5; }
      .idt-foto img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
      .idt-foto-hero { aspect-ratio: 16 / 11; }

      .idt-sec { padding: 64px 0; }
      .idt-linha { border-top: 1px solid var(--line); }
      .idt-dark { background: var(--ink); color: var(--paper); }
      .idt-texto { max-width: 720px; }
      .idt-texto p + p { margin-top: 16px; }
      .idt-texto p { color: inherit; text-wrap: pretty; }
      .idt-h2 { font-weight: 600; font-size: 26px; line-height: 1.1; letter-spacing: -0.04em; margin-bottom: 20px !important; text-wrap: balance; }
      .idt-h3 { font-weight: 600; font-size: 22px; letter-spacing: -0.035em; line-height: 1.15; }
      .idt-cena { font-size: 21px; line-height: 1.45; letter-spacing: -0.02em; }
      .idt-dark .idt-texto p:not(.idt-cena) { color: rgba(242,242,240,.75); }
      .idt-destaque { font-weight: 600; text-decoration: underline; text-decoration-color: var(--lime); text-decoration-thickness: 3px; text-underline-offset: 4px; }

      .idt-cases { display: grid; gap: 40px; margin-top: 8px; }
      .idt-case-seg { font-size: 13px; color: var(--muted); margin-top: 16px !important; }
      .idt-case .idt-h3 { margin-top: 4px; }
      .idt-case-texto { font-size: 16px; color: #3a3a3a; margin-top: 8px !important; }

      .idt-lista { list-style: none; padding: 0; border-top: 1px solid var(--line); }
      .idt-lista li { display: flex; gap: 16px; padding: 18px 0; border-bottom: 1px solid var(--line); }
      .idt-num { font-size: 12px; color: var(--muted); padding-top: 5px; font-variant-numeric: tabular-nums; }

      .idt-form-sec { scroll-margin-top: 0; }
      .idt-card { background: var(--surface); color: var(--ink); border-radius: 16px; padding: 22px 20px 20px; }
      .idt-card-top { display: flex; justify-content: space-between; font-size: 13px; font-weight: 500; }
      .idt-count { color: var(--muted); font-variant-numeric: tabular-nums; }
      .idt-bar { height: 3px; background: var(--line); border-radius: 3px; margin-top: 12px; overflow: hidden; }
      .idt-bar i { display: block; height: 100%; background: var(--ink); transition: width .35s ease; }
      .idt-step { padding-top: 24px; animation: idt-in .25s ease both; }
      @keyframes idt-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      @media (prefers-reduced-motion: reduce) { .idt-step { animation: none; } .idt-bar i { transition: none; } }
      .idt-q { font-weight: 600; font-size: 21px; line-height: 1.2; letter-spacing: -0.03em; text-wrap: balance; }
      .idt-opcoes { display: grid; gap: 8px; margin-top: 18px; }
      .idt-op {
        text-align: left; font: inherit; font-size: 16px; font-weight: 500; color: var(--ink); background: var(--paper);
        border: 1px solid transparent; border-radius: 10px; padding: 14px 16px; cursor: pointer;
        transition: border-color .15s, background .15s, color .15s;
      }
      .idt-op:hover { border-color: var(--ink); }
      .idt-op.is-on { background: var(--ink); color: var(--paper); }
      .idt-op:focus-visible, .idt-btn:focus-visible, .idt-input:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
      .idt-input {
        display: block; width: 100%; box-sizing: border-box; margin-top: 18px; font: inherit; font-size: 18px;
        color: var(--ink); background: var(--paper); border: 1px solid var(--line); border-radius: 10px; padding: 15px 16px;
      }
      .idt-input.is-err, .idt-fone.is-err { border-color: #c62828; }
      .idt-err { color: #c62828; font-size: 14px; margin-top: 8px !important; }
      .idt-btn {
        display: block; width: 100%; margin-top: 16px; font: inherit; font-weight: 600; font-size: 16px;
        color: var(--paper); background: var(--ink); border: 0; border-radius: 10px; padding: 16px 20px; cursor: pointer;
      }
      .idt-btn:disabled { opacity: .6; cursor: progress; }
      .idt-back { display: block; margin: 14px auto 0; background: none; border: 0; font: inherit; font-size: 14px; color: var(--muted); cursor: pointer; }
      .idt-note-form { text-align: center; font-size: 13px; }
      .idt-fone { display: flex; margin-top: 18px; background: var(--paper); border: 1px solid var(--line); border-radius: 10px; }
      .idt-fone:focus-within { border-color: var(--ink); }
      .idt-pais { position: relative; display: flex; align-items: center; padding: 0 12px 0 14px; border-right: 1px solid var(--line); font-size: 16px; white-space: nowrap; }
      .idt-pais select { position: absolute; inset: 0; width: 100%; opacity: 0; cursor: pointer; font-size: 16px; }
      .idt-fone input { flex: 1; min-width: 0; border: 0; outline: none; background: transparent; color: var(--ink); font: inherit; font-size: 18px; padding: 15px 14px; }
      .idt-fone-ajuda { min-height: 20px; margin-top: 8px !important; font-size: 14px; }
      .idt-fone-ajuda .idt-err { margin: 0 !important; }
      .idt-ok { color: #2f7d32; }
      .idt-ok b { font-weight: 600; white-space: nowrap; }
      .idt-dica { color: var(--muted); }
      .idt-fim { margin-top: 12px !important; color: #3a3a3a; }

      .idt-footer { padding: 32px 0 96px; font-size: 13px; color: var(--muted); }
      .idt-footer-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; }
      .idt-footer img { height: 18px; width: auto; }
      .idt-priv { background: none; border: 0; padding: 0; font: inherit; color: inherit; text-decoration: underline; cursor: pointer; }

      .idt-sticky {
        position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 20; text-align: center;
        padding: 16px; border-radius: 10px; background: var(--ink); color: var(--paper); font-weight: 600; text-decoration: none;
        box-shadow: 0 10px 30px rgba(18,18,18,.25); transform: translateY(140%); transition: transform .25s ease;
      }
      .idt-sticky.on { transform: none; }

      @media (min-width: 768px) {
        .idt-wrap { padding-inline: 48px; }
        .idt-top { height: 80px; }
        .idt-logo { height: 28px; }
        .idt-hero { padding: 40px 0 112px; }
        .idt-hero-grid { grid-template-columns: minmax(0, 55fr) minmax(0, 45fr); gap: 64px; align-items: center; }
        .idt-h1 { font-size: 50px; }
        .idt-sec { padding: 104px 0; }
        .idt-h2 { font-size: 36px; }
        .idt-cena { font-size: 26px; }
        .idt-cases { grid-template-columns: repeat(3, 1fr); gap: 28px; }
        .idt-form-sec .idt-hero-grid { align-items: start; }
        .idt-card { padding: 28px; }
        .idt-sticky { display: none; }
        .idt-footer { padding-bottom: 40px; }
      }
    `}</style>
  );
}
