import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
  type ReactNode,
} from "react";
import "./proposta.css";
import type { CaseStudy, Proposal } from "./types";
import { BRAND, DEFAULT_DELIVERABLES, DIAGNOSIS_PLACEHOLDERS } from "./defaults";
import { LOCAL_BACKUP_IMAGES, resolveCases } from "./cases";
import { brlNumber, brlShort, fmtDate, parseBrl, pricing, validity } from "./format";
import { usePrintPdf } from "./usePrintPdf";

/** Tamanho fixo de cada slide. A tela e o PDF usam o mesmo quadro. */
const SLIDE_W = 1920;
const SLIDE_H = 1080;

interface Props {
  proposal: Proposal;
  /** Controles de apresentação (contador, setas, índice, PDF, tela cheia). */
  chrome?: boolean;
  /** Mostra os textos-guia quando o diagnóstico está vazio (só no editor). */
  showPlaceholders?: boolean;
  /** Dispara a impressão automaticamente (usado por ?pdf=1). */
  autoPrint?: boolean;
  /** Modo de edição do CRM: textos e valores viram editáveis com um clique. */
  onEdit?: (patch: Partial<Proposal>) => void;
  /** Altura de uma barra fixa acima da proposta (a barra de edição do CRM). */
  topOffset?: number;
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
  topOffset = 0,
}: Props) {
  const showPlaceholders = showPh || !!onEdit;
  const rootRef = useRef<HTMLDivElement>(null);
  const client = p.client_name?.trim() || "Sua empresa";
  const cases = useMemo(() => resolveCases(p.case_slugs), [p.case_slugs]);
  const deliverables = p.deliverables?.length ? p.deliverables : DEFAULT_DELIVERABLES;
  const price = pricing(p);
  const valid = validity(p.valid_until);

  /** Texto editável no modo de edição; texto puro na apresentação. */
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

  /* ---------- Escala: cada slide 1920x1080 cabe inteiro na área visível ---------- */
  const [fit, setFit] = useState({ s: 1, h: SLIDE_H });

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const update = () => {
      const h = Math.max(200, window.innerHeight - topOffset);
      const w = el.clientWidth || window.innerWidth;
      setFit({ s: Math.min(w / SLIDE_W, h / SLIDE_H), h });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [topOffset]);

  // Ao rolar com o mouse, a página se acomoda no slide mais próximo; os cases rolam livres.
  useEffect(() => {
    const html = document.documentElement;
    const prev = { snap: html.style.scrollSnapType, pad: html.style.scrollPaddingTop };
    html.style.scrollSnapType = "y proximity";
    html.style.scrollPaddingTop = `${topOffset}px`;
    return () => {
      html.style.scrollSnapType = prev.snap;
      html.style.scrollPaddingTop = prev.pad;
    };
  }, [topOffset]);

  /* ---------- Slide atual ---------- */
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [chapterId, setChapterId] = useState("inicio");
  const [indexOpen, setIndexOpen] = useState(false);

  // Paradas da navegação: os slides e os cases que estão visíveis na tela.
  const frames = useCallback(
    () =>
      [...(rootRef.current?.querySelectorAll<HTMLElement>(".lbc-stop") ?? [])].filter(
        (el) => el.getClientRects().length > 0,
      ),
    [],
  );

  useEffect(() => {
    const onScroll = () => {
      const list = frames();
      setTotal(list.length);
      // A parada atual é a última cujo topo já passou pelo topo da área visível.
      let best = 0;
      list.forEach((f, i) => {
        if (f.getBoundingClientRect().top <= topOffset + 8) best = i;
      });
      setCurrent(best);
      setChapterId(list[best]?.dataset.chap || "inicio");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [frames, topOffset, cases.length, showDiag]);

  // Rola a janela até o elemento. Não usa scrollIntoView: o body do site tem
  // overflow-x: hidden e o navegador tentaria rolar o body, que não rola.
  const scrollToEl = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - topOffset,
        behavior: reduce ? "instant" : "smooth",
      });
    },
    [topOffset],
  );

  // Destino do último salto: enquanto a rolagem suave acontece, novos toques
  // continuam a partir dele (sem isso, dois toques rápidos viram um só).
  const pendingRef = useRef<{ i: number; until: number } | null>(null);

  const currentIndex = useCallback(() => {
    let best = 0;
    frames().forEach((f, i) => {
      if (f.getBoundingClientRect().top <= topOffset + 8) best = i;
    });
    return best;
  }, [frames, topOffset]);

  const goTo = useCallback(
    (i: number) => {
      const list = frames();
      const idx = Math.max(0, Math.min(list.length - 1, i));
      pendingRef.current = { i: idx, until: performance.now() + 900 };
      scrollToEl(list[idx] ?? null);
    },
    [frames, scrollToEl],
  );

  const jumpTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIndexOpen(false);
    scrollToEl(document.getElementById(id));
  };

  // Avança um passo: dentro de um case mais alto que a tela, rola o case;
  // senão, vai para a próxima parada.
  const step = useCallback(
    (dir: 1 | -1) => {
      const pending = pendingRef.current;
      if (pending && performance.now() < pending.until) {
        goTo(pending.i + dir);
        return;
      }
      const idx = currentIndex();
      const cur = frames()[idx];
      if (cur) {
        const r = cur.getBoundingClientRect();
        const page = (window.innerHeight - topOffset) * 0.85;
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth";
        const below = r.bottom - window.innerHeight;
        const above = topOffset - r.top;
        // Só rola por dentro quando sobra um pedaço que vale a pena ver.
        if (dir > 0 && below > page * 0.2) {
          window.scrollBy({ top: Math.min(below, page), behavior });
          return;
        }
        if (dir < 0 && above > page * 0.2) {
          window.scrollBy({ top: -Math.min(above, page), behavior });
          return;
        }
      }
      goTo(idx + dir);
    },
    [frames, currentIndex, topOffset, goTo],
  );

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };

  /* ---------- Lightbox ---------- */
  const [lb, setLb] = useState<{ images: string[]; i: number; name: string } | null>(null);
  const closeLb = () => setLb(null);
  const stepLb = (n: number) =>
    setLb((s) => (s ? { ...s, i: (s.i + n + s.images.length) % s.images.length } : s));
  const openLb = (name: string) => (images: string[], i: number) => setLb({ images, i, name });

  useEffect(() => {
    const lock = !!lb || indexOpen;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lb, indexOpen]);

  /* ---------- Teclado: setas, espaço, Page Up/Down, Home/End e F ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && t.closest("input, textarea, select, [contenteditable]")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (lb) {
        if (e.key === "Escape") closeLb();
        if (e.key === "ArrowRight") stepLb(1);
        if (e.key === "ArrowLeft") stepLb(-1);
        return;
      }
      if (e.key === "Escape") setIndexOpen(false);
      if (indexOpen) return;
      const next = ["ArrowDown", "ArrowRight", "PageDown", " "].includes(e.key);
      const prev = ["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key);
      if (next || prev) {
        e.preventDefault();
        step(next ? 1 : -1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(Number.MAX_SAFE_INTEGER);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb, indexOpen, step, goTo]);

  const chapterLabel = chapters.find((c) => c.id === chapterId)?.label ?? "";

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

  const rootStyle = {
    "--s": fit.s,
    "--fh": `${fit.h}px`,
  } as React.CSSProperties;

  return (
    <div className={`lbc${onEdit ? " lbc-editing" : ""}`} ref={rootRef} style={rootStyle}>
      {/* CAPA */}
      <Slide id="inicio" chap="inicio" tone="lime" className="lbc-cover">
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
          <small>Proposta preparada para</small>
          <div className="lbc-client">{txt("client_name", client, "Nome do cliente")}</div>
        </div>
      </Slide>

      {/* DIAGNÓSTICO */}
      {showDiag && (
        <Slide
          id="entendemos"
          chap="entendemos"
          tone="paper"
          className={hasDiag ? "" : "lbc-print-hide"}
        >
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
                <div className={`lbc-col${v ? "" : " lbc-print-hide"}`} key={label}>
                  <h3>{label}</h3>
                  <p className={v || onEdit ? "" : "ph"}>{txt(field, v || ph, ph)}</p>
                </div>
              ))}
          </div>
        </Slide>
      )}

      {/* QUEM SOMOS */}
      <Slide id="quem-somos" chap="quem-somos" tone="paper" className="lbc-about">
        <div className="lbc-mosaic" aria-label="Equipe Legacy BrandCo.">
          {BRAND.team.map((src, i) => (
            <img key={src} className={`m${i}`} src={src} alt="" loading="lazy" />
          ))}
        </div>
        <div className="lbc-about-txt">
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
      </Slide>

      {/* O QUE FAZEMOS */}
      <Slide id="o-que-fazemos" chap="o-que-fazemos" tone="deep">
        <p className="lbc-kicker">
          <b>O que fazemos</b>
        </p>
        <h2 className="lbc-d lbc-h1">
          Estratégia de marca
          <br />e Identidade Visual
        </h2>
        <p className="lbc-promise">
          Nós criamos <strong>estrategicamente o seu posicionamento de marca</strong> no mercado,
          construímos a sua <strong>base de comunicação</strong> e destacamos o seu{" "}
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
      </Slide>

      {/* CASES */}
      {cases.length > 0 && (
        <>
          <Slide id="marcas" chap="marcas" tone="lime" className="lbc-cases-intro">
            <p className="lbc-kicker">
              <b>Portfólio</b>
            </p>
            <h2 className="lbc-d lbc-h1">
              Marcas e estratégias
              <br />
              que construímos
            </h2>
            <nav className="lbc-chips" aria-label="Cases">
              {cases.map((c) => (
                <a key={c.slug} href={`#case-${c.slug}`} onClick={jumpTo(`case-${c.slug}`)}>
                  {c.name}
                </a>
              ))}
            </nav>
          </Slide>
          {cases.map((c) => (
            <Fragment key={c.slug}>
              <WebCase c={c} onOpen={openLb(c.name)} />
              <CaseSlides c={c} onOpen={openLb(c.name)} />
            </Fragment>
          ))}
        </>
      )}

      {/* COMO TRABALHAMOS */}
      <Slide id="como-trabalhamos" chap="como-trabalhamos" tone="paper">
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
            title="Onboarding e Pesquisa"
            text="Você responde o Legacy Brand Canvas e fazemos as calls de alinhamento"
          >
            <div className="bar" style={{ gridColumn: "1/2" }}>
              Pesquisa
            </div>
          </GanttRow>
          <GanttRow title="Moodboard" text="A direção visual da sua marca">
            <div className="bar" style={{ gridColumn: "2/3" }}>
              Moodboard
            </div>
          </GanttRow>
          <GanttRow
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
          <GanttRow title="Entrega final" text="Todos os arquivos organizados no Google Drive">
            <div className="bar" style={{ gridColumn: "6/7" }}>
              Entrega
            </div>
          </GanttRow>
        </div>
        <p className="lbc-note">
          * O prazo de {p.deadline_days} dias se inicia{" "}
          <b>após respondido com profundidade a ferramenta Legacy Brand Canvas</b> e após possíveis
          calls de alinhamento.
        </p>
      </Slide>

      {/* ENTREGÁVEIS */}
      <Slide id="entregaveis" chap="entregaveis" tone="surface">
        <p className="lbc-kicker">
          <b>O que você recebe</b>
        </p>
        <h2 className="lbc-d lbc-h1">
          {deliverables.length === 8 ? "Oito entregas que" : `${deliverables.length} entregas que`}
          <br />
          formam a sua marca
        </h2>
        <ol className="lbc-dl">
          {deliverables.map((d, i) => (
            <li key={d.title}>
              <small>{String(i + 1).padStart(2, "0")}</small>
              <b>{d.title}</b>
              <p>{d.text}</p>
            </li>
          ))}
        </ol>
      </Slide>

      {/* INVESTIMENTO */}
      <Slide id="investimento" chap="investimento" tone="deep" className="lbc-inv">
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
      </Slide>

      {/* PRÓXIMOS PASSOS */}
      <Slide id="proximos-passos" chap="proximos-passos" tone="lime">
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
              Fazemos as calls de alinhamento e o prazo de {p.deadline_days} dias começa a contar.
            </p>
          </li>
        </ol>
      </Slide>

      {/* ENCERRAMENTO */}
      <Slide id="fim" chap="proximos-passos" tone="deep" className="lbc-end">
        <img src={BRAND.logoLight} alt="Legacy BrandCo." width={1716} height={612} loading="lazy" />
        <div className="row">
          <span>Legacy BrandCo. Estratégia de Marca</span>
          <span>{BRAND.siteLabel}</span>
        </div>
      </Slide>

      {chrome && (
        <div className="lbc-ctrl lbc-no-print" role="toolbar" aria-label="Apresentação">
          <span className="lbc-ctrl-pos">
            <b>{String(current + 1).padStart(2, "0")}</b> / {String(total).padStart(2, "0")}
            <span className="lbc-ctrl-chap">{chapterLabel}</span>
          </span>
          <button onClick={() => step(-1)} disabled={current === 0} aria-label="Slide anterior">
            <ArrowUp />
          </button>
          <button
            onClick={() => step(1)}
            disabled={current >= total - 1}
            aria-label="Próximo slide"
          >
            <ArrowDown />
          </button>
          <button onClick={() => setIndexOpen(true)} aria-haspopup="dialog">
            <MenuIcon /> Índice
          </button>
          <button onClick={() => void print()} disabled={preparing}>
            <DownloadIcon /> {preparing ? "Preparando..." : "PDF"}
          </button>
          <button onClick={toggleFullscreen} aria-label="Tela cheia" title="Tela cheia (F)">
            <FullscreenIcon />
          </button>
        </div>
      )}

      {indexOpen && (
        <nav className="lbc-index lbc-no-print" role="dialog" aria-modal="true" aria-label="Índice">
          <div className="lbc-index-in">
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
                    aria-current={c.id === chapterId ? "true" : undefined}
                    onClick={jumpTo(c.id)}
                  >
                    {c.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}

      {lb && <Lightbox state={lb} onClose={closeLb} onStep={stepLb} />}
    </div>
  );
}

