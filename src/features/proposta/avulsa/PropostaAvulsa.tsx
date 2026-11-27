import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import "./avulsa.css";
import ProposalView, { Slide } from "../ProposalView";
import type { Proposal } from "../types";
import { CASES } from "../cases";
import EditText from "../EditText";
import { CRM_PASS, crmLogin, isCrmAuthed } from "@/lib/crm-auth";
import { mergeAvulsa, type AvulsaData, type AvulsaItem } from "./defaults";

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
 * Proposta avulsa com link próprio (ex.: /propostadra), em cima do modelo
 * completo (o mesmo das propostas do CRM), com slides extras de entregas e bônus.
 * Edição: abrir o link com ?editar e entrar com o login do CRM.
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
  const [wantsEdit, setWantsEdit] = useState(false);
  const [status, setStatus] = useState<"" | "salvando" | "salvo" | "erro">("");
  const [picker, setPicker] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const editParam = new URLSearchParams(window.location.search).has("editar");
    setWantsEdit(editParam);
    setAdmin(editParam && isCrmAuthed());
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

  // Os dados viram uma proposta comum para o modelo completo.
  const proposal: Proposal = useMemo(
    () => ({
      slug,
      product: "estrategia",
      client_name: d.client_name,
      cover_label: d.cover_label,
      show_diagnosis: false,
      diagnosis_moment: null,
      diagnosis_challenge: null,
      diagnosis_goal: null,
      price_total: d.price_total,
      installments: 2,
      installments_note: d.installments_note,
      cash_discount_pct: d.cash_discount_pct,
      cash_note: d.cash_note,
      show_card: d.show_card,
      deadline_days: 60,
      valid_until: null,
      case_slugs: d.show_cases && d.case_slugs.length ? d.case_slugs : [],
    }),
    [d, slug],
  );

  const onEdit = admin
    ? (patch: Partial<Proposal>) => {
        const map: Partial<AvulsaData> = {};
        if (patch.client_name !== undefined) map.client_name = patch.client_name;
        if (patch.cover_label !== undefined) map.cover_label = patch.cover_label;
        if (patch.price_total !== undefined) map.price_total = patch.price_total;
        if (patch.cash_note !== undefined) map.cash_note = patch.cash_note;
        if (patch.installments_note !== undefined) map.installments_note = patch.installments_note;
        if (Object.keys(map).length) update(map);
      }
    : undefined;

  const t = (value: string, placeholder: string, onCommit: (v: string) => void) =>
    admin ? <EditText value={value} placeholder={placeholder} onCommit={onCommit} /> : value;

  const item = (key: "entregas" | "bonus", list: AvulsaItem[], i: number, f: keyof AvulsaItem) =>
    t(list[i][f], f === "title" ? "Título" : "Texto", (v) =>
      update({ [key]: list.map((it, j) => (j === i ? { ...it, [f]: v } : it)) }),
    );

  const toggleCase = (s: string) =>
    update({
      case_slugs: d.case_slugs.includes(s)
        ? d.case_slugs.filter((x) => x !== s)
        : [...d.case_slugs, s],
    });

  if (!loaded) return <div className="lbc-av-loading" />;
  if (wantsEdit && !admin) return <Login onOk={() => setAdmin(true)} />;

  const extraSlides = (
    <>
      <Slide id="entregas" chap="entregas" tone="deep" className="lbc-what">
        <p className="lbc-kicker">
          <b>{t(d.entregas_kicker, "Chamada", (v) => update({ entregas_kicker: v }))}</b>
        </p>
        <h2 className="lbc-d lbc-h2">
          {t(d.entregas_title, "Título", (v) => update({ entregas_title: v }))}
        </h2>
        <ol className="lbc-av-slide-grid">
          {d.entregas.map((_, i) => (
            <li key={i}>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <b>{item("entregas", d.entregas, i, "title")}</b>
              <p>{item("entregas", d.entregas, i, "text")}</p>
            </li>
          ))}
        </ol>
      </Slide>
      <Slide id="bonus" chap="bonus" tone="lime">
        <p className="lbc-kicker">
          <b>Bônus</b>
        </p>
        <h2 className="lbc-d lbc-h2">
          {t(d.bonus_title, "Título dos bônus", (v) => update({ bonus_title: v }))}
        </h2>
        <ol className="lbc-av-slide-grid two">
          {d.bonus.map((_, i) => (
            <li key={i} className="bonus">
              <span className="n">Bônus {i + 1}</span>
              <b>{item("bonus", d.bonus, i, "title")}</b>
              <p>{item("bonus", d.bonus, i, "text")}</p>
            </li>
          ))}
        </ol>
      </Slide>
    </>
  );

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
      <div style={{ paddingTop: admin ? BAR_H : 0 }}>
        <ProposalView
          proposal={proposal}
          onEdit={onEdit}
          topOffset={admin ? BAR_H : 0}
          extraSlides={extraSlides}
          extraChapters={[
            { id: "entregas", label: "O que podemos entregar" },
            { id: "bonus", label: "Bônus" },
          ]}
          hideSchedule
          hidePrice={!d.show_price}
        />
      </div>
    </>
  );
}

function Login({ onOk }: { onOk: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (crmLogin(user, pass)) onOk();
    else setErr(true);
  };
  return (
    <form className="lbc-av-login" onSubmit={submit}>
      <b>Editar proposta</b>
      <input placeholder="Usuário do CRM" value={user} onChange={(e) => setUser(e.target.value)} />
      <input
        placeholder="Senha"
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />
      {err && <small>Usuário ou senha incorretos.</small>}
      <button type="submit">Entrar</button>
    </form>
  );
}
