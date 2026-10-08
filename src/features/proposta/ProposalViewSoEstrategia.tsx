import { useCallback, useEffect, useRef } from "react";
import "./proposta.css";
import "./proposta-direcao.css";
import type { Proposal } from "./types";
import {
  BRAND,
  DIRECAO_CARD_INSTALLMENTS,
  DIRECAO_CARD_RATE_12X,
  SO_ESTRATEGIA_DELIVERABLES,
  SO_ESTRATEGIA_STEPS,
} from "./defaults";
import { brlNumber, brlShort, fmtDate, parseBrl, pricing, round2, validity } from "./format";
import { usePrintPdf } from "./usePrintPdf";
import EditText from "./EditText";

interface Props {
  proposal: Proposal;
  /** Botão flutuante de PDF. */
  chrome?: boolean;
  /** Dispara a impressão automaticamente (usado por ?pdf=1). */
  autoPrint?: boolean;
  /** Modo de edição do CRM: textos e valores viram editáveis com um clique. */
  onEdit?: (patch: Partial<Proposal>) => void;
  /** Altura de uma barra fixa acima da proposta (a barra de edição do CRM). */
  topOffset?: number;
}

type TextField = "client_name" | "cover_label" | "installments_note" | "cash_note";

/** Mesmo motivo da Direção: o @page do modelo em slides é global. */
const PRINT_PAGE = "@media print { @page { size: A4 portrait; margin: 0; } }";

/**
 * Estratégia de Marca: só estratégia, sem identidade visual. Proposta curta,
 * no visual da Direção de Marca: o que é, entregas, etapas e prazo, investimento.
 * Sem encontros fixos: o trabalho parte do Briefing Legacy.
 */
