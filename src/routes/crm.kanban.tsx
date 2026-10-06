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
import { apiDeleteLead, apiListLeadsComFollowup, apiUpdateColumn } from "@/lib/crm-api";
import { apiFollowupLer, type FollowupLeitura } from "@/lib/whatsapp-api";
import { COLUNAS_FOLLOWUP, FOLLOWUP_INFO, haQuanto, type FollowupTipo } from "@/lib/followup";
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
import { CrmSidebar } from "@/components/crm/Sidebar";

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
  const [soFollowup, setSoFollowup] = useState(false);

  const [followupLidoEm, setFollowupLidoEm] = useState<string | null>(null);
  const [lendo, setLendo] = useState(false);
  const [leitura, setLeitura] = useState<FollowupLeitura | null>(null);
  const [erroLeitura, setErroLeitura] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

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
      const { leads: data, followupLidoEm: lidoEm } = await apiListLeadsComFollowup();
      setLeads(data.map((l) => ({ ...l, coluna: normalizeColuna(l.coluna) })));
      setFollowupLidoEm(lidoEm);
    } catch (err) {
      console.error(err);
    }
    if (!silent) setLoading(false);
  }

  async function verFollowups() {
    setLendo(true);
    setErroLeitura(null);
    try {
      setLeitura(await apiFollowupLer());
      await loadLeads(true);
      setSoFollowup(true);
    } catch (err) {
      setErroLeitura(err instanceof Error ? err.message : String(err));
    }
    setLendo(false);
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
    () => Array.from(new Set(leads.map((l) => l.utm_source).filter(Boolean) as string[])).sort(),
    [leads],
  );

  const comFollowup = useMemo(() => leads.filter(temFollowup), [leads]);
  const contagem = useMemo(() => {
    const c: Record<FollowupTipo, number> = { responder: 0, cobrar: 0, puxar: 0 };
    for (const l of comFollowup) c[l.followup!.tipo]++;
    return c;
  }, [comFollowup]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (soFollowup && !temFollowup(l)) return false;
      if (fFat && l.faturamento !== fFat) return false;
      if (fUtm && l.utm_source !== fUtm) return false;
      if (q) {
        const inName = l.nome.toLowerCase().includes(q);
        const inIg = (l.instagram ?? "").toLowerCase().includes(q);
        if (!inName && !inIg) return false;
      }
      return true;
    });
  }, [leads, fFat, fUtm, search, soFollowup]);

  async function moveLead(leadId: string, dest: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.coluna === dest) return;

    const origem = lead.coluna;
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, coluna: dest } : l)));
    if (opened?.id === leadId) {
      setOpened((p) => (p ? { ...p, coluna: dest } : p));
    }

    try {
      await apiUpdateColumn(leadId, dest, origem);
    } catch (err) {
      console.error(err);
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, coluna: origem } : l)));
    }
  }

  async function onDragEnd(e: DragEndEvent) {
    const dest = e.over?.id ? String(e.over.id) : null;
    if (!dest) return;
    await moveLead(String(e.active.id), dest);
  }

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <CrmSidebar />
      <div className="min-h-screen flex-1" style={{ background: "#F4F2EF" }}>
        <header
          className="flex items-center justify-between border-b bg-white px-6 py-3"
          style={{ borderColor: "#E0DED9" }}
        >
          <p className="text-sm font-semibold text-neutral-900">Legacy BrandCo.</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void verFollowups()}
              disabled={lendo}
              className="rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
              style={{ background: "#121110", color: "#CFFF87" }}
            >
              {lendo ? "Lendo o WhatsApp..." : "☐ Ver follow-ups"}
            </button>
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

        <FollowupBar
          lidoEm={followupLidoEm}
          contagem={contagem}
          leitura={leitura}
          erro={erroLeitura}
          ativo={soFollowup}
          onToggle={() => setSoFollowup((v) => !v)}
        />

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
                  <option key={f} value={f}>
                    {f}
                  </option>
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
                  <option key={u} value={u}>
                    {u}
                  </option>
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
              onClick={() => {
                setFFat("");
                setFUtm("");
                setSearch("");
              }}
              className="rounded-md border px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              style={{ borderColor: "#E0DED9" }}
            >
              Limpar filtros
            </button>
            <button
              onClick={() => setShowPerdidos((v) => !v)}
              aria-pressed={showPerdidos}
              className="rounded-md border px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
              style={{
                borderColor: "#E0DED9",
                background: showPerdidos ? "#ECE9E4" : undefined,
              }}
            >
              {showPerdidos ? "Ocultar perdidos" : "Ver perdidos"}
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
              <div className="scrollbar-kanban flex gap-4 overflow-x-auto pb-6">
                {(showPerdidos ? [...COLUNAS, COLUNA_PERDIDO] : COLUNAS).map((col) => {
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
                        <LeadCard
                          key={l.id}
                          lead={l}
                          onOpen={setOpened}
                          onDelete={handleDelete}
                          onMove={(lead, coluna) => void moveLead(lead.id, coluna)}
                        />
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
              // A rota de edição não devolve a tag de follow-up: mantém a que já tinha.
              const comTag = { ...updated, followup: updated.followup ?? opened.followup };
              setLeads((prev) => prev.map((l) => (l.id === updated.id ? comTag : l)));
              setOpened(comTag);
            }}
          />
        )}
      </div>
    </div>
  );
}

