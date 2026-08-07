import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { UTM_KEYS, captureUtmsFromUrl, type UtmData } from "@/lib/utm";

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function maskInstagram(value: string) {
  const cleaned = value.replace(/[^A-Za-z0-9._]/g, "").slice(0, 30);
  return cleaned ? `@${cleaned}` : "";
}

function inputClass(valid: boolean) {
  return valid ? "input-light" : "input-light input-error";
}

export const NO_REVENUE_OPTION = "Ainda não estou faturando";

export function ContactSection({
  redirectTo,
  redirectToNoRevenue,
  hideInstagram = false,
  revenueLabel = "Faturamento mensal",
  formHint,
  ctaLabel = "Quero começar",
}: {
  redirectTo?: string;
  redirectToNoRevenue?: string;
  hideInstagram?: boolean;
  revenueLabel?: string;
  formHint?: string;
  ctaLabel?: string;
} = {}) {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("@");
  const [revenue, setRevenue] = useState("");
  const [utms, setUtms] = useState<UtmData>({});
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    setUtms(captureUtmsFromUrl());
  }, []);

  const nameValid = useMemo(() => name.trim().length >= 2, [name]);
  const phoneValid = useMemo(
    () => phone.replace(/\D/g, "").length >= 10,
    [phone],
  );
  const instagramValid = useMemo(
    () => hideInstagram || instagram.replace(/[^A-Za-z0-9._]/g, "").length >= 2,
    [hideInstagram, instagram],
  );
  const revenueValid = useMemo(() => revenue.length > 0, [revenue]);
  const formValid = useMemo(
    () => nameValid && phoneValid && instagramValid && revenueValid,
    [nameValid, phoneValid, instagramValid, revenueValid],
  );

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
          whatsapp: phone,
          instagram: hideInstagram ? null : instagram,
          faturamento: revenue,
          skip_meta: revenue === NO_REVENUE_OPTION,
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

      const noRevenue = revenue === NO_REVENUE_OPTION;
      const target = noRevenue ? (redirectToNoRevenue ?? redirectTo) : redirectTo;

      if (target) {
        // O evento Lead do navegador dispara na pagina de obrigado,
        // com o mesmo event_id enviado a Conversions API (deduplicacao).
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
        fbq("track", "Lead", {}, { eventID: eventId });
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
                <Field
                  label="WhatsApp"
                  error={attempted && !phoneValid ? "Informe um WhatsApp válido" : undefined}
                >
                  <input
                    required
                    type="tel"
                    name="phone"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(maskPhone(e.target.value))}
                    maxLength={16}
                    pattern="\(\d{2}\) \d{4,5}-\d{4}"
                    autoComplete="tel-national"
                    className={inputClass(phoneValid || !attempted)}
                    placeholder="(00) 00000-0000"
                    aria-invalid={attempted && !phoneValid}
                  />
                </Field>
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
                    <option>{NO_REVENUE_OPTION}</option>
                    <option>De R$ 6.000 a R$ 10.000</option>
                    <option>De R$ 10.000 a R$ 20.000</option>
                    <option>Acima de R$ 20.000</option>
                  </select>
                </Field>
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
                {submitting ? "Enviando..." : "Quero começar"}
              </button>
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