/* =================== Subcomponentes =================== */

/** Um slide de 1920x1080, centralizado e escalado para caber na tela. */
function Slide({
  id,
  chap,
  tone,
  className = "",
  children,
}: {
  id?: string;
  chap: string;
  tone: "lime" | "paper" | "surface" | "deep";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`lbc-frame lbc-stop tone-${tone} ${className}`} id={id} data-chap={chap}>
      <div className="lbc-slide">{children}</div>
    </section>
  );
}

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
  title,
  text,
  tall,
  children,
}: {
  title: string;
  text: string;
  tall?: boolean;
  children: ReactNode;
}) {
  return (
    <div role="row" style={{ display: "contents" }}>
      <div className="lab" role="rowheader">
        <b>{title}</b>
        <span>{text}</span>
      </div>
      <div className={`trk${tall ? " tall" : ""}`}>{children}</div>
    </div>
  );
}

/** Imagem clicável (abre a galeria) que troca pela cópia local se o link do site falhar. */
function Shot({
  src,
  alt,
  onOpen,
  className = "",
  onError,
}: {
  src: string;
  alt: string;
  onOpen: () => void;
  className?: string;
  onError: () => void;
}) {
  return (
    <button className={`lbc-shot ${className}`} onClick={onOpen} aria-label={alt}>
      <img src={src} alt={alt} loading="lazy" onError={onError} />
    </button>
  );
}