/** Tag vale só nas etapas de follow-up: mover para Ganho/Perdido já tira o card da lista. */
function temFollowup(l: Lead) {
  return !!l.followup && COLUNAS_FOLLOWUP.includes(l.coluna);
}

function FollowupBar({
  lidoEm,
  contagem,
  leitura,
  erro,
  ativo,
  onToggle,
}: {
  lidoEm: string | null;
  contagem: Record<FollowupTipo, number>;
  leitura: FollowupLeitura | null;
  erro: string | null;
  ativo: boolean;
  onToggle: () => void;
}) {
  const total = contagem.responder + contagem.cobrar + contagem.puxar;
  if (!lidoEm && !erro) return null;
  return (
    <div
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b bg-white px-6 py-2.5 text-xs"
      style={{ borderColor: "#E0DED9" }}
    >
      {erro ? (
        <p className="text-red-600">Não consegui ler o WhatsApp: {erro}</p>
      ) : (
        <>
          <p className="font-semibold text-neutral-900">
            {total === 0 ? "Nenhum follow-up pendente 🎉" : `${total} para follow-up`}
          </p>
          {(["responder", "cobrar", "puxar"] as FollowupTipo[]).map((t) =>
            contagem[t] > 0 ? (
              <span key={t} className="text-neutral-700">
                {FOLLOWUP_INFO[t].emoji} {contagem[t]} {FOLLOWUP_INFO[t].label.toLowerCase()}
              </span>
            ) : null,
          )}
          {total > 0 && (
            <button
              onClick={onToggle}
              aria-pressed={ativo}
              className="rounded-md border px-2.5 py-1 font-medium text-neutral-700 hover:bg-neutral-50"
              style={{ borderColor: "#E0DED9", background: ativo ? "#ECE9E4" : undefined }}
            >
              {ativo ? "Mostrar todos os leads" : "Mostrar só follow-ups"}
            </button>
          )}
          <p className="ml-auto text-neutral-500">
            {lidoEm && `Lido ${haQuanto(Date.now() - new Date(lidoEm).getTime())}`}
            {leitura && leitura.sem_conversa > 0 && (
              <> · {leitura.sem_conversa} sem conversa no WhatsApp</>
            )}
          </p>
        </>
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
    <div className="flex w-60 shrink-0 flex-col">
      <div
        className="rounded-t-md bg-white px-3 pt-2.5 pb-2"
        style={{ borderTop: `3px solid ${accent}` }}
      >
        <div className="flex items-center justify-between">
          {/* Nome longo (ex.: "Reunião agendada/gravada") em letra menor, para caber numa linha. */}
          <p
            className={`whitespace-nowrap font-semibold uppercase text-neutral-800 ${
              label.length > 18 ? "text-[10.5px] tracking-normal" : "text-xs tracking-wide"
            }`}
          >
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
