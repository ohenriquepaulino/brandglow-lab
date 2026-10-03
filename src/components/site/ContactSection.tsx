import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { UTM_KEYS, captureUtmsFromUrl, type UtmData } from "@/lib/utm";
import { PrivacyButton } from "@/components/site/PrivacyDialog";
import { leadSignal, saveLeadFaturamento } from "@/lib/lead-signal";
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

const PROFISSOES = [
  "Advocacia",
  "Arquitetura",
  "Estética e beleza",
  "Odontologia",
  "Medicina",
  "Nutrição",
  "Psicologia",
  "Fisioterapia",
  "Personal trainer",
  "Contabilidade",
  "Consultoria",
  "Marketing",
  "Infoprodutos",
  "Moda",
  "Alimentação e restaurantes",
  "Imobiliário",
  "Construção civil",
  "Educação",
  "Tecnologia",
  "E-commerce",
  "Turismo",
  "Pet",
  "Eventos",
  "Outro",
];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}


function maskInstagram(value: string) {
  const cleaned = value.replace(/[^A-Za-z0-9._]/g, "").slice(0, 30);
  return cleaned ? `@${cleaned}` : "";
}

function inputClass(valid: boolean) {
  return valid ? "input-light" : "input-light input-error";
}

export const NO_REVENUE_OPTION = "Ainda não estou faturando";

const REVENUE_OPTIONS = [
  NO_REVENUE_OPTION,
  "Até R$ 6.000",
  "De R$ 6.000 a R$ 10.000",
  "De R$ 10.000 a R$ 20.000",
  "Acima de R$ 20.000",
];

// Só para quem ainda não fatura. Não fatura não quer dizer sem dinheiro: muita
// gente está lançando ou já tem outro negócio. Isso ajuda a priorizar no CRM.
const MOMENTO_OPTIONS = [
  "Ainda estou planejando o negócio",
  "Estou lançando agora",
  "Já lancei, mas ainda não vendi",
  "Já tenho outro negócio que fatura",
];
const VERBA_OPTIONS = [
  "Sim, já tenho verba separada",
  "Estou me organizando para isso",
  "Ainda não",
];

