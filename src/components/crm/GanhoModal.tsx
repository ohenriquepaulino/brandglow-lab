import { useEffect, useRef, useState } from "react";
import { formatBRL, lerValorBRL, type Lead } from "@/lib/crm-auth";

/** Pede o valor fechado antes de mover o lead para Ganho. */
export function GanhoModal({
  lead,
  onConfirm,
  onCancel,
}: {
  lead: Lead;
  onConfirm: (valor: number) => Promise<void> | void;
  onCancel: () => void;
}) {
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const valor = lerValorBRL(texto);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  async function confirmar(e: React.FormEvent) {
    e.preventDefault();
    if (valor === null || salvando) return;
    setSalvando(true);
    try {
      await onConfirm(valor);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <form
        onSubmit={confirmar}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-[0_24px_60px_-12px_rgba(18,17,16,0.45)]"
      >
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-lg"
          style={{ background: "#CFFF87" }}
          aria-hidden="true"
        >
          🏆
        </span>
        <h2 className="mt-4 text-lg font-semibold text-neutral-900">Negócio fechado!</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Qual foi o valor fechado com <strong className="text-neutral-800">{lead.nome}</strong>?
        </p>

        <label className="mt-5 block">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Valor fechado
          </span>
          <div
            className="mt-1 flex items-center rounded-lg border bg-white focus-within:border-neutral-900"
            style={{ borderColor: "#E0DED9" }}
          >
            <span className="pl-3 text-sm font-medium text-neutral-500">R$</span>
            <input
              ref={inputRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              inputMode="decimal"
              placeholder="5.000"
              className="w-full bg-transparent px-2 py-2.5 text-base font-semibold text-neutral-900 outline-none"
            />
          </div>
          <span className="mt-1 block h-4 text-[11px] text-neutral-500">
            {valor !== null && valor > 0 ? formatBRL(valor, valor % 1 !== 0) : ""}
          </span>
        </label>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            style={{ borderColor: "#E0DED9" }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={valor === null || salvando}
            className="flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: "#121110" }}
          >
            {salvando ? "Salvando..." : "Mover para Ganho"}
          </button>
        </div>
      </form>
    </div>
  );
}
