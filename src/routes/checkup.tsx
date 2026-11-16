import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PrivacyButton } from "@/components/site/PrivacyDialog";
import { captureUtmsFromUrl, type UtmData } from "@/lib/utm";
import { leadSignal } from "@/lib/lead-signal";
import { dispararConversoesLead, eventoMeta } from "@/lib/conversoes";
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
import {
  PERGUNTAS,
  PONTOS,
  ROTULO_NOTA,
  diagnosticar,
  erroNome,
  erroRespostaAberta,
  falarComArea,
  listaComE,
  type CheckupDados,
  type Diagnostico,
  type Ponto,
  type Respostas,
} from "@/lib/checkup";

// Diagnóstico de marca: 7 perguntas, nome e WhatsApp, resultado na tela.
// Conteúdo e regras em src/lib/checkup.ts.

const LOGO = "/proposta/brand/legacy-logo-preto.webp";
const SEM_FATURAMENTO = "Ainda não estou faturando";
// Guarda o resultado: recarregar a página mostra o diagnóstico de novo, sem reenviar.
const STORAGE = "lbc_checkup_v1";
// Guarda o andamento: recarregar no meio do quiz volta para a mesma pergunta.
const PROGRESSO = "lbc_checkup_progresso_v1";

export const Route = createFileRoute("/checkup")({
  head: () => ({
    meta: [
      { title: "Diagnóstico de marca | Legacy BrandCo." },
      {
        name: "description",
        content:
          "Vender mais começa por enxergar o ponto cego da sua marca. Diagnóstico gratuito: 7 perguntas e o resultado na tela.",
      },
      { property: "og:title", content: "Diagnóstico de marca | Legacy BrandCo." },
      {
        property: "og:description",
        content: "Vender mais começa por enxergar o ponto cego da sua marca.",
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
  telefone?: string;
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
  const [pais, setPais] = useState<Pais>(BRASIL);
  const [fone, setFone] = useState(""); // só dígitos, sem o código do país
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
      return;
    }
    try {
      const p = JSON.parse(sessionStorage.getItem(PROGRESSO) ?? "null") as {
        tela: Tela;
        respostas: Respostas;
        nome: string;
      } | null;
      if (p && p.tela.t !== "resultado") {
        setRespostas(p.respostas ?? {});
        setNome(p.nome ?? "");
        // O WhatsApp não é guardado: quem volta cai no nome.
        setTela(p.tela.t === "whatsapp" ? { t: "nome" } : p.tela);
      }
    } catch {
      // sem storage: começa do zero
    }
  }, []);

  useEffect(() => {
    if (tela.t === "inicio" || tela.t === "resultado") return;
    try {
      sessionStorage.setItem(PROGRESSO, JSON.stringify({ tela, respostas, nome }));
    } catch {
      // sem storage: só não guarda o andamento
    }
  }, [tela, respostas, nome]);

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

  const erroFone = pais.iso === "BR" ? erroBR(fone) : erroExterior(fone);
  const erroDoNome = erroNome(nome);

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
          nome: nome.trim().replace(/\s+/g, " "),
          whatsapp: telefoneParaEnvio(pais, fone),
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
      else
        dispararConversoesLead(
          eventId,
          faturamento,
          `+${telefoneLegivel(pais, fone).replace(/\D/g, "")}`,
        );

      const r: Resultado = {
        nome: nome.trim(),
        telefone: telefoneLegivel(pais, fone),
        respostas,
        diag,
        qualificado: leadSignal(faturamento)?.lead_10k === "sim",
      };
      try {
        sessionStorage.setItem(STORAGE, JSON.stringify(r));
        sessionStorage.removeItem(PROGRESSO);
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
            area={respostas.area}
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
              if (erroDoNome) return setTentou(true);
              setTentou(false);
              setTela({ t: "whatsapp" });
            }}
          >
            <p className="ck-kicker">Seu diagnóstico está pronto</p>
            <h1 className="ck-h">Como você se chama?</h1>
            <input
              className={`ck-input ${tentou && erroDoNome ? "is-err" : ""}`}
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
              onBlur={() => nome.trim() && setTentou(true)}
            />
            {tentou && erroDoNome && <p className="ck-err">{erroDoNome}</p>}
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
      <p className="ck-kicker">Diagnóstico gratuito</p>
      <h1 className="ck-h ck-h-xl">Vender mais começa por enxergar o ponto cego da sua marca.</h1>
      <p className="ck-lead">
        Faça o diagnóstico gratuito: 7 perguntas, menos de 2 minutos e o resultado na tela.
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
  area,
  valor,
  onEscolher,
  onTexto,
  onAvancar,
  onVoltar,
}: {
  i: number;
  area: string | undefined;
  valor: string;
  onEscolher: (i: number, id: string, opcao: string) => void;
  onTexto: (id: string, v: string) => void;
  onAvancar: () => void;
  onVoltar: () => void;
}) {
  const p = PERGUNTAS[i]!;
  const [tentou, setTentou] = useState(false);
  const erroAberta = p.tipo === "aberta" ? erroRespostaAberta(valor) : null;
  return (
    <section className="ck-step">
      <h1 className="ck-h">{falarComArea(p.titulo, area)}</h1>
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
            if (erroAberta) return setTentou(true);
            onAvancar();
          }}
        >
          <textarea
            className={`ck-input ck-area ${tentou && erroAberta ? "is-err" : ""}`}
            rows={4}
            maxLength={400}
            placeholder={p.placeholder}
            value={valor}
            onChange={(e) => {
              setTentou(false);
              onTexto(p.id, e.target.value);
            }}
          />
          {tentou && erroAberta && <p className="ck-err">{erroAberta}</p>}
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

