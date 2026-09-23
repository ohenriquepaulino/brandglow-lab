import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import "./proposta.css";
import type { CaseStudy, Proposal } from "./types";
import { BRAND, DEFAULT_DELIVERABLES, DIAGNOSIS_PLACEHOLDERS } from "./defaults";
import { LOCAL_BACKUP_IMAGES, resolveCases } from "./cases";
import { brlNumber, brlShort, fmtDate, parseBrl, pricing, validity } from "./format";
import { usePrintPdf } from "./usePrintPdf";

interface Props {
  proposal: Proposal;
  /** Barra fixa, índice, progresso e atalhos de teclado. Desligue no preview do editor. */
  chrome?: boolean;
  /** Mostra os textos-guia quando o diagnóstico está vazio (só no editor). */
  showPlaceholders?: boolean;
  /** Dispara a impressão automaticamente (usado por ?pdf=1). */
  autoPrint?: boolean;
  /** Modo de edição do CRM: textos e valores viram editáveis com um clique. */
  onEdit?: (patch: Partial<Proposal>) => void;
}

type TextField =
  | "client_name"
  | "cover_label"
  | "diagnosis_moment"
  | "diagnosis_challenge"
  | "diagnosis_goal"
  | "installments_note"
  | "cash_note";

interface Chapter {
  id: string;
  label: string;
}

