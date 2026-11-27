import { useCallback, useEffect, useRef, useState } from "react";
import "../proposta.css";
import "../proposta-direcao.css";
import "./avulsa.css";
import { BRAND, DIRECAO_CARD_INSTALLMENTS, DIRECAO_CARD_RATE_12X } from "../defaults";
import { CASES, resolveCases } from "../cases";
import { brlNumber, parseBrl, round2 } from "../format";
import { usePrintPdf } from "../usePrintPdf";
import EditText from "../EditText";
import { CRM_PASS, isCrmAuthed } from "@/lib/crm-auth";
import { mergeAvulsa, type AvulsaData, type AvulsaItem } from "./defaults";

const PRINT_PAGE = "@media print { @page { size: A4 portrait; margin: 0; } }";
const BAR_H = 52;

async function loadAvulsa(slug: string): Promise<unknown> {
  const res = await fetch("/api/public/proposta-avulsa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "get", slug }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const { data } = (await res.json()) as { data: { data: unknown } | null };
  return data?.data ?? null;
}

async function saveAvulsa(slug: string, data: AvulsaData) {
  const res = await fetch("/api/public/proposta-avulsa", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-crm-token": CRM_PASS },
    body: JSON.stringify({ action: "save", slug, data }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
}

/**
 * Proposta avulsa com link próprio (ex.: /propostadra), no visual em slides.
 * Quem está logado no CRM vê uma barra no topo para ligar cases e preço,
 * escolher os cases e editar os textos com um clique. Tudo salva no banco.
 */
export default function PropostaAvulsa({
  slug,
  defaults,
}: {
  slug: string;
  defaults: AvulsaData;
}) {
  const [d, setD] = useState<AvulsaData>(defaults);
  const [loaded, setLoaded] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [status, setStatus] = useState<"" | "salvando" | "salvo" | "erro">("");
  const [picker, setPicker] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setAdmin(isCrmAuthed());
    loadAvulsa(slug)
      .then((saved) => setD(mergeAvulsa(defaults, saved)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [slug, defaults]);

  const update = (patch: Partial<AvulsaData>) => {
    setD((prev) => {
      const next = { ...prev, ...patch };
      clearTimeout(saveTimer.current);
      setStatus("salvando");
      saveTimer.current = setTimeout(() => {
        saveAvulsa(slug, next)
          .then(() => setStatus("salvo"))
          .catch(() => setStatus("erro"));
      }, 600);
      return next;
    });
  };

  const edit = admin;
  const t = (value: string, placeholder: string, onCommit: (v: string) => void) =>
    edit ? <EditText value={value} placeholder={placeholder} onCommit={onCommit} /> : value;

  const itemList = (key: "entregas" | "bonus", list: AvulsaItem[], i: number, f: keyof AvulsaItem) =>
    t(list[i][f], f === "title" ? "Título" : "Texto", (v) =>
      update({ [key]: list.map((it, j) => (j === i ? { ...it, [f]: v } : it)) }),
    );

  const client = d.client_name.trim() || "Sua empresa";
  const total = d.price_total;
  const cash = round2(total * (1 - d.cash_discount_pct / 100));
  const half = round2(total / 2);
  const card = Math.floor(round2(total * DIRECAO_CARD_RATE_12X * 100)) / 100;
  const cases = d.show_cases ? resolveCases(d.case_slugs) : [];

  const getRoot = useCallback(() => rootRef.current, []);
  const { print, preparing } = usePrintPdf(getRoot, `Proposta Legacy BrandCo. - ${client}`);

  const coverDate = new Date()
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .replace(/^./, (c) => c.toUpperCase());

  const toggleCase = (s: string) =>
    update({
      case_slugs: d.case_slugs.includes(s)
        ? d.case_slugs.filter((x) => x !== s)
        : [...d.case_slugs, s],
    });

  if (!loaded) return <div className="lbc-av-loading" />;

  return (
    <>
      {admin && (
        <div className="lbc-av-bar lbc-no-print" style={{ height: BAR_H }}>
          <b>Editando /{slug}</b>
          <label>
            <input
              type="checkbox"
              checked={d.show_cases}
              onChange={(e) => update({ show_cases: e.target.checked })}
            />
            Cases
          </label>
          <div className="lbc-av-pick">
            <button type="button" onClick={() => setPicker((v) => !v)}>
              Escolher cases ({d.case_slugs.length}) ▾
            </button>
            {picker && (
              <div className="lbc-av-menu">
                {CASES.map((c) => (
                  <label key={c.slug}>
                    <input
                      type="checkbox"
                      checked={d.case_slugs.includes(c.slug)}
                      onChange={() => toggleCase(c.slug)}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            )}
          </div>
          <label>
            <input
              type="checkbox"
              checked={d.show_price}
              onChange={(e) => update({ show_price: e.target.checked })}
            />
            Preço
          </label>
          <label>
            <input
              type="checkbox"
              checked={d.show_card}
              onChange={(e) => update({ show_card: e.target.checked })}
            />
            Cartão 12x
          </label>
          <span className="lbc-av-hint">Clique nos textos para editar</span>
          <span className={`lbc-av-status ${status}`}>
            {status === "salvando"
              ? "Salvando..."
              : status === "salvo"
                ? "Salvo"
                : status === "erro"
                  ? "Erro ao salvar"
                  : ""}
          </span>
        </div>
      )}

      <div
        className={`lbc lbc-dm${edit ? " lbc-editing" : ""}`}
        ref={rootRef}
        style={{ "--dm-top": `${admin ? BAR_H : 0}px` } as React.CSSProperties}
      >
        <style>{PRINT_PAGE}</style>

        {/* CAPA */}
        <section className="lbc-dm-sec tone-lime lbc-dm-cover" id="inicio">
          <div className="lbc-dm-wrap">
            <div className="lbc-dm-cover-meta">
              <span>{t(d.cover_label, "Rótulo da capa", (v) => update({ cover_label: v }))}</span>
              <span>{coverDate}</span>
            </div>
            <div className="lbc-dm-mark">
              <img src={BRAND.logoDark} alt="Legacy BrandCo." width={1716} height={612} />
            </div>
            <div className="lbc-dm-for">
              <small>Proposta preparada para</small>
              <div className="lbc-dm-client">
                {t(d.client_name, "Nome do cliente", (v) => update({ client_name: v }))}
              </div>
            </div>
          </div>
        </section>

        {/* O QUE PODEMOS ENTREGAR */}
        <section className="lbc-dm-sec tone-deep" id="entregas">
          <div className="lbc-dm-wrap">
            <p className="lbc-kicker">
              <b>{t(d.entregas_kicker, "Chamada", (v) => update({ entregas_kicker: v }))}</b>
            </p>
            <h2 className="lbc-d lbc-dm-h1">
              {t(d.entregas_title, "Título", (v) => update({ entregas_title: v }))}
            </h2>
            <p className="lbc-dm-lead">
              {t(d.entregas_lead, "Texto de abertura", (v) => update({ entregas_lead: v }))}
            </p>
            <ol className="lbc-av-grid">
              {d.entregas.map((_, i) => (
                <li key={i}>
                  <small>{String(i + 1).padStart(2, "0")}</small>
                  <b>{itemList("entregas", d.entregas, i, "title")}</b>
                  <p>{itemList("entregas", d.entregas, i, "text")}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* BÔNUS */}
        <section className="lbc-dm-sec tone-lime" id="bonus">
          <div className="lbc-dm-wrap">
            <p className="lbc-kicker">
              <b>Bônus</b>
            </p>
            <h2 className="lbc-d lbc-dm-h1">
              {t(d.bonus_title, "Título dos bônus", (v) => update({ bonus_title: v }))}
            </h2>
            <ol className="lbc-av-grid two">
              {d.bonus.map((_, i) => (
                <li key={i} className="lbc-av-bonus">
                  <small>Bônus {i + 1}</small>
                  <b>{itemList("bonus", d.bonus, i, "title")}</b>
                  <p>{itemList("bonus", d.bonus, i, "text")}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CASES */}
        {cases.length > 0 && (
          <section className="lbc-dm-sec tone-paper" id="cases">
            <div className="lbc-dm-wrap">
              <p className="lbc-kicker">
                <b>Cases</b>
              </p>
              <h2 className="lbc-d lbc-dm-h1">
                {t(d.cases_title, "Título dos cases", (v) => update({ cases_title: v }))}
              </h2>
              <ul className="lbc-av-cases">
                {cases.map((c) => (
                  <li key={c.slug}>
                    {c.images[0] && <img src={c.images[0]} alt={c.name} loading="lazy" />}
                    <b>{c.name}</b>
                    <small>{c.segment}</small>
                    {c.summary && <p>{c.summary}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* INVESTIMENTO */}
        {d.show_price && (
          <section className="lbc-dm-sec tone-deep" id="investimento">
            <div className="lbc-dm-wrap">
              <p className="lbc-kicker">
                <b>Investimento</b>
              </p>
              <p className="lbc-total lbc-dm-total">
                <span>R$</span>
                {edit ? (
                  <EditText
                    value={brlNumber(total)}
                    placeholder="0,00"
                    selectAll
                    onCommit={(v) => {
                      const n = parseBrl(v);
                      if (Number.isFinite(n) && n >= 0) update({ price_total: Math.round(n * 100) / 100 });
                    }}
                  />
                ) : (
                  brlNumber(total)
                )}
              </p>
              <div className={`lbc-opts lbc-dm-opts${d.show_card ? " three" : ""}`}>
                <div className={`lbc-opt${d.cash_discount_pct > 0 ? " best" : ""}`}>
                  {d.cash_discount_pct > 0 && <span className="tag">{d.cash_discount_pct}% OFF</span>}
                  <h3>À vista no Pix</h3>
                  <div className="v">
                    <small>R$</small>
                    {brlNumber(cash)}
                  </div>
                  <p>{t(d.cash_note, "Texto do Pix", (v) => update({ cash_note: v }))}</p>
                </div>
                <div className="lbc-opt">
                  <h3>2x sem juros</h3>
                  <div className="v">
                    <small>2x</small>R$ {brlNumber(half)}
                  </div>
                  <p>
                    {t(d.installments_note, "Texto das parcelas", (v) =>
                      update({ installments_note: v }),
                    )}
                  </p>
                </div>
                {d.show_card && (
                  <div className="lbc-opt">
                    <h3>Cartão de crédito</h3>
                    <div className="v">
                      <small>{DIRECAO_CARD_INSTALLMENTS}x</small>R$ {brlNumber(card)}
                    </div>
                    <p>Parcelado no cartão, com os juros da operadora.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

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
                <b>Aceite</b>
                <p>Você confirma a proposta e alinhamos os detalhes com a nossa equipe.</p>
              </li>
              <li>
                <small>Passo 2</small>
                <b>Briefing Legacy</b>
                <p>Você responde com profundidade a nossa ferramenta de briefing.</p>
              </li>
              <li>
                <small>Passo 3</small>
                <b>Mãos à obra</b>
                <p>Começamos pela estratégia e construímos a sua marca etapa por etapa.</p>
              </li>
            </ol>
          </div>
        </section>

        {/* ENCERRAMENTO */}
        <section className="lbc-dm-sec tone-deep lbc-dm-end" id="fim">
          <div className="lbc-dm-wrap">
            <img src={BRAND.logoLight} alt="Legacy BrandCo." width={1716} height={612} loading="lazy" />
            <div className="row">
              <span>Legacy BrandCo.</span>
              <span>{BRAND.siteLabel}</span>
            </div>
          </div>
        </section>

        <button
          type="button"
          className="lbc-dm-pdf lbc-no-print"
          onClick={() => void print()}
          disabled={preparing}
        >
          {preparing ? "Preparando..." : "Baixar PDF"}
        </button>
      </div>
    </>
  );
}
