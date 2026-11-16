import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PrivacyButton } from "@/components/site/PrivacyDialog";
import { captureUtmsFromUrl, type UtmData } from "@/lib/utm";
import { leadSignal } from "@/lib/lead-signal";
import { dispararConversoesLead, eventoMeta } from "@/lib/conversoes";
import { BRASIL, erroBR, limparBR, mascaraBR, telefoneParaEnvio } from "@/lib/telefone";
import {
  PERGUNTAS,
  PONTOS,
  ROTULO_NOTA,
  diagnosticar,
  listaComE,
  type CheckupDados,
  type Diagnostico,
  type Ponto,
  type Respostas,
} from "@/lib/checkup";

// Diagnóstico de marca: 7 perguntas, nome e WhatsApp, resultado na tela.
// Conteúdo e regras em src/lib/checkup.ts.

const LOGO = "/proposta/brand/legacy-logo-preto.webp";
const WHATSAPP_LAIS = "5511966064917";
const VIDEO_COMO_FUNCIONA = "/v/apresentacao-44nj-legacy";
const SEM_FATURAMENTO = "Ainda não estou faturando";
// Guarda o resultado: recarregar a página mostra o diagnóstico de novo, sem reenviar.
const STORAGE = "lbc_checkup_v1";

export const Route = createFileRoute("/checkup")({
  head: () => ({
    meta: [
      { title: "Diagnóstico de marca | Legacy BrandCo." },
      {
        name: "description",
        content: "Diagnóstico de marca em 3 passos: 7 perguntas rápidas e o resultado na tela.",
      },
      { property: "og:title", content: "Diagnóstico de marca | Legacy BrandCo." },
      {
        property: "og:description",
        content: "7 perguntas rápidas sobre o seu negócio e o diagnóstico da sua marca na tela.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      {
        rel: "preload",
        href: "/proposta/fonts/inter-600.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: CheckupPage,
});

type Tela =
  | { t: "inicio" }
  | { t: "pergunta"; i: number }
  | { t: "nome" }
  | { t: "whatsapp" }
  | { t: "resultado" };

type Resultado = {
  nome: string;
  respostas: Respostas;
  diag: Diagnostico;
  qualificado: boolean;
};

function lerSalvo(): Resultado | null {
  try {
    const s = sessionStorage.getItem(STORAGE);
    return s ? (JSON.parse(s) as Resultado) : null;
  } catch {
    return null;
  }
}

function CheckupPage() {
  const [tela, setTela] = useState<Tela>({ t: "inicio" });
  const [respostas, setRespostas] = useState<Respostas>({});
  const [nome, setNome] = useState("");
  const [fone, setFone] = useState("");
  const [tentou, setTentou] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const utms = useRef<UtmData>({});
  const topo = useRef<HTMLDivElement>(null);

  useEffect(() => {
    utms.current = captureUtmsFromUrl();
    const salvo = lerSalvo();
    if (salvo) {
      setResultado(salvo);
      setTela({ t: "resultado" });
    }
  }, []);

  // Cada tela nova começa do topo, com o foco no primeiro campo.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    topo.current?.querySelector<HTMLElement>("input, textarea")?.focus({ preventScroll: true });
    if (tela.t === "nome") eventoMeta("CheckupContato");
  }, [tela]);

  function comecar() {
    eventoMeta("CheckupInicio");
    setTela({ t: "pergunta", i: 0 });
  }

  function avancar(i: number) {
    setTentou(false);
    setTela(i + 1 < PERGUNTAS.length ? { t: "pergunta", i: i + 1 } : { t: "nome" });
  }

  function voltar() {
    setTentou(false);
    if (tela.t === "pergunta")
      setTela(tela.i === 0 ? { t: "inicio" } : { t: "pergunta", i: tela.i - 1 });
    else if (tela.t === "nome") setTela({ t: "pergunta", i: PERGUNTAS.length - 1 });
    else if (tela.t === "whatsapp") setTela({ t: "nome" });
  }

  function escolher(i: number, id: string, opcao: string) {
    setRespostas((r) => ({ ...r, [id]: opcao }));
    // Um respiro para a escolha aparecer marcada antes de trocar de tela.
    window.setTimeout(() => avancar(i), 220);
  }

  const erroFone = erroBR(fone);

  async function enviar() {
    if (erroFone) {
      setTentou(true);
      return;
    }
    setEnviando(true);
    setErro(null);
    const diag = diagnosticar(respostas);
    const faturamento = respostas.faturamento ?? "";
    const semFaturamento = faturamento === SEM_FATURAMENTO;
    const eventId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());
    const checkup: CheckupDados = {
      versao: 1,
      respostas,
      fraco: diag.fraco,
      abismo: diag.abismo,
    };
    try {
      const res = await fetch("/api/public/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          whatsapp: telefoneParaEnvio(BRASIL, fone),
          faturamento,
          profissao: respostas.area ?? null,
          pagina: "/checkup",
          checkup,
          skip_meta: semFaturamento,
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

      // Mesmo filtro do site: só quem fatura conta como Lead.
      if (semFaturamento) eventoMeta("LeadSemFaturamento");
      else dispararConversoesLead(eventId, faturamento, `+55${fone}`);

      const r: Resultado = {
        nome: nome.trim(),
        respostas,
        diag,
        qualificado: leadSignal(faturamento)?.lead_10k === "sim",
      };
      try {
        sessionStorage.setItem(STORAGE, JSON.stringify(r));
      } catch {
        // sem storage: só não guarda para o recarregamento
      }
      setResultado(r);
      setTela({ t: "resultado" });
    } catch (e) {
      console.error("[checkup] erro ao enviar", e);
      setErro("Não deu para enviar agora. Confira a conexão e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  const passo =
    tela.t === "pergunta"
      ? tela.i + 1
      : tela.t === "nome" || tela.t === "whatsapp"
        ? PERGUNTAS.length
        : 0;

  return (
    <div className="ck">
      <EstiloCheckup />
      <div className="ck-wrap" ref={topo}>
        <header className="ck-top">
          <img src={LOGO} alt="Legacy BrandCo." className="ck-logo" width={120} height={28} />
          {(tela.t === "pergunta" || tela.t === "nome" || tela.t === "whatsapp") && (
            <span className="ck-count">
              {tela.t === "pergunta" ? `${passo} de ${PERGUNTAS.length}` : "Último passo"}
            </span>
          )}
        </header>
        {(tela.t === "pergunta" || tela.t === "nome" || tela.t === "whatsapp") && (
          <div className="ck-bar" aria-hidden>
            <i
              style={{
                width: `${tela.t === "pergunta" ? (passo / (PERGUNTAS.length + 1)) * 100 : tela.t === "nome" ? 92 : 97}%`,
              }}
            />
          </div>
        )}

        {tela.t === "inicio" && <Inicio onComecar={comecar} />}

        {tela.t === "pergunta" && (
          <TelaPergunta
            key={tela.i}
            i={tela.i}
            valor={respostas[PERGUNTAS[tela.i]!.id] ?? ""}
            onEscolher={escolher}
            onTexto={(id, v) => setRespostas((r) => ({ ...r, [id]: v }))}
            onAvancar={() => avancar(tela.i)}
            onVoltar={voltar}
          />
        )}

        {tela.t === "nome" && (
          <form
            className="ck-step"
            onSubmit={(e) => {
              e.preventDefault();
              if (nome.trim().length < 2) return setTentou(true);
              setTentou(false);
              setTela({ t: "whatsapp" });
            }}
          >
            <p className="ck-kicker">Seu diagnóstico está pronto</p>
            <h1 className="ck-h">Como você se chama?</h1>
            <input
              className={`ck-input ${tentou && nome.trim().length < 2 ? "is-err" : ""}`}
              name="name"
              autoComplete="given-name"
              placeholder="Seu nome"
              value={nome}
              maxLength={100}
              onChange={(e) => setNome(e.target.value)}
            />
            {tentou && nome.trim().length < 2 && <p className="ck-err">Digite o seu nome</p>}
            <button className="ck-btn" type="submit">
              Continuar
            </button>
            <button type="button" className="ck-back" onClick={voltar}>
              ← Voltar
            </button>
          </form>
        )}

        {tela.t === "whatsapp" && (
          <form
            className="ck-step"
            onSubmit={(e) => {
              e.preventDefault();
              void enviar();
            }}
          >
            <p className="ck-kicker">Último passo</p>
            <h1 className="ck-h">Qual é o seu WhatsApp?</h1>
            <input
              className={`ck-input ${tentou && erroFone ? "is-err" : ""}`}
              name="tel"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="(11) 98888-7777"
              value={mascaraBR(fone)}
              onChange={(e) => setFone(limparBR(e.target.value))}
            />
            {tentou && erroFone && <p className="ck-err">{erroFone}</p>}
            {erro && <p className="ck-err">{erro}</p>}
            <button className="ck-btn" type="submit" disabled={enviando}>
              {enviando ? "Montando o seu diagnóstico…" : "Ver meu diagnóstico"}
            </button>
            <p className="ck-note">
              Seus dados ficam só com a Legacy. <PrivacyButton className="ck-priv" />
            </p>
            <button type="button" className="ck-back" onClick={voltar}>
              ← Voltar
            </button>
          </form>
        )}

        {tela.t === "resultado" && resultado && <TelaResultado r={resultado} />}
      </div>
    </div>
  );
}

function Inicio({ onComecar }: { onComecar: () => void }) {
  return (
    <section className="ck-step ck-inicio">
      <p className="ck-kicker">Diagnóstico de marca</p>
      <h1 className="ck-h ck-h-xl">Descubra o que a sua marca não está dizendo para o cliente.</h1>
      <p className="ck-lead">
        Em 3 passos e menos de 2 minutos, você vê onde a sua marca perde venda e por onde começar.
      </p>
      <ol className="ck-passos">
        <li>
          <span>01</span>Responda 7 perguntas rápidas
        </li>
        <li>
          <span>02</span>Deixe seu nome e WhatsApp
        </li>
        <li>
          <span>03</span>Veja o seu diagnóstico na tela
        </li>
      </ol>
      <button className="ck-btn" type="button" onClick={onComecar}>
        Começar diagnóstico
      </button>
      <p className="ck-note">Gratuito · sem cadastro de e-mail</p>
    </section>
  );
}

function TelaPergunta({
  i,
  valor,
  onEscolher,
  onTexto,
  onAvancar,
  onVoltar,
}: {
  i: number;
  valor: string;
  onEscolher: (i: number, id: string, opcao: string) => void;
  onTexto: (id: string, v: string) => void;
  onAvancar: () => void;
  onVoltar: () => void;
}) {
  const p = PERGUNTAS[i]!;
  const [tentou, setTentou] = useState(false);
  const curto = valor.trim().length < 8;
  return (
    <section className="ck-step">
      <h1 className="ck-h">{p.titulo}</h1>
      {p.sub && <p className="ck-sub">{p.sub}</p>}
      {p.tipo === "escolha" ? (
        <div className="ck-opcoes">
          {p.opcoes.map((o) => (
            <button
              key={o}
              type="button"
              className={`ck-op ${valor === o ? "is-on" : ""}`}
              onClick={() => onEscolher(i, p.id, o)}
            >
              {o}
            </button>
          ))}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (curto) return setTentou(true);
            onAvancar();
          }}
        >
          <textarea
            className={`ck-input ck-area ${tentou && curto ? "is-err" : ""}`}
            rows={4}
            maxLength={400}
            placeholder={p.placeholder}
            value={valor}
            onChange={(e) => onTexto(p.id, e.target.value)}
          />
          {tentou && curto && <p className="ck-err">Escreva pelo menos uma frase</p>}
          <button className="ck-btn" type="submit">
            Continuar
          </button>
        </form>
      )}
      <button type="button" className="ck-back" onClick={onVoltar}>
        ← Voltar
      </button>
    </section>
  );
}

const ORDEM_PONTOS: Ponto[] = ["posicionamento", "abismo", "mensagem", "negocio"];

function TelaResultado({ r }: { r: Resultado }) {
  const { diag } = r;
  const fraco = PONTOS[diag.fraco];
  const primeiro = r.nome.split(/\s+/)[0] ?? "";
  const porque = r.respostas.porque?.trim();
  return (
    <section className="ck-step ck-res">
      <p className="ck-kicker">Seu diagnóstico{primeiro ? `, ${primeiro}` : ""}</p>
      <h1 className="ck-h ck-h-xl">O abismo da sua marca é {diag.abismo}.</h1>
      <p className="ck-lead">
        É a distância entre o que você entrega e o que o cliente entende antes de comprar.
      </p>

      <div className="ck-card">
        {ORDEM_PONTOS.map((p) => (
          <div key={p} className={`ck-linha ${p === diag.fraco ? "is-fraco" : ""}`}>
            <span className="ck-linha-nome">{PONTOS[p].nome}</span>
            <span className="ck-meter" aria-label={ROTULO_NOTA[diag.notas[p]]}>
              {[1, 2, 3].map((n) => (
                <i key={n} className={n <= diag.notas[p] ? "on" : ""} />
              ))}
            </span>
            <span className="ck-linha-nota">{ROTULO_NOTA[diag.notas[p]]}</span>
          </div>
        ))}
      </div>

      <div className="ck-bloco">
        <p className="ck-label">Por onde a gente começaria</p>
        <h2 className="ck-h2">{fraco.titulo}</h2>
        <p>{fraco.texto}</p>
      </div>

      {porque && (
        <div className="ck-bloco">
          <p className="ck-label">Você escreveu</p>
          <blockquote className="ck-quote">“{porque}”</blockquote>
          {diag.genericas.length ? (
            <p>
              {diag.genericas.length === 1 ? "A palavra " : "As palavras "}
              <strong>{listaComE(diag.genericas)}</strong>
              {diag.genericas.length === 1 ? " é a mesma" : " são as mesmas"} que os seus
              concorrentes usam. Para o cliente, isso não diferencia ninguém.
            </p>
          ) : (
            <p>
              Boa: a sua resposta foge das palavras que todo mundo usa. Agora ela precisa estar
              igual no seu perfil, no site e na proposta.
            </p>
          )}
        </div>
      )}

      <div className="ck-bloco ck-tarefa">
        <p className="ck-label">Para fazer esta semana</p>
        <p>{fraco.tarefa}</p>
      </div>

      {r.qualificado ? (
        <div className="ck-prox">
          <p className="ck-label">Próximo passo</p>
          <p>
            A Lais, do nosso time, vai te chamar no WhatsApp para marcar 25 minutos por vídeo. Na
            conversa, a gente abre esse diagnóstico com você e mostra o que mudaria na sua marca.
          </p>
          <a
            className="ck-btn"
            href={`https://wa.me/${WHATSAPP_LAIS}?text=${encodeURIComponent(
              `Oi Lais, fiz o diagnóstico de marca. O ponto mais fraco foi ${fraco.nome.toLowerCase()}.`,
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Falar com a Lais agora
          </a>
        </div>
      ) : (
        <div className="ck-prox">
          <p className="ck-label">Quer ir além</p>
          <p>Veja em 5 minutos como a Legacy resolve isso num projeto de marca.</p>
          <a className="ck-btn" href={VIDEO_COMO_FUNCIONA}>
            Ver como funciona
          </a>
        </div>
      )}
    </section>
  );
}

function EstiloCheckup() {
  return (
    <style>{`
      @font-face { font-family: "LBC Inter"; font-weight: 400; font-display: swap; src: url("/proposta/fonts/inter-400.woff2") format("woff2"); }
      @font-face { font-family: "LBC Inter"; font-weight: 500; font-display: swap; src: url("/proposta/fonts/inter-500.woff2") format("woff2"); }
      @font-face { font-family: "LBC Inter"; font-weight: 600; font-display: swap; src: url("/proposta/fonts/inter-600.woff2") format("woff2"); }
      #lovable-badge { display: none !important; }
      .ck {
        --ink: #121212; --paper: #f2f2f0; --surface: #ffffff; --muted: #6e6e6e;
        --line: rgba(18,18,18,0.12); --lime: #b8ff80;
        min-height: 100svh; background: var(--paper); color: var(--ink);
        font-family: "LBC Inter", Inter, system-ui, sans-serif; font-size: 16px; line-height: 1.5;
        -webkit-font-smoothing: antialiased;
      }
      :where(.ck) :where(h1, h2, p, ol, blockquote) { margin: 0; }
      .ck-wrap { max-width: 520px; margin-inline: auto; padding: 20px 16px 48px; }
      .ck-top { display: flex; align-items: center; justify-content: space-between; height: 40px; }
      .ck-logo { height: 24px; width: auto; display: block; }
      .ck-count { font-size: 13px; color: var(--muted); font-variant-numeric: tabular-nums; }
      .ck-bar { height: 3px; background: var(--line); border-radius: 3px; margin-top: 12px; overflow: hidden; }
      .ck-bar i { display: block; height: 100%; background: var(--ink); transition: width .35s ease; }
      .ck-step { padding-top: 40px; animation: ck-in .3s ease both; }
      @keyframes ck-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      @media (prefers-reduced-motion: reduce) { .ck-step { animation: none; } .ck-bar i { transition: none; } }
      .ck-kicker { font-size: 13px; font-weight: 500; color: var(--muted); margin-bottom: 12px !important; }
      .ck-h { font-weight: 600; font-size: 26px; line-height: 1.12; letter-spacing: -0.035em; text-wrap: balance; }
      .ck-h-xl { font-size: 34px; letter-spacing: -0.045em; line-height: 1.04; }
      .ck-h2 { font-weight: 600; font-size: 21px; line-height: 1.2; letter-spacing: -0.03em; margin-bottom: 8px !important; }
      .ck-sub { color: var(--muted); margin-top: 8px !important; }
      .ck-lead { font-size: 17px; color: #3a3a3a; margin-top: 16px !important; text-wrap: pretty; }
      .ck-passos { list-style: none; padding: 0; margin: 28px 0 !important; border-top: 1.5px solid var(--ink); }
      .ck-passos li { display: flex; gap: 14px; align-items: baseline; padding: 14px 0; border-bottom: 1px solid var(--line); font-weight: 500; }
      .ck-passos span { font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }
      .ck-opcoes { display: grid; gap: 10px; margin-top: 24px; }
      .ck-op {
        text-align: left; font: inherit; font-weight: 500; color: var(--ink); background: var(--surface);
        border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px; cursor: pointer;
        transition: border-color .15s, background .15s, color .15s;
      }
      .ck-op:hover { border-color: var(--ink); }
      .ck-op.is-on { background: var(--ink); color: var(--paper); border-color: var(--ink); }
      .ck-op:focus-visible, .ck-btn:focus-visible, .ck-input:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
      .ck-input {
        display: block; width: 100%; box-sizing: border-box; margin-top: 24px; font: inherit; font-size: 18px;
        color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 16px 18px;
      }
      .ck-area { font-size: 16px; resize: vertical; min-height: 120px; }
      .ck-input.is-err { border-color: #c62828; }
      .ck-err { color: #c62828; font-size: 14px; margin-top: 8px !important; }
      .ck-btn {
        display: block; width: 100%; box-sizing: border-box; margin-top: 20px; text-align: center; text-decoration: none;
        font: inherit; font-weight: 600; font-size: 16px; color: var(--paper); background: var(--ink);
        border: 0; border-radius: 12px; padding: 17px 20px; cursor: pointer;
      }
      .ck-btn:disabled { opacity: .6; cursor: progress; }
      .ck-back { display: block; margin: 18px auto 0; background: none; border: 0; font: inherit; font-size: 14px; color: var(--muted); cursor: pointer; }
      .ck-note { font-size: 13px; color: var(--muted); text-align: center; margin-top: 12px !important; }
      .ck-priv { background: none; border: 0; padding: 0; font: inherit; color: inherit; text-decoration: underline; cursor: pointer; }
      .ck-card { background: var(--ink); color: var(--paper); border-radius: 16px; padding: 8px 20px; margin-top: 28px; }
      .ck-linha { display: grid; grid-template-columns: 1fr auto 64px; gap: 12px; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(242,242,240,.14); font-size: 15px; }
      .ck-linha:last-child { border-bottom: 0; }
      .ck-linha-nota { font-size: 13px; color: #9a9a9a; text-align: right; }
      .ck-linha.is-fraco .ck-linha-nome, .ck-linha.is-fraco .ck-linha-nota { color: var(--lime); }
      .ck-meter { display: inline-flex; gap: 4px; }
      .ck-meter i { width: 18px; height: 6px; border-radius: 3px; background: rgba(242,242,240,.18); }
      .ck-meter i.on { background: var(--paper); }
      .ck-linha.is-fraco .ck-meter i.on { background: var(--lime); }
      .ck-bloco { margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--line); }
      .ck-bloco p + p { margin-top: 10px; }
      .ck-label { font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px !important; }
      .ck-quote { font-size: 18px; font-weight: 500; letter-spacing: -0.02em; line-height: 1.35; margin-bottom: 12px !important; }
      .ck-tarefa { background: var(--surface); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; }
      .ck-prox { margin-top: 32px; background: var(--surface); border-radius: 16px; padding: 22px 20px; box-shadow: 0 18px 48px rgba(18,18,18,.08); }
      @media (min-width: 640px) {
        .ck-wrap { padding-top: 32px; }
        .ck-step { padding-top: 56px; }
        .ck-h { font-size: 30px; }
        .ck-h-xl { font-size: 42px; }
      }
    `}</style>
  );
}