export default function ProposalView({
  proposal: p,
  chrome = true,
  showPlaceholders: showPh = false,
  autoPrint = false,
  onEdit,
}: Props) {
  const showPlaceholders = showPh || !!onEdit;
  const rootRef = useRef<HTMLDivElement>(null);
  const client = p.client_name?.trim() || "Sua empresa";
  const cases = useMemo(() => resolveCases(p.case_slugs), [p.case_slugs]);
  const deliverables = p.deliverables?.length ? p.deliverables : DEFAULT_DELIVERABLES;
  const price = pricing(p);
  const valid = validity(p.valid_until);

  /** Texto editável no modo de edição; texto puro para o cliente. */
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

  const diag = {
    moment: p.diagnosis_moment?.trim() || "",
    challenge: p.diagnosis_challenge?.trim() || "",
    goal: p.diagnosis_goal?.trim() || "",
  };
  const hasDiag = !!(diag.moment || diag.challenge || diag.goal);
  const showDiag = p.show_diagnosis && (hasDiag || showPlaceholders);

  const chapters: Chapter[] = [
    { id: "inicio", label: "Início" },
    ...(showDiag ? [{ id: "entendemos", label: "O seu negócio" }] : []),
    { id: "quem-somos", label: "Quem somos" },
    { id: "o-que-fazemos", label: "O que fazemos" },
    ...(cases.length ? [{ id: "marcas", label: "Marcas que construímos" }] : []),
    { id: "como-trabalhamos", label: "Como trabalhamos" },
    { id: "entregaveis", label: "O que você recebe" },
    { id: "investimento", label: "Investimento" },
    { id: "proximos-passos", label: "Próximos passos" },
  ];

  const fileName = `Proposta Legacy BrandCo. - ${client}`;
  const getRoot = useCallback(() => rootRef.current, []);
  const { print, preparing } = usePrintPdf(getRoot, fileName);

  useEffect(() => {
    if (!autoPrint) return;
    const t = setTimeout(() => void print(), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPrint]);

  /* ---------- Barra fixa, progresso e capítulo atual ---------- */
  const [showBar, setShowBar] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("inicio");
  const [indexOpen, setIndexOpen] = useState(false);

  useEffect(() => {
    if (!chrome) return;
    const onScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (y / h) * 100 : 0);
      setShowBar(y > window.innerHeight * 0.6);
      const secs = rootRef.current?.querySelectorAll<HTMLElement>("[data-chap]") ?? [];
      let current = "inicio";
      secs.forEach((s) => {
        if (s.getBoundingClientRect().top <= window.innerHeight * 0.35)
          current = s.dataset.chap || current;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [chrome]);

  /* ---------- Lightbox ---------- */
  const [lb, setLb] = useState<{ images: string[]; i: number; name: string } | null>(null);
  const closeLb = () => setLb(null);
  const stepLb = (n: number) =>
    setLb((s) => (s ? { ...s, i: (s.i + n + s.images.length) % s.images.length } : s));

  useEffect(() => {
    const lock = !!lb || indexOpen;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lb, indexOpen]);

  /* ---------- Teclado ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest("input, textarea, select, [contenteditable]")) return;
      if (lb) {
        if (e.key === "Escape") closeLb();
        if (e.key === "ArrowRight") stepLb(1);
        if (e.key === "ArrowLeft") stepLb(-1);
        return;
      }
      if (!chrome) return;
      if (e.key === "Escape") setIndexOpen(false);
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp"].includes(e.key)) {
        const dir = e.key === "ArrowDown" || e.key === "PageDown" ? 1 : -1;
        const secs = [...(rootRef.current?.querySelectorAll<HTMLElement>(".lbc-snap") ?? [])];
        const tops = secs.map((s) => s.getBoundingClientRect().top);
        const target =
          dir > 0
            ? secs[tops.findIndex((v) => v > 70)]
            : secs[[...tops.keys()].filter((i) => tops[i] < -10).pop() ?? 0];
        if (target) {
          e.preventDefault();
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb, chrome]);

  const chapterNumber = Math.max(1, chapters.findIndex((c) => c.id === active) + 1);
  const chapterLabel = chapters.find((c) => c.id === active)?.label ?? "";

  /* ---------- WhatsApp ---------- */
  const waMsg = valid.expired
    ? `Olá! Vi a proposta da Legacy BrandCo. para ${client} e gostaria de receber os valores atualizados.`
    : `Olá! Vi a proposta da Legacy BrandCo. para ${client} e quero começar o projeto.`;
  const ctaHref = p.whatsapp
    ? `https://wa.me/${p.whatsapp}?text=${encodeURIComponent(waMsg)}`
    : `${BRAND.site}/#contato`;

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

  return (
    <div className={`lbc${onEdit ? " lbc-editing" : ""}`} ref={rootRef}>
      {chrome && (
        <header className={`lbc-top${showBar ? " show" : ""}`}>
          <div className="lbc-wrap lbc-top-in">
            <a href="#inicio" aria-label="Voltar ao início">
              <img
                className="lbc-seal"
                src={BRAND.sealDark}
                alt="Legacy BrandCo."
                width={946}
                height={372}
              />
            </a>
            <div className="lbc-chap" aria-live="polite">
              <b>{String(chapterNumber).padStart(2, "0")}</b>
              {"  "}
              {chapterLabel}
            </div>
            <button
              className="lbc-pill-btn lbc-hide-s"
              onClick={() => void print()}
              disabled={preparing}
            >
              <DownloadIcon /> {preparing ? "Preparando..." : "PDF"}
            </button>
            <button
              className="lbc-pill-btn"
              onClick={() => setIndexOpen(true)}
              aria-haspopup="dialog"
            >
              <MenuIcon /> Índice
            </button>
            <div className="lbc-prog" style={{ width: `${progress}%` }} />
          </div>
        </header>
      )}

      {chrome && indexOpen && (
        <nav className="lbc-index" role="dialog" aria-modal="true" aria-label="Índice">
          <div className="lbc-wrap">
            <header>
              <img
                src={BRAND.sealLight}
                alt="Legacy BrandCo."
                style={{ height: 24, width: "auto" }}
              />
              <button className="lbc-pill-btn" onClick={() => setIndexOpen(false)} autoFocus>
                Fechar
              </button>
            </header>
            <ol>
              {chapters.map((c) => (
                <li key={c.id}>
                  <a
                    href={`#${c.id}`}
                    aria-current={c.id === active ? "true" : undefined}
                    onClick={() => setIndexOpen(false)}
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}

      <main>
        {/* CAPA */}
        <section className="lbc-cover lbc-snap lbc-page" id="inicio" data-chap="inicio">
          <div className="lbc-wrap">
            <div className="lbc-cover-meta">
              <span>
                {txt(
                  "cover_label",
                  p.cover_label || "Proposta de Estratégia de Marca",
                  "Proposta de Estratégia de Marca",
                )}
              </span>
              <span>{coverDate}</span>
            </div>
            <div className="lbc-mark">
              <img src={BRAND.logoDark} alt="Legacy BrandCo." width={1716} height={612} />
            </div>
            <div className="lbc-for">
              <div>
                <small>Proposta preparada para</small>
                <div className="lbc-client">{txt("client_name", client, "Nome do cliente")}</div>
              </div>
              <a className="lbc-go lbc-no-print" href={showDiag ? "#entendemos" : "#quem-somos"}>
                Role para começar <ArrowDown />
              </a>
            </div>
          </div>
        </section>

        {/* DIAGNÓSTICO */}
        {showDiag && (
          <section
            className="lbc-sec lbc-diag lbc-snap lbc-page"
            id="entendemos"
            data-chap="entendemos"
          >
            <div className="lbc-wrap">
              <p className="lbc-kicker">
                <b>O seu negócio</b>
              </p>
              <h2 className="lbc-d lbc-h1">
                O que entendemos
                <br />
                sobre {client}
              </h2>
              <div className="lbc-cols">
                {(
                  [
                    ["Momento", diag.moment, DIAGNOSIS_PLACEHOLDERS.moment, "diagnosis_moment"],
                    [
                      "Desafio",
                      diag.challenge,
                      DIAGNOSIS_PLACEHOLDERS.challenge,
                      "diagnosis_challenge",
                    ],
                    ["Objetivo", diag.goal, DIAGNOSIS_PLACEHOLDERS.goal, "diagnosis_goal"],
                  ] as const
                )
                  .filter(([, v]) => v || showPlaceholders)
                  .map(([label, v, ph, field]) => (
                    <div className="lbc-col" key={label}>
                      <h3>{label}</h3>
                      <p className={v || onEdit ? "" : "ph"}>{txt(field, v || ph, ph)}</p>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* QUEM SOMOS */}
        <section
          className="lbc-sec lbc-about lbc-snap lbc-page"
          id="quem-somos"
          data-chap="quem-somos"
        >
          <div className="lbc-wrap lbc-grid-2">
            <div className="lbc-mosaic" aria-label="Equipe Legacy BrandCo.">
              {BRAND.team.map((src, i) => (
                <img key={src} className={`m${i}`} src={src} alt="" loading="lazy" />
              ))}
            </div>
            <div>
              <p className="lbc-kicker">
                <b>Quem somos</b>
              </p>
              <h2 className="lbc-d lbc-h2">
                Somos especialistas em Branding, Estratégia e construção de marcas.
              </h2>
              <ul className="lbc-facts">
                <li>Mais de 8 anos de experiência</li>
                <li>Clientes atendidos em todo o Brasil</li>
                <li>Trabalhamos com grandes players do mercado</li>
              </ul>
            </div>
          </div>
        </section>

        {/* O QUE FAZEMOS */}
        <section
          className="lbc-sec lbc-deep lbc-snap lbc-page"
          id="o-que-fazemos"
          data-chap="o-que-fazemos"
        >
          <div className="lbc-wrap">
            <p className="lbc-kicker">
              <b>O que fazemos</b>
            </p>
            <h2 className="lbc-d lbc-h1">
              Estratégia de marca
              <br />e Identidade Visual
            </h2>
            <p className="lbc-promise">
              Nós criamos <strong>estrategicamente o seu posicionamento de marca</strong> no
              mercado, construímos a sua <strong>base de comunicação</strong> e destacamos o seu{" "}
              <strong>diferencial de atuação</strong>.
            </p>
            <div className="lbc-flow" aria-label="Do posicionamento à identidade visual">
              <div>
                <small>Estratégia</small>
                <b>Posicionamento de marca</b>
              </div>
              <div>
                <small>Estratégia</small>
                <b>Base de comunicação</b>
              </div>
              <div>
                <small>Estratégia</small>
                <b>Diferencial de atuação</b>
              </div>
              <div>
                <small>Resultado</small>
                <b>Identidade visual de alto padrão</b>
              </div>
            </div>
            <p className="lbc-close-line">
              Traduzimos tudo isso em uma identidade visual de alto padrão, totalmente intencional e
              alinhada com os seus objetivos.
            </p>
          </div>
        </section>

        {/* CASES */}
        {cases.length > 0 && (
          <>
            <section
              className="lbc-sec lbc-cases-intro lbc-snap lbc-page"
              id="marcas"
              data-chap="marcas"
            >
              <div className="lbc-wrap">
                <p className="lbc-kicker">
                  <b>Portfólio</b>
                </p>
                <h2 className="lbc-d lbc-h1">
                  Marcas e estratégias
                  <br />
                  que construímos
                </h2>
                <nav className="lbc-chips lbc-no-print" aria-label="Cases">
                  {cases.map((c) => (
                    <a key={c.slug} href={`#case-${c.slug}`}>
                      {c.name}
                    </a>
                  ))}
                </nav>
              </div>
            </section>
            {cases.map((c) => (
              <CaseBlock
                key={c.slug}
                c={c}
                onOpen={(images, i) => setLb({ images, i, name: c.name })}
              />
            ))}
          </>
        )}

        {/* COMO TRABALHAMOS */}
        <section
          className="lbc-sec lbc-snap lbc-page"
          id="como-trabalhamos"
          data-chap="como-trabalhamos"
        >
          <div className="lbc-wrap">
            <p className="lbc-kicker">
              <b>Como trabalhamos</b>
            </p>
            <h2 className="lbc-d lbc-h1">
              Da pesquisa
              <br />à entrega final
            </h2>
            <div className="lbc-gantt" role="table" aria-label="Cronograma do projeto">
              <div role="row" style={{ display: "contents" }}>
                <div className="wk" style={{ borderLeft: 0 }} />
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div className="wk" key={n} role="columnheader">
                    Semana {n}
                  </div>
                ))}
              </div>
              <GanttRow
                w="Semana 1"
                title="Onboarding e Pesquisa"
                text="Você responde o Legacy Brand Canvas e fazemos as calls de alinhamento"
              >
                <div className="bar" style={{ gridColumn: "1/2" }}>
                  Pesquisa
                </div>
              </GanttRow>
              <GanttRow w="Semana 2" title="Moodboard" text="A direção visual da sua marca">
                <div className="bar" style={{ gridColumn: "2/3" }}>
                  Moodboard
                </div>
              </GanttRow>
              <GanttRow
                w="Semanas 3 a 5"
                title="Criação da identidade visual"
                text="Testes, validação e apresentação"
                tall
              >
                <div className="bar hot" style={{ gridColumn: "3/6" }}>
                  Criação da identidade visual
                </div>
                <div className="subs" style={{ gridColumn: "3/6" }}>
                  <span>Testes</span>
                  <span>Validação</span>
                  <span>Apresentação</span>
                </div>
              </GanttRow>
              <GanttRow
                w="Semana 6"
                title="Entrega final"
                text="Todos os arquivos organizados no Google Drive"
              >
                <div className="bar" style={{ gridColumn: "6/7" }}>
                  Entrega
                </div>
              </GanttRow>
            </div>
            <p className="lbc-note">
              * O prazo de {p.deadline_days} dias se inicia{" "}
              <b>após respondido com profundidade a ferramenta Legacy Brand Canvas</b> e após
              possíveis calls de alinhamento.
            </p>
          </div>
        </section>

        {/* ENTREGÁVEIS */}
        <Deliverables items={deliverables} />

        {/* INVESTIMENTO */}
        <section
          className="lbc-sec lbc-deep lbc-inv lbc-snap lbc-page"
          id="investimento"
          data-chap="investimento"
        >
          <div className="lbc-wrap lbc-grid-2 inv">
            <div>
              <p className="lbc-kicker">
                <b>Investimento</b>
              </p>
              <p className="lbc-total">
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
              <div className="lbc-prazo">
                <div>
                  <small>Prazo estimado</small>
                  <b>
                    {onEdit ? (
                      <EditText
                        value={String(p.deadline_days)}
                        placeholder="40"
                        selectAll
                        onCommit={(v) => {
                          const n = Math.round(Number(v.replace(/\D/g, "")));
                          if (n >= 1 && n <= 365) onEdit({ deadline_days: n });
                        }}
                      />
                    ) : (
                      p.deadline_days
                    )}{" "}
                    dias
                  </b>
                </div>
                <div>
                  <small>Entregas</small>
                  <b>{deliverables.length}</b>
                </div>
              </div>
            </div>
            <div>
              <div className={`lbc-opts${price.showInstallments ? "" : " single"}`}>
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
        <section
          className="lbc-sec lbc-next lbc-snap lbc-page"
          id="proximos-passos"
          data-chap="proximos-passos"
        >
          <div className="lbc-wrap">
            <p className="lbc-kicker">
              <b>Próximos passos</b>
            </p>
            <h2 className="lbc-d lbc-h1">Como começamos</h2>
            <ol className="lbc-steps">
              <li>
                <small>Passo 1</small>
                <b>Aceite da proposta</b>
                <p>Você confirma a forma de pagamento que prefere.</p>
              </li>
              <li>
                <small>Passo 2</small>
                <b>Legacy Brand Canvas</b>
                <p>Você responde com profundidade a nossa ferramenta de estratégia.</p>
              </li>
              <li>
                <small>Passo 3</small>
                <b>Início do projeto</b>
                <p>
                  Fazemos as calls de alinhamento e o prazo de {p.deadline_days} dias começa a
                  contar.
                </p>
              </li>
            </ol>
            <div className="lbc-cta lbc-no-print">
              <a className="primary" href={ctaHref} target="_blank" rel="noopener noreferrer">
                {valid.expired ? "Pedir valores atualizados" : "Quero começar"} <ArrowRight />
              </a>
              <button className="ghost" onClick={() => void print()} disabled={preparing}>
                <DownloadIcon /> {preparing ? "Preparando PDF..." : "Baixar PDF"}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="lbc-end lbc-page">
        <div className="lbc-wrap">
          <img
            src={BRAND.logoLight}
            alt="Legacy BrandCo."
            width={1716}
            height={612}
            loading="lazy"
          />
          <div className="row">
            <span>Legacy BrandCo. Estratégia de Marca</span>
            <a href={BRAND.site} target="_blank" rel="noopener noreferrer">
              {BRAND.siteLabel}
            </a>
          </div>
        </div>
      </footer>

      {lb && <Lightbox state={lb} onClose={closeLb} onStep={stepLb} />}
    </div>
  );
}

/* =================== Subcomponentes =================== */

/**
 * Texto que se edita com um clique (modo de edição do CRM).
 * Não controlado enquanto está em foco; Enter ou sair do campo confirma, Esc desfaz.
 */
function EditText({
  value,
  placeholder,
  onCommit,
  selectAll = false,
}: {
  value: string;
  placeholder: string;
  onCommit: (v: string) => void;
  /** Números: seleciona tudo ao clicar, para digitar o novo valor por cima. */
  selectAll?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.textContent !== value) el.textContent = value;
  }, [value]);

  return (
    <span
      ref={ref}
      className="lbc-editable"
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={placeholder}
      data-ph={placeholder}
      spellCheck
      onClick={(e) => e.preventDefault()}
      onFocus={(e) => {
        if (!selectAll) return;
        const el = e.currentTarget;
        requestAnimationFrame(() => {
          const range = document.createRange();
          range.selectNodeContents(el);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        });
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") {
          e.currentTarget.textContent = latest.current;
          e.currentTarget.blur();
        }
      }}
      onPaste={(e) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain").replace(/\s+/g, " ");
        document.execCommand("insertText", false, text);
      }}
      onBlur={(e) => {
        const el = e.currentTarget;
        const v = (el.textContent ?? "").replace(/\s+/g, " ").trim();
        if (v !== latest.current) onCommit(v);
        // Se o valor foi recusado ou normalizado, volta a mostrar o valor salvo.
        requestAnimationFrame(() => {
          if (document.activeElement !== el) el.textContent = latest.current;
        });
      }}
    />
  );
}

function GanttRow({
  w,
  title,
  text,
  tall,
  children,
}: {
  w: string;
  title: string;
  text: string;
  tall?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <div className="lab" data-w={w} role="rowheader">
        <b>{title}</b>
        <span>{text}</span>
      </div>
      <div className={`trk${tall ? " tall" : ""}`} role="cell">
        {children}
      </div>
    </>
  );
}

function CaseBlock({ c, onOpen }: { c: CaseStudy; onOpen: (images: string[], i: number) => void }) {
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const backup = LOCAL_BACKUP_IMAGES[c.slug] ?? [];
  const alive = c.images.filter((s) => !broken.has(s));
  const images = alive.length ? alive : backup;
  const markBroken = (src: string) => setBroken((b) => new Set(b).add(src));
  const MAX_THUMBS = 4;
  const thumbs = images.slice(1, 1 + MAX_THUMBS);
  const rest = images.length - 1 - thumbs.length;
  const hasStory = !!(c.context || c.challenge || c.solution);

  if (!images.length) return null;

  return (
    <section className="lbc-case lbc-snap lbc-page" id={`case-${c.slug}`} data-chap="marcas">
      <div className="lbc-wrap">
        <div className="head">
          <div>
            <p className="seg">{c.segment}</p>
            <h3 className="lbc-d name">{c.name}</h3>
            {c.handle && <span className="handle">{c.handle}</span>}
          </div>
          <div>
            {c.summary ? (
              <p className="txt">{c.summary}</p>
            ) : c.quote ? (
              <p className="quote">
                “{c.quote}”<small>Frase da marca</small>
              </p>
            ) : null}
          </div>
        </div>

        {hasStory && (
          <div className="story">
            {c.context && (
              <div>
                <h4>Contexto</h4>
                <p>{c.context}</p>
              </div>
            )}
            {c.challenge && (
              <div>
                <h4>Desafio</h4>
                <p>{c.challenge}</p>
              </div>
            )}
            {c.solution && (
              <div>
                <h4>O que foi feito</h4>
                <p>{c.solution}</p>
              </div>
            )}
          </div>
        )}

        <div className="lbc-gal">
          <button
            className="main"
            onClick={() => onOpen(images, 0)}
            aria-label={`Ampliar imagem de ${c.name}`}
          >
            <img
              src={images[0]}
              alt={`Identidade visual ${c.name}`}
              loading="lazy"
              onError={() => markBroken(images[0])}
            />
          </button>
          {thumbs.length > 0 && (
            <div
              className="row"
              style={{ gridTemplateColumns: `repeat(${thumbs.length}, minmax(0,1fr))` }}
            >
              {thumbs.map((src, k) => (
                <button
                  key={src}
                  onClick={() => onOpen(images, k + 1)}
                  aria-label={`Ampliar imagem ${k + 2} de ${c.name}`}
                >
                  <img src={src} alt="" loading="lazy" onError={() => markBroken(src)} />
                  {k === thumbs.length - 1 && rest > 0 && <span className="more">+{rest}</span>}
                </button>
              ))}
            </div>
          )}
          <div className="meta lbc-no-print">
            <span>{images.length > 1 ? `${images.length} imagens` : ""}</span>
            {c.siteUrl && (
              <a href={c.siteUrl} target="_blank" rel="noopener noreferrer">
                Ver case completo <ArrowRight />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Deliverables({ items }: { items: { title: string; text: string }[] }) {
  const [openAll, setOpenAll] = useState<boolean | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const toggleAll = () => {
    const all = [...(ref.current?.querySelectorAll("details") ?? [])];
    const next = !all.every((d) => d.open);
    all.forEach((d) => (d.open = next));
    setOpenAll(next);
  };
  return (
    <section
      className="lbc-sec lbc-snap lbc-page lbc-surface"
      id="entregaveis"
      data-chap="entregaveis"
    >
      <div className="lbc-wrap">
        <p className="lbc-kicker">
          <b>O que você recebe</b>
        </p>
        <h2 className="lbc-d lbc-h1">
          {items.length === 8 ? "Oito entregas que" : `${items.length} entregas que`}
          <br />
          formam a sua marca
        </h2>
        <div className="lbc-dl" ref={ref}>
          {items.map((d) => (
            <details key={d.title}>
              <summary>
                {d.title}
                <i aria-hidden="true" />
              </summary>
              <p>{d.text}</p>
            </details>
          ))}
        </div>
        <div className="lbc-dl-actions lbc-no-print">
          <button className="lbc-link-btn" onClick={toggleAll}>
            {openAll ? "Fechar todos" : "Abrir todos"}
          </button>
        </div>
      </div>
    </section>
  );
}

function Lightbox({
  state,
  onClose,
  onStep,
}: {
  state: { images: string[]; i: number; name: string };
  onClose: () => void;
  onStep: (n: number) => void;
}) {
  const x0 = useRef<number | null>(null);
  const multi = state.images.length > 1;
  return (
    <div
      className="lbc-lb"
      role="dialog"
      aria-modal="true"
      aria-label={`Imagens de ${state.name}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (x0.current === null) return;
        const dx = e.changedTouches[0].clientX - x0.current;
        if (multi && Math.abs(dx) > 40) onStep(dx < 0 ? 1 : -1);
        x0.current = null;
      }}
    >
      <img src={state.images[state.i]} alt={`Identidade visual ${state.name}`} />
      <button className="x" onClick={onClose} aria-label="Fechar" autoFocus>
        <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 3l10 10M13 3 3 13" />
        </svg>
      </button>
      {multi && (
        <>
          <button className="p" onClick={() => onStep(-1)} aria-label="Anterior">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M10 3 5 8l5 5" />
            </svg>
          </button>
          <button className="n" onClick={() => onStep(1)} aria-label="Próxima">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="m6 3 5 5-5 5" />
            </svg>
          </button>
        </>
      )}
      <div className="c">
        {state.name}
        {multi ? `  ${state.i + 1} / ${state.images.length}` : ""}
      </div>
    </div>
  );
}

const ArrowRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    aria-hidden="true"
  >
    <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
  </svg>
);
const ArrowDown = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M6 1v10M1.5 6.5 6 11l4.5-4.5" />
  </svg>
);
const MenuIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M1 3h12M1 7h12M1 11h8" />
  </svg>
);
const DownloadIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M7 1v8M3.5 5.5 7 9l3.5-3.5M1.5 12.5h11" />
  </svg>
);
