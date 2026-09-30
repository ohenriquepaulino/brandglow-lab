import { useEffect, useMemo, useRef, useState } from "react";
import { Search, UserPlus, X } from "lucide-react";
import { COLUNAS, type Lead } from "@/lib/crm-auth";

const BORDER = "#E0DED9";

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

export const iniciais = (nome: string) =>
  nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

const rotuloColuna = (id: string) => COLUNAS.find((c) => c.id === id)?.label ?? id;

export type Escolha = { nome: string; lead: Lead | null };

/**
 * Campo "Para quem?": busca entre os leads do CRM (nome ou telefone) ou aceita
 * um nome livre. Setas + Enter escolhem; Esc fecha. A lista abre por cima do
 * resto da tela (não é cortada pelo card).
 */
export function LeadPicker({
  leads,
  valor,
  onChange,
  onEnter,
}: {
  leads: Lead[];
  valor: Escolha;
  onChange: (e: Escolha) => void;
  /** Enter sem lista aberta: quem usa decide (ex.: gerar o link). */
  onEnter?: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const caixaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  const q = normalizar(valor.nome);
  const qDigitos = valor.nome.replace(/\D/g, "");
  const sugestoes = useMemo(() => {
    if (valor.lead) return [];
    // Sem nada digitado: os mais recentes.
    if (!q) return leads.slice(0, 5);
    return leads
      .filter(
        (l) =>
          normalizar(l.nome).includes(q) ||
          (qDigitos.length >= 3 && l.whatsapp.replace(/\D/g, "").includes(qDigitos)),
      )
      .slice(0, 8);
  }, [leads, q, qDigitos, valor.lead]);

  // Última opção: usar o nome digitado sem vincular a um lead.
  const temLivre = q.length > 0 && !valor.lead;
  const total = sugestoes.length + (temLivre ? 1 : 0);

  useEffect(() => setAtivo(0), [q]);

  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      if (!caixaRef.current?.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [aberto]);

  useEffect(() => {
    listaRef.current?.querySelector<HTMLElement>(`[data-i="${ativo}"]`)?.scrollIntoView({ block: "nearest" });
  }, [ativo]);

  function escolher(i: number) {
    if (i < sugestoes.length) {
      const l = sugestoes[i];
      onChange({ nome: l.nome, lead: l });
    } else {
      onChange({ nome: valor.nome.trim(), lead: null });
    }
    setAberto(false);
  }

  function teclado(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAberto(true);
      setAtivo((a) => (total ? (a + 1) % total : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtivo((a) => (total ? (a - 1 + total) % total : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (aberto && total > 0) escolher(ativo);
      else onEnter?.();
    } else if (e.key === "Escape") {
      setAberto(false);
    }
  }

  if (valor.lead) {
    const l = valor.lead;
    return (
      <div
        className="flex min-w-0 items-center gap-3 rounded-lg border bg-white px-3 py-2"
        style={{ borderColor: BORDER }}
      >
        <Avatar nome={l.nome} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-neutral-900">{l.nome}</p>
          <p className="truncate text-xs text-neutral-500">
            {l.whatsapp} · {rotuloColuna(l.coluna)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange({ nome: "", lead: null });
            window.setTimeout(() => {
              inputRef.current?.focus();
              setAberto(true);
            }, 0);
          }}
          aria-label="Trocar pessoa"
          title="Trocar"
          className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={caixaRef} className="relative min-w-0">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
      <input
        ref={inputRef}
        value={valor.nome}
        onChange={(e) => {
          onChange({ nome: e.target.value, lead: null });
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={teclado}
        maxLength={120}
        role="combobox"
        aria-expanded={aberto}
        aria-autocomplete="list"
        placeholder="Para quem? Busque um lead ou digite um nome"
        className="w-full rounded-lg border bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-neutral-900"
        style={{ borderColor: BORDER }}
      />

      {aberto && total > 0 && (
        <ul
          ref={listaRef}
          role="listbox"
          className="absolute inset-x-0 top-full z-40 mt-1.5 max-h-80 overflow-y-auto rounded-lg border bg-white py-1 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.25)]"
          style={{ borderColor: BORDER }}
        >
          {sugestoes.length > 0 && (
            <li className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {q ? "Leads do CRM" : "Leads recentes"}
            </li>
          )}
          {sugestoes.map((l, i) => (
            <li key={l.id} data-i={i}>
              <button
                type="button"
                role="option"
                aria-selected={ativo === i}
                onPointerDown={(e) => e.preventDefault()}
                onMouseEnter={() => setAtivo(i)}
                onClick={() => escolher(i)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left"
                style={{ background: ativo === i ? "#F4F2EF" : undefined }}
              >
                <Avatar nome={l.nome} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-neutral-900">
                    <Destaque texto={l.nome} busca={q} />
                  </span>
                  <span className="block truncate text-xs text-neutral-500">
                    {l.whatsapp}
                    {l.profissao ? ` · ${l.profissao}` : ""}
                  </span>
                </span>
                <span className="hidden shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 sm:inline">
                  {rotuloColuna(l.coluna)}
                </span>
              </button>
            </li>
          ))}
          {temLivre && (
            <li data-i={sugestoes.length} className={sugestoes.length ? "mt-1 border-t pt-1" : ""} style={{ borderColor: BORDER }}>
              <button
                type="button"
                role="option"
                aria-selected={ativo === sugestoes.length}
                onPointerDown={(e) => e.preventDefault()}
                onMouseEnter={() => setAtivo(sugestoes.length)}
                onClick={() => escolher(sugestoes.length)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm"
                style={{ background: ativo === sugestoes.length ? "#F4F2EF" : undefined }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-neutral-300 text-neutral-500">
                  <UserPlus className="h-4 w-4" />
                </span>
                <span className="min-w-0 truncate text-neutral-700">
                  Usar “<b className="font-semibold text-neutral-900">{valor.nome.trim()}</b>” sem vincular a um lead
                </span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export function Avatar({ nome, cor }: { nome: string; cor?: string }) {
  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
      style={{ background: cor ?? "#ECE9E4", color: "#3F3A36" }}
    >
      {iniciais(nome)}
    </span>
  );
}

function Destaque({ texto, busca }: { texto: string; busca: string }) {
  if (!busca) return <>{texto}</>;
  const i = normalizar(texto).indexOf(busca);
  if (i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <b className="font-semibold">{texto.slice(i, i + busca.length)}</b>
      {texto.slice(i + busca.length)}
    </>
  );
}
