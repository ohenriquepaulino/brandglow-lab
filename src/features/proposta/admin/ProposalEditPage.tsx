import { useCallback, useEffect, useRef, useState } from "react";
import ProposalView from "../ProposalView";
import {
  deleteProposal,
  duplicateProposal,
  getProposal,
  updateProposal,
  type ProposalPatch,
} from "../api";
import { publicProposalUrl } from "../defaults";
import type { Proposal } from "../types";

const BORDER = "#E0DED9";
const btn =
  "rounded-md border bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50";
const field =
  "rounded-md border bg-white px-2 py-1 text-xs text-neutral-900 outline-none focus:border-neutral-900";

/**
 * A própria proposta, com uma barra do CRM no topo.
 * Clique em qualquer texto ou valor com contorno tracejado para editar.
 */
export default function ProposalEditPage({
  id,
  onBack,
  onOpen,
}: {
  id: string;
  onBack: () => void;
  onOpen: (id: string) => void;
}) {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound">("loading");
  const [patch, setPatch] = useState<ProposalPatch>({});
  const [saving, setSaving] = useState(false);
  const [copiado, setCopiado] = useState(false);
  // Barra fixa (o body do site tem overflow-x: hidden, que anula o sticky); o espaçador acompanha a altura dela.
  const barRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);
  const [ajustesOpen, setAjustesOpen] = useState(false);

  const dirty = Object.keys(patch).length > 0;
  const draft: Proposal | null = proposal ? { ...proposal, ...patch } : null;

  useEffect(() => {
    let alive = true;
    getProposal(id)
      .then((p) => {
        if (!alive) return;
        if (!p) return setStatus("notfound");
        setProposal(p);
        setStatus("ok");
      })
      .catch((err) => {
        console.error(err);
        if (alive) setStatus("notfound");
      });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBarHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [status]);

  const edit = useCallback((p: Partial<Proposal>) => setPatch((prev) => ({ ...prev, ...p })), []);

  const save = useCallback(async () => {
    if (!proposal?.id || saving || !dirty) return;
    setSaving(true);
    try {
      const saved = await updateProposal(proposal.id, patch);
      setProposal(saved);
      setPatch({});
    } catch (err) {
      console.error(err);
      alert("Não foi possível salvar. Tente novamente.");
    }
    setSaving(false);
  }, [proposal, patch, saving, dirty]);

  // Ctrl/Cmd + S salva. O blur antes garante que o texto em edição entre no salvamento.
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        (document.activeElement as HTMLElement | null)?.blur();
        setTimeout(() => void saveRef.current(), 0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function leave(to: () => void) {
    if (dirty && !confirm("Existem alterações não salvas. Sair mesmo assim?")) return;
    to();
  }

  async function copiar() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(publicProposalUrl(draft.slug));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      prompt("Copie o link:", publicProposalUrl(draft.slug));
    }
  }

  async function duplicar() {
    if (!proposal?.id) return;
    if (dirty && !confirm("Existem alterações não salvas. Duplicar a versão salva mesmo assim?"))
      return;
    try {
      const copy = await duplicateProposal(proposal.id);
      setPatch({});
      if (copy.id) onOpen(copy.id);
    } catch (err) {
      console.error(err);
      alert("Não foi possível duplicar a proposta.");
    }
  }

  async function excluir() {
    if (!proposal?.id) return;
    if (!confirm("Excluir esta proposta de vez? O link deixa de funcionar.")) return;
    try {
      await deleteProposal(proposal.id);
      setPatch({});
      onBack();
    } catch (err) {
      console.error(err);
      alert("Não foi possível excluir a proposta.");
    }
  }

  if (status !== "ok" || !draft) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ background: "#F4F2EF" }}
      >
        <p className="text-sm text-neutral-600">
          {status === "loading" ? "Carregando a proposta..." : "Proposta não encontrada."}
        </p>
        {status === "notfound" && (
          <button onClick={onBack} className={btn} style={{ borderColor: BORDER }}>
            Voltar para as propostas
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        ref={barRef}
        className="fixed inset-x-0 top-0 z-[60] border-b bg-white px-4 py-2 print:hidden"
        style={{ borderColor: BORDER, fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => leave(onBack)} className={btn} style={{ borderColor: BORDER }}>
            ← Propostas
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-900">
            {draft.client_name || "Sem nome"}
            <span className="ml-2 text-xs font-normal text-neutral-500">
              {saving ? "Salvando..." : dirty ? "Alterações não salvas" : "Tudo salvo"}
            </span>
          </p>
          <button
            onClick={() => setAjustesOpen((v) => !v)}
            aria-expanded={ajustesOpen}
            className={`${btn} md:hidden`}
            style={{ borderColor: BORDER }}
          >
            {ajustesOpen ? "Fechar ajustes" : "Ajustes"}
          </button>
          <button onClick={() => void copiar()} className={btn} style={{ borderColor: BORDER }}>
            {copiado ? "Link copiado" : "Copiar link"}
          </button>
          <a
            href={`/p/${draft.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={btn}
            style={{ borderColor: BORDER }}
          >
            Ver como cliente
          </a>
          <button onClick={() => void duplicar()} className={btn} style={{ borderColor: BORDER }}>
            Duplicar
          </button>
          <button
            onClick={() => void excluir()}
            className={`${btn} text-red-600`}
            style={{ borderColor: BORDER }}
          >
            Excluir
          </button>
          <button
            onClick={() => void save()}
            disabled={!dirty || saving}
            className="rounded-md bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-40"
          >
            Salvar
          </button>
        </div>

        <div
          className={`${ajustesOpen ? "flex" : "hidden"} mt-2 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-600 md:flex`}
        >
          <label className="flex items-center gap-1.5">
            Parcelas
            <input
              type="number"
              min={1}
              max={12}
              value={draft.installments}
              onChange={(e) => {
                const n = Math.round(Number(e.target.value));
                if (n >= 1 && n <= 12) edit({ installments: n });
              }}
              className={`${field} w-14`}
              style={{ borderColor: BORDER }}
            />
          </label>
          <label className="flex items-center gap-1.5">
            Desconto à vista (%)
            <input
              type="number"
              min={0}
              max={100}
              step="0.5"
              value={draft.cash_discount_pct}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isFinite(n) && n >= 0 && n <= 100) edit({ cash_discount_pct: n });
              }}
              className={`${field} w-16`}
              style={{ borderColor: BORDER }}
            />
          </label>
          <label className="flex items-center gap-1.5">
            Validade
            <input
              type="date"
              value={draft.valid_until ?? ""}
              onChange={(e) => edit({ valid_until: e.target.value || null })}
              className={field}
              style={{ borderColor: BORDER }}
            />
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={draft.show_diagnosis}
              onChange={(e) => edit({ show_diagnosis: e.target.checked })}
            />
            Mostrar diagnóstico
          </label>
          <span className="hidden text-neutral-400 md:inline">
            Clique nos textos e valores com contorno para editar.
          </span>
        </div>
      </div>

      <div className="print:hidden" style={{ height: barHeight }} aria-hidden />
      <ProposalView proposal={draft} onEdit={edit} topOffset={barHeight} />
    </div>
  );
}
