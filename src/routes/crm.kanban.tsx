import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  apiDeleteLead,
  apiListLeads,
  apiUpdateColumn,
} from "@/lib/crm-api";
import {
  COLUNAS,
  COLUNA_PERDIDO,
  crmLogout,
  isCrmAuthed,
  normalizeColuna,
  type ColunaId,
  type Lead,
} from "@/lib/crm-auth";
import { LeadCard } from "@/components/crm/LeadCard";
import { LeadPanel } from "@/components/crm/LeadPanel";

export const Route = createFileRoute("/crm/kanban")({
  ssr: false,
  component: KanbanPage,
});

function KanbanPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState<Lead | null>(null);

  const [fFat, setFFat] = useState("");
  const [fUtm, setFUtm] = useState("");
  const [search, setSearch] = useState("");
  const [showPerdidos, setShowPerdidos] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  useEffect(() => {
    if (!isCrmAuthed()) {
      navigate({ to: "/crm" });
      return;
    }
    loadLeads();
    const timer = setInterval(() => {
      void loadLeads(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [navigate]);

  async function loadLeads(silent = false) {
    if (!silent) setLoading(true);
    try {
      const data = await apiListLeads();
      setLeads(data.map((l) => ({ ...l, coluna: normalizeColuna(l.coluna) })));
    } catch (err) {
      console.error(err);
    }
    if (!silent) setLoading(false);
  }

  function handleLogout() {
    crmLogout();
    navigate({ to: "/crm" });
  }

  async function handleDelete(lead: Lead) {
    const prev = leads;
    setLeads((p) => p.filter((l) => l.id !== lead.id));
    if (opened?.id === lead.id) setOpened(null);
    try {
      await apiDeleteLead(lead.id);
    } catch (err) {
      console.error(err);
      setLeads(prev);
      alert("Não foi possível excluir o lead. Tente novamente.");
    }
  }

  const faturamentos = useMemo(
    () => Array.from(new Set(leads.map((l) => l.faturamento))).sort(),
    [leads],
  );
  const utmSources = useMemo(
    () =>
      Array.from(
        new Set(leads.map((l) => l.utm_source).filter(Boolean) as string[]),
      ).sort(),
    [leads],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (fFat && l.faturamento !== fFat) return false;
      if (fUtm && l.utm_source !== fUtm) return false;
      if (q) {
        const inName = l.nome.toLowerCase().includes(q);
        const inIg = (l.instagram ?? "").toLowerCase().includes(q);
        if (!inName && !inIg) return false;
      }
      return true;
    });
  }, [leads, fFat, fUtm, search]);

  async function moveLead(leadId: string, dest: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.coluna === dest) return;

    const origem = lead.coluna;
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, coluna: dest } : l)),
    );
    if (opened?.id === leadId) {
      setOpened((p) => (p ? { ...p, coluna: dest } : p));
    }

    try {
      await apiUpdateColumn(leadId, dest, origem);
    } catch (err) {
      console.error(err);
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, coluna: origem } : l)),
      );
    }
  }

  async function onDragEnd(e: DragEndEvent) {
    const dest = e.over?.id ? String(e.over.id) : null;
    if (!dest) return;
    await moveLead(String(e.active.id), dest);
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "#F4F2EF", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <header
        className="flex items-center justify-between border-b bg-white px-6 py-3"
        style={{ borderColor: "#E0DED9" }}
      >
        <p className="text-sm font-semibold text-neutral-900">Legacy BrandCo.</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadLeads()}
            className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            style={{ borderColor: "#E0DED9" }}
          >
            Atualizar
          </button>
          <button
            onClick={handleLogout}
            className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            style={{ borderColor: "#E0DED9" }}
          >
            Sair
          </button>
        </div>
      </header>


      <div className="px-6 pt-5">
        <div className="flex flex-wrap items-end gap-3">
          <Filter label="Faturamento">
            <select
              value={fFat}
              onChange={(e) => setFFat(e.target.value)}
              className="rounded-md border bg-white px-3 py-2 text-sm outline-none"
              style={{ borderColor: "#E0DED9" }}
            >
              <option value="">Todos</option>
              {faturamentos.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Filter>
          <Filter label="UTM Source">
            <select
              value={fUtm}
              onChange={(e) => setFUtm(e.target.value)}
              className="rounded-md border bg-white px-3 py-2 text-sm outline-none"
              style={{ borderColor: "#E0DED9" }}
            >
              <option value="">Todos</option>
              {utmSources.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </Filter>
          <Filter label="Buscar">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome ou @instagram"
              className="w-64 rounded-md border bg-white px-3 py-2 text-sm outline-none"
              style={{ borderColor: "#E0DED9" }}
            />
          </Filter>
          <button
            onClick={() => { setFFat(""); setFUtm(""); setSearch(""); }}
            className="rounded-md border px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            style={{ borderColor: "#E0DED9" }}
          >
            Limpar filtros
          </button>
          <div className="ml-auto text-xs text-neutral-500">
            {filtered.length} de {leads.length} leads
          </div>
        </div>
      </div>

      <main className="px-6 py-6">
        {loading ? (
          <p className="text-sm text-neutral-500">Carregando leads...</p>
        ) : (
          <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-6">
              {COLUNAS.map((col) => {
                const items = filtered.filter((l) => l.coluna === col.id);
                return (
                  <Column
                    key={col.id}
                    id={col.id}
                    label={col.label}
                    accent={col.accent}
                    count={items.length}
                  >
                    {items.map((l) => (
                      <LeadCard key={l.id} lead={l} onOpen={setOpened} onDelete={handleDelete} />
                    ))}
                  </Column>
                );
              })}
            </div>
          </DndContext>
        )}
      </main>

      {opened && (
        <LeadPanel
          lead={opened}
          onClose={() => setOpened(null)}
          onUpdated={(updated) => {
            setLeads((prev) =>
              prev.map((l) => (l.id === updated.id ? updated : l)),
            );
            setOpened(updated);
          }}
        />
      )}
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function Column({
  id,
  label,
  accent,
  count,
  children,
}: {
  id: ColunaId;
  label: string;
  accent: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div
        className="rounded-t-md bg-white px-3 pt-2.5 pb-2"
        style={{ borderTop: `3px solid ${accent}` }}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-800">
            {label}
          </p>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700">
            {count}
          </span>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className="flex min-h-[60vh] flex-col gap-2 rounded-b-md border border-t-0 p-2 transition-colors"
        style={{
          borderColor: "#E0DED9",
          background: isOver ? "#ECE9E4" : "#FAFAF8",
        }}
      >
        {children}
      </div>
    </div>
  );
}
