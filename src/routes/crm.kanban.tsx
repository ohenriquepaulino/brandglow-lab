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
  // Filtro do menu de follow-up: null mostra todos os leads.
  const [filtroFollowup, setFiltroFollowup] = useState<FollowupTipo | "todos" | null>(null);

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
      setFiltroFollowup("todos");
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
      if (filtroFollowup && !temFollowup(l)) return false;
      if (filtroFollowup && filtroFollowup !== "todos" && l.followup?.tipo !== filtroFollowup) {
        return false;
      }
      if (fFat && l.faturamento !== fFat) return false;
      if (fUtm && l.utm_source !== fUtm) return false;
      if (q) {
        const inName = l.nome.toLowerCase().includes(q);
        const inIg = (l.instagram ?? "").toLowerCase().includes(q);
        if (!inName && !inIg) return false;
      }
      return true;
    });
  }, [leads, fFat, fUtm, search, filtroFollowup]);

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
      {/* min-w-0: sem ele o quadro alarga a página (que tem overflow-x hidden) em vez de rolar. */}
      <div className="min-h-screen min-w-0 flex-1" style={{ background: "#F4F2EF" }}>
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

        <main className="px-6 pt-6 pb-28">
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

        <FollowupDock
          lendo={lendo}
          lidoEm={followupLidoEm}
          contagem={contagem}
          semConversa={leitura?.sem_conversa ?? 0}
          erro={erroLeitura}
          filtro={filtroFollowup}
          onLer={() => void verFollowups()}
          onFiltro={setFiltroFollowup}
        />

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

/** Menu flutuante embaixo, no centro: lê o WhatsApp e filtra o quadro pelas tags. */
function FollowupDock({
  lendo,
  lidoEm,
  contagem,
  semConversa,
  erro,
  filtro,
  onLer,
  onFiltro,
}: {
  lendo: boolean;
  lidoEm: string | null;
  contagem: Record<FollowupTipo, number>;
  semConversa: number;
  erro: string | null;
  filtro: FollowupTipo | "todos" | null;
  onLer: () => void;
  onFiltro: (f: FollowupTipo | "todos" | null) => void;
}) {
  const total = contagem.responder + contagem.cobrar + contagem.puxar;
  const legenda = erro
    ? `Não consegui ler o WhatsApp: ${erro}`
    : lendo
      ? "Lendo as conversas do WhatsApp..."
      : lidoEm
        ? `Lido ${haQuanto(Date.now() - new Date(lidoEm).getTime())}${
            semConversa > 0 ? ` · ${semConversa} sem conversa` : ""
          }`
        : "Lê o WhatsApp e marca quem precisa de atenção";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center px-4">
      <div
        className="pointer-events-auto flex max-w-full flex-col items-center gap-1.5 rounded-2xl px-2 pt-2 pb-1.5 shadow-[0_12px_40px_rgba(18,17,16,0.35)]"
        style={{ background: "#121110" }}
      >
        <div className="flex max-w-full items-center gap-1 overflow-x-auto">
          <button
            onClick={onLer}
            disabled={lendo}
            className="flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: "#CFFF87", color: "#121110" }}
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={lendo ? "animate-spin" : undefined}
            >
              {lendo ? (
                <path d="M21 12a9 9 0 1 1-6.2-8.56" />
              ) : (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="4" />
                  <path d="M8 12.5l2.5 2.5L16 9.5" />
                </>
              )}
            </svg>
            {lidoEm ? "Ler de novo" : "Ver follow-ups"}
          </button>

          {lidoEm && total > 0 && (
            <>
              <span className="mx-1 h-6 w-px shrink-0 bg-white/15" />
              <DockChip
                ativo={filtro === "todos"}
                onClick={() => onFiltro(filtro === "todos" ? null : "todos")}
              >
                Todos <span className="opacity-60">{total}</span>
              </DockChip>
              {(["responder", "cobrar", "puxar"] as FollowupTipo[]).map((t) =>
                contagem[t] > 0 ? (
                  <DockChip
                    key={t}
                    ativo={filtro === t}
                    onClick={() => onFiltro(filtro === t ? null : t)}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: TAG_COR[t] }}
                    />
                    {FOLLOWUP_INFO[t].label} <span className="opacity-60">{contagem[t]}</span>
                  </DockChip>
                ) : null,
              )}
              {filtro && (
                <button
                  onClick={() => onFiltro(null)}
                  aria-label="Mostrar todos os leads"
                  title="Mostrar todos os leads"
                  className="ml-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              )}
            </>
          )}
          {lidoEm && total === 0 && !lendo && (
            <span className="px-3 text-[13px] font-medium text-white">
              Nenhum follow-up pendente 🎉
            </span>
          )}
        </div>
        <p
          className={`max-w-full truncate px-2 text-[10.5px] ${erro ? "text-red-300" : "text-white/50"}`}
        >
          {legenda}
        </p>
      </div>
    </div>
  );
}

/** Cor do ponto de cada tag (o vermelho/laranja/cinza das tags dos cards). */
const TAG_COR: Record<FollowupTipo, string> = {
  responder: "#EF4444",
  cobrar: "#F08A5D",
  puxar: "#B0ABA4",
};

function DockChip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={ativo}
      className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-colors"
      style={{
        background: ativo ? "rgba(255,255,255,0.14)" : "transparent",
        color: ativo ? "#FFFFFF" : "rgba(255,255,255,0.75)",
      }}
    >
      {children}
    </button>
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
