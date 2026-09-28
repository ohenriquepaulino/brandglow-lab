import { useEffect, useRef } from "react";

/**
 * Texto que se edita com um clique (modo de edição do CRM).
 * Não controlado enquanto está em foco; Enter ou sair do campo confirma, Esc desfaz.
 */
export default function EditText({
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