/**
 * WhatsApp igual ao formulário do site (PhoneField do ContactSection): país
 * na frente (Brasil, +55, já escolhido), só DDD + número. O 55 e o 0 da
 * operadora saem sozinhos; o "55 no lugar do DDD" avisa na hora; os outros
 * erros, ao sair do campo ou ao enviar. Número válido aparece por extenso.
 */
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
      <div className={`ck-fone ${mostrarErro ? "is-err" : ""}`}>
        <div className="ck-pais">
          <span aria-hidden="true">
            {pais.bandeira} +{pais.ddi}
          </span>
          <svg aria-hidden="true" width="10" height="6" viewBox="0 0 10 6">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
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
          aria-describedby="ck-fone-ajuda"
        />
      </div>
      <p id="ck-fone-ajuda" className="ck-fone-ajuda" aria-live="polite">
        {mostrarErro ? (
          <span className="ck-err">{erro}</span>
        ) : !erro ? (
          <span className="ck-ok">
            ✓ Confere: <b>{telefoneLegivel(pais, digitos)}</b>
          </span>
        ) : br ? (
          <span className="ck-dica">Só DDD + número. O +55 já está aí.</span>
        ) : null}
      </p>
    </>
  );
}

const ORDEM_PONTOS: Ponto[] = ["posicionamento", "abismo", "mensagem", "negocio"];

function TelaResultado({ r }: { r: Resultado }) {
  const { diag } = r;
  const area = r.respostas.area;
  const fala = (t: string) => falarComArea(t, area);
  const fraco = PONTOS[diag.fraco];
  const primeiro = r.nome.split(/\s+/)[0] ?? "";
  const porque = r.respostas.porque?.trim();
  return (
    <section className="ck-step ck-res">
      <p className="ck-kicker">O ponto cego da sua marca{primeiro ? `, ${primeiro}` : ""}</p>
      <h1 className="ck-h ck-h-xl">{fala(fraco.titulo)}</h1>
      <p className="ck-lead">
        {fala(
          `A distância entre o que você entrega e o que o cliente entende antes de comprar é ${{ pequeno: "pequena", médio: "média", grande: "grande" }[diag.abismo]}.`,
        )}
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
        <p className="ck-label">Por que isso trava as suas vendas</p>
        <p>{fala(fraco.texto)}</p>
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
              concorrentes usam. {fala("Para o cliente, isso não diferencia ninguém.")}
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
        <p>{fala(fraco.tarefa)}</p>
      </div>

      {r.qualificado ? (
        <div className="ck-prox">
          <p className="ck-label">Próximo passo</p>
          <p>
            A Lais, do nosso time, vai te chamar no WhatsApp
            {r.telefone ? <strong> {r.telefone}</strong> : null} para marcar 25 minutos por vídeo.
            Na conversa, a gente abre esse diagnóstico com você e mostra o que mudaria na sua marca.
          </p>
        </div>
      ) : (
        <p className="ck-note ck-fim">Tire um print para guardar o seu diagnóstico.</p>
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
      .ck-fone { display: flex; align-items: stretch; margin-top: 24px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; }
      .ck-fone:focus-within { border-color: var(--ink); }
      .ck-fone.is-err { border-color: #c62828; }
      .ck-pais { position: relative; display: flex; align-items: center; gap: 6px; padding: 0 12px 0 14px; border-right: 1px solid var(--line); font-size: 16px; white-space: nowrap; }
      .ck-pais select { position: absolute; inset: 0; width: 100%; opacity: 0; cursor: pointer; font-size: 16px; }
      .ck-fone input { flex: 1; min-width: 0; width: 100%; border: 0; outline: none; background: transparent; color: var(--ink); font: inherit; font-size: 18px; padding: 16px 14px; }
      .ck-fone-ajuda { min-height: 20px; margin-top: 8px !important; font-size: 14px; }
      .ck-fone-ajuda .ck-err { margin: 0 !important; }
      .ck-ok { color: #2f7d32; }
      .ck-ok b { font-weight: 600; white-space: nowrap; }
      .ck-dica { color: var(--muted); }
      .ck-fim { margin-top: 32px !important; }
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
