import { useEffect, useRef, useState } from "react";
import { CASES } from "../cases";

const BORDER = "#E0DED9";
const ALL = CASES.map((c) => c.slug);

/**
 * Escolhe quais cases entram na proposta e em que ordem.
 * `value` nulo = todos, na ordem padrão. Sempre fica pelo menos um marcado.
 */
export default function CasePicker({
  value,
  onChange,
  buttonClassName,
}: {
  value: string[] | null | undefined;
  onChange: (slugs: string[] | null) => void;
  buttonClassName: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = (value?.length ? value : ALL).filter((s) => ALL.includes(s));
  const others = ALL.filter((s) => !selected.includes(s));
  const isDefault = !value?.length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const set = (slugs: string[]) =>
    onChange(slugs.length === ALL.length && slugs.every((s, i) => s === ALL[i]) ? null : slugs);

  function move(i: number, dir: -1 | 1) {
    const next = [...selected];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set(next);
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={buttonClassName}
        style={{ borderColor: BORDER }}
      >
        Cases ({selected.length} de {ALL.length})
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-[70] mt-1 w-[340px] max-w-[calc(100vw-32px)] rounded-lg border bg-white p-3 shadow-lg"
          style={{ borderColor: BORDER }}
        >
          <p className="mb-2 text-[11px] text-neutral-500">
            Marque os cases que fazem sentido para este cliente. O primeiro da lista abre a seção.
          </p>

          <ul className="space-y-1">
            {selected.map((slug, i) => {
              const c = CASES.find((x) => x.slug === slug)!;
              return (
                <li
                  key={slug}
                  className="flex items-center gap-2 rounded-md bg-neutral-50 px-2 py-1.5"
                >
                  <input
                    type="checkbox"
                    checked
                    disabled={selected.length === 1}
                    onChange={() => set(selected.filter((s) => s !== slug))}
                    aria-label={`Tirar ${c.name}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-neutral-900">
                      {c.name}
                    </span>
                    <span className="block truncate text-[11px] text-neutral-500">{c.segment}</span>
                  </span>
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="px-1 text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-25"
                    aria-label={`Subir ${c.name}`}
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === selected.length - 1}
                    className="px-1 text-xs text-neutral-500 hover:text-neutral-900 disabled:opacity-25"
                    aria-label={`Descer ${c.name}`}
                  >
                    ↓
                  </button>
                </li>
              );
            })}
            {others.map((slug) => {
              const c = CASES.find((x) => x.slug === slug)!;
              return (
                <li key={slug} className="flex items-center gap-2 px-2 py-1.5">
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => set([...selected, slug])}
                    aria-label={`Incluir ${c.name}`}
                  />
                  <span className="min-w-0 flex-1 opacity-60">
                    <span className="block truncate text-xs font-medium text-neutral-900">
                      {c.name}
                    </span>
                    <span className="block truncate text-[11px] text-neutral-500">{c.segment}</span>
                  </span>
                </li>
              );
            })}
          </ul>

          {!isDefault && (
            <button
              onClick={() => onChange(null)}
              className="mt-2 text-[11px] text-neutral-500 underline hover:text-neutral-900"
            >
              Voltar para todos, na ordem padrão
            </button>
          )}
        </div>
      )}
    </div>
  );
}
