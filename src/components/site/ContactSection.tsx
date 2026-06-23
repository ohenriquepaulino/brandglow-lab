import { useState } from "react";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contato" className="bg-ink text-cream">
      <div className="container-page grid gap-12 py-24 md:grid-cols-2 md:py-32">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-lime-brand">
            05 — Contato
          </p>
          <h2 className="mt-4 text-4xl leading-[0.95] md:text-6xl">
            Vamos construir <br />
            <span className="text-lime-brand">sua marca?</span>
          </h2>
          <p className="mt-6 max-w-md text-base text-cream/70">
            Preencha o formulário. Nossa equipe vai analisar o seu perfil e
            entrar em contato para uma conversa de qualificação.
          </p>
        </div>

        {submitted ? (
          <div className="flex min-h-[320px] flex-col justify-center rounded-2xl border border-cream/15 bg-cream/5 p-8">
            <p className="text-2xl font-extrabold text-lime-brand">
              Recebemos seu contato.
            </p>
            <p className="mt-3 text-cream/70">
              Nossa equipe entrará em contato em até 2 dias úteis.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <Field label="Nome completo">
              <input
                required
                type="text"
                name="name"
                className="input-dark"
                placeholder="Seu nome"
              />
            </Field>
            <Field label="WhatsApp">
              <input
                required
                type="tel"
                name="phone"
                className="input-dark"
                placeholder="(00) 00000-0000"
              />
            </Field>
            <Field label="@ do Instagram">
              <input
                required
                type="text"
                name="instagram"
                className="input-dark"
                placeholder="@suamarca"
              />
            </Field>
            <Field label="Faturamento mensal">
              <select required name="revenue" className="input-dark" defaultValue="">
                <option value="" disabled>
                  Selecione uma faixa
                </option>
                <option>De R$ 6.000 a R$ 10.000</option>
                <option>De R$ 10.000 a R$ 20.000</option>
                <option>Acima de R$ 20.000</option>
              </select>
            </Field>

            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-orange-brand px-8 py-4 text-base font-semibold text-white transition-transform hover:scale-[1.01]"
            >
              Quero começar
            </button>
            <p className="text-sm text-cream/50">
              Após o envio, nossa equipe entrará em contato em até 2 dias úteis.
            </p>
          </form>
        )}
      </div>

      <style>{`
        .input-dark {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(244, 242, 239, 0.18);
          color: #f4f2ef;
          padding: 0.9rem 1rem;
          border-radius: 0.6rem;
          font: inherit;
          outline: none;
          transition: border-color .2s;
        }
        .input-dark::placeholder { color: rgba(244,242,239,0.4); }
        .input-dark:focus { border-color: #cfff87; }
        select.input-dark { appearance: none; background-image: linear-gradient(45deg, transparent 50%, #cfff87 50%), linear-gradient(135deg, #cfff87 50%, transparent 50%); background-position: calc(100% - 18px) 50%, calc(100% - 12px) 50%; background-size: 6px 6px, 6px 6px; background-repeat: no-repeat; padding-right: 2.5rem; }
        select.input-dark option { background: #121110; color: #f4f2ef; }
      `}</style>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-cream/60">
        {label}
      </span>
      {children}
    </label>
  );
}
