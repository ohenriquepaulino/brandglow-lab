import { useCallback, useEffect, useMemo, useRef } from "react";
import "./proposta.css";
import "./proposta-direcao.css";
import type { Proposal } from "./types";
import { BRAND, DEFAULT_CASE_ORDER, DIRECAO_DELIVERABLES } from "./defaults";
import { resolveCases } from "./cases";
import { brlNumber, brlShort, fmtDate, parseBrl, pricing, validity } from "./format";
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

/**
 * O @page do modelo original (1920x1080) é global. Este fica numa tag <style>
 * que só existe enquanto este modelo está na tela, e vence por vir depois.
 */
const PRINT_PAGE = "@media print { @page { size: A4 portrait; margin: 0; } }";

const STEPS = [
  {
    week: "Semana 1",
    title: "Briefing e diagnóstico",
    text: "Você responde o Briefing Legacy e analisamos sua marca, redes e concorrentes.",
  },
  {
    week: "Semana 2",
    title: "Encontro 1",
    text: "Apresentação do diagnóstico e das diretrizes da marca.",
  },
  {
    week: "Semana 3",
    title: "Aplicação",
    text: "Você testa as diretrizes no dia a dia do negócio.",
  },
  {
    week: "Semana 4",
    title: "Encontro 2 e entrega",
    text: "Ajustes, plano de 90 dias e entrega do Guia de Posicionamento e do Plano de Execução.",
  },
];