export default function ProposalViewSoEstrategia({
  proposal: p,
  chrome = true,
  autoPrint = false,
  onEdit,
  topOffset = 0,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const client = p.client_name?.trim() || "Sua empresa";
  const price = pricing(p);
  // Duas vezes sem juros: metade na contratação e metade na entrega.
  const halfValue = round2(price.total / 2);
  // Corta nos centavos em vez de arredondar: R$ 5.000 × 0,103425 = 517,125 → 12x de R$ 517,12.
  // (o round2 antes do floor só limpa o erro de ponto flutuante: 51712,4999… → 51712,5).
  const cardInstallment = Math.floor(round2(price.total * DIRECAO_CARD_RATE_12X * 100)) / 100;
  const valid = validity(p.valid_until);

  /** Texto editável no modo de edição; texto puro na leitura. */
  const txt = (field: TextField, shown: string, placeholder: string) =>
    onEdit ? (
      <EditText
        value={field === "client_name" ? (p.client_name ?? "") : shown}
        placeholder={placeholder}
        onCommit={(v) => onEdit({ [field]: v } as Partial<Proposal>)}
      />
    ) : (
      shown
    );

  const fileName = `Proposta Legacy BrandCo. Estratégia de Marca - ${client}`;
  const getRoot = useCallback(() => rootRef.current, []);
  const { print, preparing } = usePrintPdf(getRoot, fileName);

  useEffect(() => {
    if (!autoPrint) return;
    const t = setTimeout(() => void print(), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPrint]);

  const coverDate = (p.updated_at ? new Date(p.updated_at) : new Date())
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .replace(/^./, (c) => c.toUpperCase());

  const validText = !valid.date
    ? null
    : valid.expired
      ? `Esta proposta venceu em ${fmtDate(valid.date)}. Fale com a gente para receber os valores atualizados.`
      : `Esta proposta é válida até ${fmtDate(valid.date)}${
          valid.days <= 7
            ? valid.days <= 1
              ? " (último dia)"
              : ` (faltam ${valid.days} dias)`
            : ""
        }, sujeita a alteração de valor após essa data.`;

  const deadline = onEdit ? (
    <EditText
      value={String(p.deadline_days)}
      placeholder="25"
      selectAll
      onCommit={(v) => {
        const n = Math.round(Number(v.replace(/\D/g, "")));
        if (n >= 1 && n <= 365) onEdit({ deadline_days: n });
      }}
    />
  ) : (
    p.deadline_days
  );

  const rootStyle = { "--dm-top": `${topOffset}px` } as React.CSSProperties;

  return (
    <div className={`lbc lbc-dm${onEdit ? " lbc-editing" : ""}`} ref={rootRef} style={rootStyle}>
      <style>{PRINT_PAGE}</style>

      {/* CAPA */}
      <section className="lbc-dm-sec tone-lime lbc-dm-cover" id="inicio">
        <div className="lbc-dm-wrap">
          <div className="lbc-dm-cover-meta">
            <span>
              {txt(
                "cover_label",
                p.cover_label || "Proposta de Estratégia de Marca",
                "Proposta de Estratégia de Marca",
              )}
            </span>
            <span>{coverDate}</span>
          </div>
          <div className="lbc-dm-mark">
            <img src={BRAND.logoDark} alt="Legacy BrandCo." width={1716} height={612} />
          </div>
          <div className="lbc-dm-for">
            <small>Proposta preparada para</small>
            <div className="lbc-dm-client">{txt("client_name", client, "Nome do cliente")}</div>
          </div>
        </div>
      </section>

      {/* O QUE É */}
      <section className="lbc-dm-sec tone-deep" id="o-que-e">
        <div className="lbc-dm-wrap">
          <p className="lbc-kicker">
            <b>O que é</b>
          </p>
          <h2 className="lbc-d lbc-dm-h1">Estratégia de Marca</h2>
          <p className="lbc-dm-lead">
            Em {p.deadline_days} dias, definimos a base da sua marca:{" "}
            <strong>para quem ela fala</strong>, <strong>como quer ser lembrada</strong> e{" "}
            <strong>como deve se comunicar</strong>. É o que orienta todo o resto: o conteúdo, as
            vendas e, quando for a hora, a identidade visual.
          </p>
        </div>
      </section>

      {/* ENTREGÁVEIS */}
      <section className="lbc-dm-sec tone-surface" id="entregaveis">
        <div className="lbc-dm-wrap">
          <p className="lbc-kicker">
            <b>O que você recebe</b>
          </p>
          <h2 className="lbc-d lbc-dm-h1">Seis entregas que formam a base da sua marca</h2>
          <ol className="lbc-dm-grid-3 lbc-dm-dl">
            {SO_ESTRATEGIA_DELIVERABLES.map((d, i) => (
              <li key={d.title}>
                <small>{String(i + 1).padStart(2, "0")}</small>
                <b>{d.title}</b>
                <p>{d.text}</p>
              </li>
            ))}
          </ol>
          <p className="lbc-dm-note">Tudo reunido no Guia de Estratégia da Marca, em PDF.</p>
        </div>
      </section>

      {/* ETAPAS E PRAZO */}
      <section className="lbc-dm-sec tone-paper" id="etapas">
        <div className="lbc-dm-wrap">
          <p className="lbc-kicker">
            <b>Etapas e prazo</b>
          </p>
          <h2 className="lbc-d lbc-dm-h1">Do briefing à entrega em {deadline} dias</h2>
          <ol className="lbc-dm-timeline">
            {SO_ESTRATEGIA_STEPS.map((s) => (
              <li key={s.title}>
                <small>{s.when}</small>
                <b>{s.title}</b>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="lbc-dm-note">
            * O prazo começa a contar quando o Briefing Legacy é respondido com profundidade.
          </p>
        </div>
      </section>

      {/* INVESTIMENTO */}
      <section className="lbc-dm-sec tone-deep" id="investimento">
        <div className="lbc-dm-wrap">
          <p className="lbc-kicker">
            <b>Investimento</b>
          </p>
          <p className="lbc-total lbc-dm-total">
            <span>R$</span>
            {onEdit ? (
              <EditText
                value={brlNumber(price.total)}
                placeholder="0,00"
                selectAll
                onCommit={(v) => {
                  const n = parseBrl(v);
                  if (Number.isFinite(n) && n >= 0)
                    onEdit({ price_total: Math.round(n * 100) / 100 });
                }}
              />
            ) : (
              brlNumber(price.total)
            )}
          </p>
          <div className="lbc-opts lbc-dm-opts three">
            <div className={`lbc-opt${price.hasDiscount ? " best" : ""}`}>
              {price.hasDiscount && <span className="tag">{brlShort(price.pct)}% OFF</span>}
              <h3>À vista no Pix</h3>
              <div className="v">
                <small>R$</small>
                {brlNumber(price.cashValue)}
              </div>
              <p>{txt("cash_note", p.cash_note, "Texto do Pix")}</p>
            </div>
            <div className="lbc-opt">
              <h3>2x sem juros</h3>
              <div className="v">
                <small>2x</small>R$ {brlNumber(halfValue)}
              </div>
              <p>{txt("installments_note", p.installments_note, "Texto das parcelas")}</p>
            </div>
            <div className="lbc-opt">
              <h3>Cartão de crédito</h3>
              <div className="v">
                <small>{DIRECAO_CARD_INSTALLMENTS}x</small>R$ {brlNumber(cardInstallment)}
              </div>
              <p>Parcelado no cartão, com os juros da operadora.</p>
            </div>
          </div>
          {validText && (
            <p className={`lbc-valid${valid.expired ? " late" : ""}`}>
              <i className="dot" />
              <span>{validText}</span>
            </p>
          )}
        </div>
      </section>

      {/* PRÓXIMOS PASSOS */}
      <section className="lbc-dm-sec tone-lime" id="proximos-passos">
        <div className="lbc-dm-wrap">
          <p className="lbc-kicker">
            <b>Próximos passos</b>
          </p>
          <h2 className="lbc-d lbc-dm-h1">Como começamos</h2>
          <ol className="lbc-dm-grid-3 lbc-dm-steps">
            <li>
              <small>Passo 1</small>
              <b>Aceite e pagamento</b>
              <p>Você confirma a proposta e a forma de pagamento que prefere.</p>
            </li>
            <li>
              <small>Passo 2</small>
              <b>Briefing Legacy</b>
              <p>Você responde com profundidade a nossa ferramenta de briefing.</p>
            </li>
            <li>
              <small>Passo 3</small>
              <b>Começa a contar</b>
              <p>A partir do briefing, em {p.deadline_days} dias você recebe a sua estratégia.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* ENCERRAMENTO */}
      <section className="lbc-dm-sec tone-deep lbc-dm-end" id="fim">
        <div className="lbc-dm-wrap">
          <img
            src={BRAND.logoLight}
            alt="Legacy BrandCo."
            width={1716}
            height={612}
            loading="lazy"
          />
          <div className="row">
            <span>Legacy BrandCo. Estratégia de Marca</span>
            <span>{BRAND.siteLabel}</span>
          </div>
        </div>
      </section>

      {chrome && (
        <button
          type="button"
          className="lbc-dm-pdf lbc-no-print"
          onClick={() => void print()}
          disabled={preparing}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {preparing ? "Preparando..." : "Baixar PDF"}
        </button>
      )}
    </div>
  );
}
