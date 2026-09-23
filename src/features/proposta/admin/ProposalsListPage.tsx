import { useEffect, useState } from "react";
import { createProposal, listProposals } from "../api";
import { publicProposalUrl } from "../defaults";
import type { Proposal } from "../types";

const BORDER = "#E0DED9";

/** Lista simples de propostas, dentro do layout do CRM. */
export default function ProposalsListPage({ onOpen }: { onOpen: (id: string) => void }) {
  const [rows, setRows] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [criando, setCriando] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      setRows(await listProposals());
    } catch (err) {
      console.error(err);
      alert("Não foi possível carregar as propostas.");
    }
    setLoading(false);
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (criando) return;
    setCriando(true);
    try {
      const p = await createProposal(nome.trim());
      if (p.id) onOpen(p.id);
    } catch (err) {
      console.error(err);
      alert("Não foi possível criar a proposta.");
      setCriando(false);
    }
  }

  async function copiar(p: Proposal) {
    try {
      await navigator.clipboard.writeText(publicProposalUrl(p.slug));
      setCopiado(p.slug);
      setTimeout(() => setCopiado((s) => (s === p.slug ? null : s)), 2000);
    } catch {
      prompt("Copie o link:", publicProposalUrl(p.slug));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={criar}
        className="flex flex-wrap items-center gap-2 rounded-md border bg-white p-3"
        style={{ borderColor: BORDER }}
      >
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={120}
          placeholder="Nome do cliente"
          className="min-w-0 flex-1 rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
          style={{ borderColor: BORDER }}
        />
        <button
          type="submit"
          disabled={criando}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {criando ? "Criando..." : "Nova proposta"}
        </button>
      </form>

      <div className="overflow-hidden rounded-md border bg-white" style={{ borderColor: BORDER }}>
        {loading ? (
          <div className="flex flex-col gap-2 p-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-neutral-100" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-neutral-500">
            Nenhuma proposta ainda. Digite o nome do cliente acima e clique em Nova proposta.
          </p>
        ) : (
          <ul>
            {rows.map((p, i) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3"
                style={i ? { borderTop: `1px solid ${BORDER}` } : undefined}
              >
                <button onClick={() => p.id && onOpen(p.id)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-neutral-900">
                    {p.client_name || "Sem nome"}
                  </p>
                  <p className="truncate text-xs text-neutral-500">
                    /p/{p.slug}
                    {p.updated_at &&
                      ` · alterada em ${new Date(p.updated_at).toLocaleDateString("pt-BR")}`}
                  </p>
                </button>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => void copiar(p)}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                    style={{ borderColor: BORDER }}
                  >
                    {copiado === p.slug ? "Link copiado" : "Copiar link"}
                  </button>
                  <button
                    onClick={() => p.id && onOpen(p.id)}
                    className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                  >
                    Editar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