export function ContactSection({
  redirectTo,
  redirectToNoRevenue,
  hideInstagram = false,
  revenueLabel = "Faturamento mensal",
  formHint,
  ctaLabel = "Quero começar",
  showProfession = false,
  ctaNote,
}: {
  redirectTo?: string;
  redirectToNoRevenue?: string;
  hideInstagram?: boolean;
  revenueLabel?: string;
  formHint?: string;
  ctaLabel?: string;
  showProfession?: boolean;
  /** Linha curta logo abaixo do botão (ex.: "Gratuito · 25 min por vídeo"). */
  ctaNote?: string;
} = {}) {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [pais, setPais] = useState<Pais>(BRASIL);
  const [phone, setPhone] = useState(""); // só dígitos (sem o código do país)
  const [instagram, setInstagram] = useState("@");
  const [revenue, setRevenue] = useState("");
  const [profession, setProfession] = useState("");
  const [momento, setMomento] = useState("");
  const [verba, setVerba] = useState("");
  const [utms, setUtms] = useState<UtmData>({});
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    setUtms(captureUtmsFromUrl());
  }, []);

  const nameValid = useMemo(() => name.trim().length >= 2, [name]);
  const phoneError = pais.iso === "BR" ? erroBR(phone) : erroExterior(phone);
  const phoneValid = phoneError === null;
  const instagramValid = useMemo(
    () => hideInstagram || instagram.replace(/[^A-Za-z0-9._]/g, "").length >= 2,
    [hideInstagram, instagram],
  );
  const revenueValid = useMemo(() => revenue.length > 0, [revenue]);
  const professionValid = useMemo(
    () => !showProfession || profession.trim().length >= 2,
    [showProfession, profession],
  );
  const noRevenue = revenue === NO_REVENUE_OPTION;
  const momentoValid = !noRevenue || momento.length > 0;
  const verbaValid = !noRevenue || verba.length > 0;
  const formValid =
    nameValid &&
    phoneValid &&
    instagramValid &&
    revenueValid &&
    professionValid &&
    momentoValid &&
    verbaValid;


  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formValid) {
      setAttempted(true);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setAttempted(false);
    try {
      const eventId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : String(Date.now());
      const res = await fetch("/api/public/leads/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: name.trim(),
          whatsapp: telefoneParaEnvio(pais, phone),
          instagram: hideInstagram ? null : instagram,
          faturamento: revenue,
          profissao: showProfession ? profession.trim() : null,
          momento_negocio: noRevenue ? momento : null,
          verba_marca: noRevenue ? verba : null,
          pagina: window.location.pathname,

          skip_meta: noRevenue,
          utm_source: utms.utm_source ?? null,
          utm_medium: utms.utm_medium ?? null,
          utm_campaign: utms.utm_campaign ?? null,
          utm_content: utms.utm_content ?? null,
          utm_term: utms.utm_term ?? null,
          event_id: eventId,
          page_url: window.location.href,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const target = noRevenue ? (redirectToNoRevenue ?? redirectTo) : redirectTo;

      if (target) {
        // O evento Lead do navegador dispara na pagina de obrigado,
        // com o mesmo event_id enviado a Conversions API (deduplicacao).
        if (!noRevenue) saveLeadFaturamento(revenue);
        const search: Record<string, string> = { ev: eventId };
        UTM_KEYS.forEach((k) => {
          const v = utms[k];
          if (v) search[k] = v;
        });
        navigate({ to: target, search });
        return;
      }

      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
      if (!noRevenue && typeof fbq === "function") {
        fbq("track", "Lead", leadSignal(revenue) ?? {}, { eventID: eventId });
      }
      setSubmitted(true);
    } catch (err) {
      console.error("[contato] erro ao enviar", err);
      setSubmitError("Não foi possível enviar agora. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contato" className="border-t border-ink/10 bg-background">
      <div className="container-page py-32 md:py-40">
        <div className="grid gap-16 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="section-label">05 — Contato</p>
            <h2 className="mt-6 text-3xl font-bold leading-tight text-ink md:text-[40px]">
              Vamos construir sua marca?
            </h2>
            <p className="mt-6 max-w-sm text-base leading-[1.7] text-muted-foreground">
              Preencha o formulário. Nossa equipe vai analisar o seu perfil e
              entrar em contato para uma conversa de qualificação.
            </p>
          </div>

          {submitted ? (
            <div
              role="status"
              aria-live="polite"
              className="flex min-h-[280px] flex-col justify-center border border-ink/10 p-10"
            >
              <p className="text-2xl font-semibold text-ink">
                Obrigado pelas informações.
              </p>
              <p className="mt-3 text-base text-muted-foreground">
                Entraremos em contato nos próximos minutos.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
              {formHint && (
                <p className="text-sm font-medium text-ink/80">{formHint}</p>
              )}
              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  label="Nome completo"
                  error={attempted && !nameValid ? "Informe seu nome completo" : undefined}
                >
                  <input
                    required
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 100))}
                    minLength={2}
                    maxLength={100}
                    autoComplete="name"
                    className={inputClass(nameValid || !attempted)}
                    placeholder="Seu nome"
                    aria-invalid={attempted && !nameValid}
                  />
                </Field>
                <PhoneField
                  pais={pais}
                  digitos={phone}
                  erro={phoneError}
                  tentouEnviar={attempted}
                  onPais={(p) => {
                    setPais(p);
                    setPhone("");
                  }}
                  onDigitos={setPhone}
                />
                {!hideInstagram && (
                  <Field
                    label="@ do Instagram"
                    error={
                      attempted && !instagramValid
                        ? "Informe um @ válido"
                        : undefined
                    }
                  >
                    <input
                      required
                      type="text"
                      name="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(maskInstagram(e.target.value))}
                      minLength={3}
                      maxLength={31}
                      className={inputClass(instagramValid || !attempted)}
                      placeholder="@suamarca"
                      aria-invalid={attempted && !instagramValid}
                    />
                  </Field>
                )}
                <Field
                  label={revenueLabel}
                  error={attempted && !revenueValid ? "Selecione uma faixa" : undefined}
                >
                  <select
                    required
                    name="revenue"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    className={inputClass(revenueValid || !attempted)}
                    aria-invalid={attempted && !revenueValid}
                  >
                    <option value="" disabled>
                      Selecione uma faixa
                    </option>
                    {REVENUE_OPTIONS.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </Field>
                {noRevenue && (
                  <>
                    <Field
                      label="Em que momento está o seu negócio?"
                      error={attempted && !momentoValid ? "Selecione uma opção" : undefined}
                    >
                      <select
                        required
                        name="momento_negocio"
                        value={momento}
                        onChange={(e) => setMomento(e.target.value)}
                        className={inputClass(momentoValid || !attempted)}
                        aria-invalid={attempted && !momentoValid}
                      >
                        <option value="" disabled>
                          Selecione
                        </option>
                        {MOMENTO_OPTIONS.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </Field>
                    <Field
                      label="Já tem verba para investir na marca?"
                      error={attempted && !verbaValid ? "Selecione uma opção" : undefined}
                    >
                      <select
                        required
                        name="verba_marca"
                        value={verba}
                        onChange={(e) => setVerba(e.target.value)}
                        className={inputClass(verbaValid || !attempted)}
                        aria-invalid={attempted && !verbaValid}
                      >
                        <option value="" disabled>
                          Selecione
                        </option>
                        {VERBA_OPTIONS.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}
                {showProfession && (

                  <ProfessionField
                    value={profession}
                    onChange={setProfession}
                    error={
                      attempted && !professionValid
                        ? "Informe sua área de atuação"
                        : undefined
                    }
                    invalid={attempted && !professionValid}
                  />
                )}
              </div>


              {UTM_KEYS.map((k) =>
                utms[k] ? (
                  <input key={k} type="hidden" name={k} value={utms[k]} />
                ) : null,
              )}

              {attempted && !formValid && (
                <p className="text-sm font-medium text-red-600">
                  Preencha os campos destacados para continuar.
                </p>
              )}

              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex w-fit items-center justify-center rounded-full bg-gradient-to-r from-lime-brand to-[#a8f25a] px-8 py-4 text-sm font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? "Enviando..." : ctaLabel}
              </button>
              {ctaNote && <p className="-mt-3 text-xs text-ink/60">{ctaNote}</p>}
              {/* div, não p: o <dialog> da política não pode ficar dentro de <p>. */}
              <div className="text-[11px] leading-snug text-ink/50">
                Seus dados são usados só para entrarmos em contato. <PrivacyButton />
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        .input-light {
          width: 100%;
          background: transparent;
          border: 1px solid #d0cec9;
          color: #121110;
          padding: 0.85rem 1rem;
          border-radius: 10px;
          font: inherit;
          font-size: 15px;
          outline: none;
          transition: border-color .2s;
        }
        .input-light::placeholder { color: #9c9a94; }
        .input-light:focus { border-color: #121110; }
        .input-light.input-error { border-color: #D75631; background: rgba(215,86,49,0.04); }
        .input-light.input-error:focus { border-color: #D75631; }
        .field-error {
          font-size: 12px;
          line-height: 1.3;
          color: #D75631;
        }
        select.input-light {
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, #121110 50%), linear-gradient(135deg, #121110 50%, transparent 50%);
          background-position: calc(100% - 18px) 50%, calc(100% - 12px) 50%;
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          padding-right: 2.5rem;
        }
        .phone-wrap {
          display: flex;
          align-items: stretch;
          width: 100%;
          border: 1px solid #d0cec9;
          border-radius: 10px;
          transition: border-color .2s;
          background: transparent;
        }
        .phone-wrap:focus-within { border-color: #121110; }
        .phone-wrap.input-error { border-color: #D75631; background: rgba(215,86,49,0.04); }
        .phone-pais {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 10px 0 12px;
          border-right: 1px solid #d0cec9;
          font-size: 15px;
          color: #121110;
          white-space: nowrap;
        }
        .phone-pais select {
          position: absolute;
          inset: 0;
          width: 100%;
          opacity: 0;
          cursor: pointer;
          font-size: 16px;
        }
        .phone-wrap input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: none;
          background: transparent;
          color: #121110;
          padding: 0.85rem 1rem 0.85rem 0.75rem;
          font: inherit;
          font-size: 15px;
        }
        .phone-wrap input::placeholder { color: #9c9a94; }
        .phone-ok { font-size: 12px; line-height: 1.3; color: #2f7d32; }
        .phone-ok b { font-weight: 600; white-space: nowrap; }
        .phone-dica { font-size: 12px; line-height: 1.3; color: #8a8882; }
        .suggest-wrap { position: relative; }
        .suggest-list {
          position: absolute;
          z-index: 30;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          margin: 0;
          padding: 4px;
          list-style: none;
          background: #fff;
          border: 1px solid #d0cec9;
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(18,17,16,0.08);
          max-height: 220px;
          overflow-y: auto;
        }
        .suggest-item {
          padding: 0.5rem 0.65rem;
          border-radius: 7px;
          font-size: 14px;
          color: #121110;
          cursor: pointer;
        }
        .suggest-item[aria-selected="true"], .suggest-item:hover {
          background: #f4f2ef;
        }
      `}</style>

    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-normal uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

/**
 * WhatsApp com o país fixo na frente (Brasil, +55, já escolhido). A pessoa
 * digita só DDD + número. Se colar/digitar o 55 ou o 0 da operadora, sai
 * sozinho; número fora do padrão de celular não passa. Quando o número fica
 * válido, mostra por extenso para a pessoa conferir.
 */
function PhoneField({
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
  // O "55 no lugar do DDD" aparece na hora; os outros erros, ao sair do campo
  // ou ao tentar enviar (para não brigar com quem ainda está digitando).
  const erro55 = !!erro && erro.includes("55 do país");
  const mostrarErro = !!erro && (tentouEnviar || (saiu && digitos.length > 0) || erro55);

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="lbc-whatsapp"
        className="text-[11px] font-normal uppercase tracking-[0.18em] text-muted-foreground"
      >
        WhatsApp
      </label>
      <div className={`phone-wrap ${mostrarErro ? "input-error" : ""}`}>
        <div className="phone-pais">
          <span aria-hidden="true">
            {pais.bandeira} +{pais.ddi}
          </span>
          <svg aria-hidden="true" width="10" height="6" viewBox="0 0 10 6">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
          {/* select nativo por cima: no celular abre a lista do próprio sistema */}
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
          id="lbc-whatsapp"
          required
          type="tel"
          name="phone"
          inputMode="tel"
          value={br ? mascaraBR(digitos) : digitos}
          onChange={(e) => {
            setSaiu(false);
            onDigitos(br ? limparBR(e.target.value) : e.target.value.replace(/\D/g, "").slice(0, 15));
          }}
          onBlur={() => setSaiu(true)}
          maxLength={20}
          autoComplete={br ? "tel-national" : "tel"}
          placeholder={br ? "(11) 98888-7777" : "Número com código de área"}
          aria-invalid={mostrarErro}
          aria-describedby="lbc-whatsapp-ajuda"
        />
      </div>
      <span id="lbc-whatsapp-ajuda" aria-live="polite">
        {mostrarErro ? (
          <span className="field-error">{erro}</span>
        ) : !erro ? (
          <span className="phone-ok">
            ✓ Vamos te chamar no WhatsApp <b>{telefoneLegivel(pais, digitos)}</b>
          </span>
        ) : br ? (
          <span className="phone-dica">Só DDD + número. O +55 já está aí.</span>
        ) : null}
      </span>
    </div>
  );
}

function ProfessionField({
  value,
  onChange,
  error,
  invalid,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  invalid?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => {
    const q = normalize(value.trim());
    if (q.length < 2) return [];
    return PROFISSOES.filter((p) => normalize(p).includes(q))
      .filter((p) => normalize(p) !== q)
      .slice(0, 6);
  }, [value]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function select(option: string) {
    onChange(option);
    setOpen(false);
    setActive(-1);
  }

  const showList = open && options.length > 0;

  return (
    <Field label="Qual é a sua principal área de atuação?" error={error}>
      <div className="suggest-wrap" ref={wrapRef}>
        <input
          required
          type="text"
          name="profissao"
          value={value}
          onChange={(e) => {
            onChange(e.target.value.slice(0, 80));
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!showList) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => (i + 1) % options.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => (i <= 0 ? options.length - 1 : i - 1));
            } else if (e.key === "Enter" && active >= 0) {
              e.preventDefault();
              select(options[active]!);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          autoComplete="off"
          maxLength={80}
          role="combobox"
          aria-expanded={showList}
          aria-autocomplete="list"
          aria-controls="profissao-suggest"
          aria-activedescendant={
            showList && active >= 0 ? `profissao-opt-${active}` : undefined
          }
          className={inputClass(!invalid)}
          placeholder="Ex.: Odontologia, Advocacia, Moda..."
          aria-invalid={invalid}
        />
        {showList && (
          <ul className="suggest-list" id="profissao-suggest" role="listbox">
            {options.map((option, i) => (
              <li
                key={option}
                id={`profissao-opt-${i}`}
                role="option"
                aria-selected={i === active}
                className="suggest-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(option);
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  );
}