/** Direção de Marca Legacy: página que rola normalmente, pensada primeiro pro celular. */
export default function ProposalViewDirecao({
  proposal: p,
  chrome = true,
  autoPrint = false,
  onEdit,
  topOffset = 0,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const client = p.client_name?.trim() || "Sua empresa";
  const cases = useMemo(() => resolveCases(DEFAULT_CASE_ORDER), []);
  const price = pricing(p);
  const valid = validity(p.valid_until);

  /** Texto editável no modo de edição; texto puro na leitura. */
  const txt = (field: TextField, shown: string, placeholder: string) =>
    onEdit ? (
      <EditText
        value={(p[field] as string | null) ?? ""}
        placeholder={placeholder}
        onCommit={(v) => onEdit({ [field]: v } as Partial<Proposal>)}
      />
    ) : (
      shown
    );

  const fileName = `Proposta Legacy BrandCo. Direção de Marca Legacy - ${client}`;
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
      placeholder="30"
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
                p.cover_label || "Proposta de Direção de Marca",
                "Proposta de Direção de Marca",
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
            <b>O que fazemos</b>
          </p>
          <h2 className="lbc-d lbc-dm-h1">Direção de Marca Legacy</h2>
          <p className="lbc-dm-lead">
            Em 30 dias, definimos com você <strong>como a sua marca deve se posicionar</strong>, o
            que ela precisa comunicar pra <strong>atrair o cliente certo</strong> e o que fazer nos
            próximos 90 dias pra <strong>colocar tudo em prática</strong>.
          </p>
          <div className="lbc-dm-grid-4 lbc-dm-flow">
            <div>
              <small>Clareza</small>
              <b>Posicionamento e cliente ideal</b>
            </div>
            <div>
              <small>Comunicação</small>
              <b>Mensagem e conteúdo</b>
            </div>
            <div>
              <small>Execução</small>
              <b>Plano de 90 dias</b>
            </div>
            <div className="hot">
              <small>Resultado</small>
              <b>Clientes certos chegando até você</b>
            </div>
          </div>
        </div>
      </section>

      {/* PRA QUEM É */}
      <section className="lbc-dm-sec tone-paper" id="pra-quem">
        <div className="lbc-dm-wrap">
          <p className="lbc-kicker">
            <b>Pra quem é</b>
          </p>
          <h2 className="lbc-d lbc-dm-h1">Feito pra marcas prontas pra crescer</h2>
          <div className="lbc-dm-grid-3 lbc-dm-fit">
            <div>
              <small>Você tem</small>
              <p>Um bom produto ou serviço e quer que a comunicação mostre esse valor.</p>
            </div>
            <div>
              <small>Você quer</small>
              <p>Atrair clientes que valorizam o seu trabalho e fecham com mais facilidade.</p>
            </div>
            <div>
              <small>Você busca</small>
              <p>
                Organizar a marca e ganhar clareza antes de investir numa identidade visual
                completa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUEM SOMOS */}
      <section className="lbc-dm-sec tone-surface" id="quem-somos">
        <div className="lbc-dm-wrap lbc-dm-about">
          <div className="lbc-dm-mosaic" aria-label="Equipe Legacy BrandCo.">
            {BRAND.team.map((src, i) => (
              <img key={src} className={`m${i}`} src={src} alt="" loading="lazy" />
            ))}
          </div>
          <div>
            <p className="lbc-kicker">
              <b>Quem somos</b>
            </p>
            <h2 className="lbc-d lbc-dm-h2">
              Especialistas em Branding, Estratégia e construção de marcas.
            </h2>
            <ul className="lbc-facts lbc-dm-facts">
              <li>Mais de 8 anos de experiência</li>
              <li>Clientes atendidos em todo o Brasil</li>
              <li>Metodologia própria, o Legacy Brand Canvas</li>
            </ul>
            {cases.length > 0 && (
              <ul className="lbc-dm-chips" aria-label="Marcas que construímos">
                {cases.map((c) => (
                  <li key={c.slug}>{c.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="lbc-dm-sec tone-paper" id="como-funciona">
        <div className="lbc-dm-wrap">
          <p className="lbc-kicker">
            <b>Como trabalhamos</b>
          </p>
          <h2 className="lbc-d lbc-dm-h1">Do briefing ao plano de 90 dias</h2>
          <ol className="lbc-dm-timeline">
            {STEPS.map((s) => (
              <li key={s.week}>
                <small>{s.week}</small>
                <b>{s.title}</b>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="lbc-dm-note">
            * O prazo de {deadline} dias começa após o Briefing Legacy respondido com profundidade.
            Os dois encontros são online, com cerca de 90 minutos cada, e ficam gravados.
          </p>
        </div>
      </section>

      {/* ENTREGÁVEIS */}
      <section className="lbc-dm-sec tone-surface" id="entregaveis">
        <div className="lbc-dm-wrap">
          <p className="lbc-kicker">
            <b>O que você recebe</b>
          </p>
          <h2 className="lbc-d lbc-dm-h1">Oito entregas pra sua marca atrair o cliente certo</h2>
          <ol className="lbc-dm-grid-4 lbc-dm-dl">
            {DIRECAO_DELIVERABLES.map((d, i) => (
              <li key={d.title}>
                <small>{String(i + 1).padStart(2, "0")}</small>
                <b>{d.title}</b>
                <p>{d.text}</p>
              </li>
            ))}
          </ol>
          <p className="lbc-dm-note">
            Tudo reunido em dois documentos: o Guia de Posicionamento, que mostra quem a sua marca
            é, e o Plano de Execução, que mostra o que fazer com isso.
          </p>
        </div>
      </section>

      {/* INVESTIMENTO */}
      <section className="lbc-dm-sec tone-deep" id="investimento">
        <div className="lbc-dm-wrap lbc-dm-inv">
          <div>
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
            <div className="lbc-dm-nums">
              <div>
                <small>Prazo estimado</small>
                <b>{deadline} dias</b>
              </div>
              <div>
                <small>Encontros</small>
                <b>2</b>
              </div>
              <div>
                <small>Entregas</small>
                <b>{DIRECAO_DELIVERABLES.length}</b>
              </div>
            </div>
          </div>
          <div>
            <div className={`lbc-opts lbc-dm-opts${price.showInstallments ? "" : " single"}`}>
              {price.showInstallments && (
                <div className="lbc-opt">
                  <h3>Em {price.installments} vezes</h3>
                  <div className="v">
                    <small>{price.installments}x</small>R$ {brlShort(price.installmentValue)}
                  </div>
                  <p>{txt("installments_note", p.installments_note, "Texto das parcelas")}</p>
                </div>
              )}
              <div className={`lbc-opt${price.hasDiscount ? " best" : ""}`}>
                {price.hasDiscount && <span className="tag">{brlShort(price.pct)}% OFF</span>}
                <h3>{price.showInstallments ? "À vista" : "Pagamento único"}</h3>
                <div className="v">
                  <small>R$</small>
                  {brlShort(price.cashValue)}
                </div>
                <p>{txt("cash_note", p.cash_note, "Texto do pagamento à vista")}</p>
              </div>
            </div>
            <p className="lbc-dm-credit">
              Se você decidir construir a identidade visual completa com a Legacy em até 60 dias, o
              valor desta proposta vira crédito no projeto de Estratégia de Marca e Identidade
              Visual.
            </p>
            {validText && (
              <p className={`lbc-valid${valid.expired ? " late" : ""}`}>
                <i className="dot" />
                <span>{validText}</span>
              </p>
            )}
          </div>
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
              <b>Aceite da proposta</b>
              <p>Você confirma a forma de pagamento que prefere.</p>
            </li>
            <li>
              <small>Passo 2</small>
              <b>Briefing Legacy</b>
              <p>Você responde com profundidade o nosso briefing de estratégia.</p>
            </li>
            <li>
              <small>Passo 3</small>
              <b>Encontro 1 agendado</b>
              <p>
                Marcamos o primeiro encontro e o prazo de {p.deadline_days} dias começa a contar.
              </p>
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
            <span>Legacy BrandCo. Direção de Marca Legacy</span>
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