/**
 * Cases viram um ou dois slides:
 * - com Contexto/Desafio/O que foi feito: apresentação + história;
 * - com frase da marca: frase ao lado das imagens;
 * - com resumo: resumo ao lado da imagem.
 */
/**
 * Case na tela (link e reunião): bloco com rolagem livre, imagem grande,
 * miniaturas e galeria ampliável. No PDF entram os slides de CaseSlides.
 */
function WebCase({ c, onOpen }: { c: CaseStudy; onOpen: (images: string[], i: number) => void }) {
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
    <section
      className="lbc-webcase lbc-stop lbc-screen-only"
      id={`case-${c.slug}`}
      data-chap="marcas"
    >
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

function CaseSlides({
  c,
  onOpen,
}: {
  c: CaseStudy;
  onOpen: (images: string[], i: number) => void;
}) {
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const backup = LOCAL_BACKUP_IMAGES[c.slug] ?? [];
  const alive = c.images.filter((s) => !broken.has(s));
  const images = alive.length ? alive : backup;
  const markBroken = (src: string) => () => setBroken((b) => new Set(b).add(src));
  const hasStory = !!(c.context || c.challenge || c.solution);

  if (!images.length) return null;

  const shot = (i: number, className = "") =>
    images[i] ? (
      <Shot
        key={images[i]}
        src={images[i]}
        alt={i === 0 ? `Identidade visual ${c.name}` : `Imagem ${i + 1} de ${c.name}`}
        className={className}
        onOpen={() => onOpen(images, i)}
        onError={markBroken(images[i])}
      />
    ) : null;

  const head = (
    <div className="lbc-case-head">
      <p className="seg">{c.segment}</p>
      <h3 className="lbc-d name">{c.name}</h3>
      {c.handle && <span className="handle">{c.handle}</span>}
    </div>
  );

  const more =
    c.siteUrl || images.length > 1 ? (
      <div className="lbc-case-meta lbc-no-print">
        <span>{images.length > 1 ? `${images.length} imagens` : ""}</span>
        {c.siteUrl && (
          <a href={c.siteUrl} target="_blank" rel="noopener noreferrer">
            Ver case completo <ArrowRight />
          </a>
        )}
      </div>
    ) : null;

  // Galeria do lado direito: 1 imagem, 2 empilhadas ou principal + 3 miniaturas.
  const gallery =
    images.length === 1 ? (
      <div className="lbc-case-gal one">{shot(0)}</div>
    ) : images.length === 2 ? (
      <div className="lbc-case-gal two">
        {shot(0)}
        {shot(1)}
      </div>
    ) : (
      <div className="lbc-case-gal many">
        {shot(0, "main")}
        <div className="thumbs">
          {shot(1)}
          {shot(2)}
          {shot(3)}
        </div>
      </div>
    );

  return (
    <>
      <Slide chap="marcas" tone="paper" className="lbc-case lbc-print-only">
        <div className="lbc-case-txt">
          {head}
          {c.summary ? (
            <p className="txt">{c.summary}</p>
          ) : c.quote ? (
            <p className="quote">
              “{c.quote}”<small>Frase da marca</small>
            </p>
          ) : null}
          {!hasStory && more}
        </div>
        {gallery}
      </Slide>

      {hasStory && (
        <Slide chap="marcas" tone="surface" className="lbc-case-story lbc-print-only">
          <div className="lbc-case-story-head">
            <p className="seg">{c.segment}</p>
            <h3 className="lbc-d name">{c.name}</h3>
          </div>
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
          {images.length > 4 && (
            <div className="strip">
              {shot(4)}
              {shot(5)}
              {shot(6)}
              {shot(7)}
            </div>
          )}
          {more}
        </Slide>
      )}
    </>
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
      className="lbc-lb lbc-no-print"
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
    width="14"
    height="14"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M6 1v10M1.5 6.5 6 11l4.5-4.5" />
  </svg>
);
const ArrowUp = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M6 11V1M1.5 5.5 6 1l4.5 4.5" />
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
const FullscreenIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    <path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9" />
  </svg>
);
