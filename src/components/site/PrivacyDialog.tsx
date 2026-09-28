import { useRef } from "react";
import { PRIVACIDADE_ATUALIZADA, PRIVACIDADE_SECOES } from "@/lib/privacidade";

/**
 * "Política de privacidade" como botão que abre a política numa janela na
 * própria página, sem link de saída (landing pages de anúncio).
 */
export function PrivacyButton({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className={`privacy-btn ${className}`}
      >
        Política de privacidade
      </button>
      <dialog
        ref={ref}
        className="privacy-dialog"
        aria-label="Política de privacidade"
        onClick={(e) => {
          // Clique fora do conteúdo (no fundo escurecido) fecha.
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="privacy-body">
          <div className="privacy-head">
            <p className="privacy-title">Política de privacidade</p>
            <button type="button" onClick={() => ref.current?.close()} aria-label="Fechar">
              ×
            </button>
          </div>
          <p className="privacy-date">{PRIVACIDADE_ATUALIZADA}</p>
          {PRIVACIDADE_SECOES.map((s) => (
            <section key={s.titulo}>
              <h3>{s.titulo}</h3>
              {s.texto.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </section>
          ))}
        </div>
      </dialog>
      <style>{`
        .privacy-btn { background: none; border: 0; padding: 0; font: inherit; color: inherit; text-decoration: underline; cursor: pointer; }
        .privacy-dialog {
          width: min(560px, calc(100vw - 32px)); max-height: calc(100dvh - 48px);
          padding: 0; border: 0; border-radius: 16px; color: #121110; background: #fff;
          box-shadow: 0 24px 64px rgba(0,0,0,0.25);
        }
        .privacy-dialog::backdrop { background: rgba(17,17,17,0.55); }
        .privacy-body { padding: 24px; text-align: left; font-family: Inter, system-ui, sans-serif; }
        .privacy-head { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .privacy-title { font-size: 20px; font-weight: 600; margin: 0; }
        .privacy-head button { background: none; border: 0; font-size: 28px; line-height: 1; cursor: pointer; padding: 4px 8px; color: #121110; }
        .privacy-date { font-size: 13px; color: #6e6e6e; margin: 4px 0 8px; }
        .privacy-body h3 { font-size: 15px; font-weight: 600; margin: 18px 0 6px; }
        .privacy-body section p { font-size: 14px; line-height: 1.55; color: #3f3f3f; margin: 0 0 8px; }
      `}</style>
    </>
  );
}
