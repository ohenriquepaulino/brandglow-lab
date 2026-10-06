import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiListLeads } from "@/lib/crm-api";
import {
  COLUNAS,
  COLUNA_PERDIDO,
  crmLogout,
  formatBRL,
  formatDate,
  isCrmAuthed,
  isSemFaturamento,
  normalizeColuna,
  valorFechado,
  type Lead,
} from "@/lib/crm-auth";
import { grupoDoSegmento } from "@/lib/segmentos";
import { CrmSidebar } from "@/components/crm/Sidebar";

export const Route = createFileRoute("/crm/dashboard")({
  ssr: false,
  component: DashboardPage,
});

const BORDER = "#E0DED9";
const INK = "#121110";
const DIA = 24 * 60 * 60_000;
// Brasília é UTC-3 o ano todo: o "dia" do lead é o dia em Brasília.
const BRASILIA_OFFSET_MS = -3 * 60 * 60_000;

const PERIODOS = [
  { id: "7", label: "7 dias", dias: 7 },
  { id: "30", label: "30 dias", dias: 30 },
  { id: "90", label: "90 dias", dias: 90 },
  { id: "tudo", label: "Tudo", dias: null },
] as const;
type PeriodoId = (typeof PERIODOS)[number]["id"];

/** Faixas na ordem do formulário (do menor para o maior). */
const ORDEM_FATURAMENTO = [
  "Ainda não estou faturando",
  "Até R$ 6.000",
  "De R$ 6.000 a R$ 10.000",
  "De R$ 10.000 a R$ 20.000",
  "Acima de R$ 20.000",
];

function diaLocal(iso: string) {
  return new Date(new Date(iso).getTime() + BRASILIA_OFFSET_MS).toISOString().slice(0, 10);
}

function DashboardPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoId>("30");

  useEffect(() => {
    if (!isCrmAuthed()) {
      navigate({ to: "/crm" });
      return;
    }
    apiListLeads()
      .then((data) => setLeads(data.map((l) => ({ ...l, coluna: normalizeColuna(l.coluna) }))))
      .catch((e) => setErro(e instanceof Error ? e.message : String(e)));
  }, [navigate]);

  function handleLogout() {
    crmLogout();
    navigate({ to: "/crm" });
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#F4F2EF", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <CrmSidebar />
      <div className="min-w-0 flex-1">
        <header
          className="flex items-center justify-between border-b bg-white px-6 py-3"
          style={{ borderColor: BORDER }}
        >
          <p className="text-sm font-semibold text-neutral-900">Dashboard</p>
          <button
            onClick={handleLogout}
            className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            style={{ borderColor: BORDER }}
          >
            Sair
          </button>
        </header>

        <main className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-neutral-900">Visão geral</h1>
              <p className="text-xs text-neutral-500">Leads pelo dia de entrada, no horário de Brasília</p>
            </div>
            <div
              className="flex rounded-full border bg-white p-1"
              style={{ borderColor: BORDER }}
              role="tablist"
              aria-label="Período"
            >
              {PERIODOS.map((p) => (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={periodo === p.id}
                  onClick={() => setPeriodo(p.id)}
                  className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
                  style={
                    periodo === p.id
                      ? { background: INK, color: "#FFFFFF" }
                      : { color: "#57534E" }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {erro ? (
            <p className="text-sm text-red-600">Não consegui carregar os leads: {erro}</p>
          ) : !leads ? (
            <p className="text-sm text-neutral-500">Carregando...</p>
          ) : (
            <Painel leads={leads} periodo={periodo} />
          )}
        </main>
      </div>
    </div>
  );
}

function Painel({ leads, periodo }: { leads: Lead[]; periodo: PeriodoId }) {
  const dados = useMemo(() => {
    const agora = Date.now();
    const hoje = diaLocal(new Date(agora).toISOString());
    const dias = PERIODOS.find((p) => p.id === periodo)!.dias;
    const primeiroDia =
      dias === null
        ? leads.reduce((min, l) => (diaLocal(l.criado_em) < min ? diaLocal(l.criado_em) : min), hoje)
        : diaLocal(new Date(agora - (dias - 1) * DIA).toISOString());

    const doPeriodo = leads.filter((l) => diaLocal(l.criado_em) >= primeiroDia);

    // Um ponto por dia, inclusive os dias sem lead.
    const porDia = new Map<string, number>();
    for (let t = new Date(`${primeiroDia}T12:00:00Z`).getTime(); ; t += DIA) {
      const d = new Date(t).toISOString().slice(0, 10);
      if (d > hoje) break;
      porDia.set(d, 0);
    }
    for (const l of doPeriodo) {
      const d = diaLocal(l.criado_em);
      porDia.set(d, (porDia.get(d) ?? 0) + 1);
    }
    const serie = [...porDia.entries()].map(([dia, n]) => ({ dia, n }));

    const ganhos = leads
      .filter((l) => l.coluna === "ganho" && l.ganho_em && diaLocal(l.ganho_em) >= primeiroDia)
      .sort((a, b) => (b.ganho_em ?? "").localeCompare(a.ganho_em ?? ""));
    const receita = ganhos.reduce((s, l) => s + (valorFechado(l) ?? 0), 0);

    return {
      doPeriodo,
      serie,
      ganhos,
      receita,
      faturando: doPeriodo.filter((l) => !isSemFaturamento(l)).length,
    };
  }, [leads, periodo]);

  const { doPeriodo, serie, ganhos, receita, faturando } = dados;
  const total = doPeriodo.length;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          rotulo="Leads"
          valor={total.toLocaleString("pt-BR")}
          detalhe={`${(total / Math.max(1, serie.length)).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} por dia`}
        />
        <Kpi rotulo="Já faturam" valor={`${pct(faturando)}%`} detalhe={`${faturando} de ${total} leads`} />
        <Kpi
          rotulo="Ganhos"
          valor={ganhos.length.toLocaleString("pt-BR")}
          detalhe={
            total
              ? `${((ganhos.length / total) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% dos leads do período`
              : "—"
          }
        />
        <Kpi
          rotulo="Receita fechada"
          valor={formatBRL(receita)}
          detalhe={ganhos.length ? `Ticket médio ${formatBRL(receita / ganhos.length)}` : "Nenhum ganho ainda"}
          destaque
        />
      </div>

      <Cartao titulo="Leads por dia" subtitulo={`${total} no período`}>
        <LeadsPorDia serie={serie} />
      </Cartao>

      <div className="grid gap-5 lg:grid-cols-2">
        <Cartao titulo="Faturamento mensal" subtitulo="Faixa informada no formulário">
          <Barras
            itens={contar(doPeriodo, (l) => l.faturamento || "Não informado", ORDEM_FATURAMENTO)}
            total={total}
          />
        </Cartao>
        <Cartao titulo="Segmento" subtitulo="Área de atuação, agrupada por tema">
          <Barras itens={contar(doPeriodo, (l) => grupoDoSegmento(l.profissao))} total={total} />
        </Cartao>
        <Cartao titulo="Etapa atual" subtitulo="Onde os leads do período estão hoje">
          <Barras
            itens={contar(
              doPeriodo,
              (l) => [...COLUNAS, COLUNA_PERDIDO].find((c) => c.id === l.coluna)?.label ?? l.coluna,
              [...COLUNAS, COLUNA_PERDIDO].map((c) => c.label),
            )}
            total={total}
          />
        </Cartao>
        <Cartao titulo="Origem" subtitulo="UTM source e página do formulário">
          <Barras
            itens={contar(doPeriodo, (l) =>
              [l.utm_source || "direto", l.pagina || null].filter(Boolean).join(" · "),
            )}
            total={total}
          />
        </Cartao>
        <PerguntaOpcional
          titulo="Momento do negócio"
          leads={doPeriodo}
          campo={(l) => l.momento_negocio}
        />
        <PerguntaOpcional titulo="Verba para a marca" leads={doPeriodo} campo={(l) => l.verba_marca} />
      </div>

      <Cartao
        titulo="Ganhos"
        subtitulo={
          ganhos.length
            ? `${ganhos.length} ${ganhos.length === 1 ? "negócio fechado" : "negócios fechados"} · ${formatBRL(receita)}`
            : "Pelo dia em que o lead entrou em Ganho"
        }
      >
        {ganhos.length === 0 ? (
          <p className="py-6 text-center text-sm text-neutral-500">
            Nenhum ganho no período. Ao mover um lead para <strong>Ganho</strong> no Kanban, ele
            aparece aqui com o valor fechado.
          </p>
        ) : (
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-neutral-500">
                  <th className="px-1 py-2 font-semibold">Lead</th>
                  <th className="px-1 py-2 font-semibold">Segmento</th>
                  <th className="px-1 py-2 font-semibold">Faturamento</th>
                  <th className="px-1 py-2 font-semibold">Ganho em</th>
                  <th className="px-1 py-2 text-right font-semibold">Valor</th>
                </tr>
              </thead>
              <tbody>
                {ganhos.map((l) => (
                  <tr key={l.id} className="border-t" style={{ borderColor: BORDER }}>
                    <td className="px-1 py-2.5 font-medium text-neutral-900">{l.nome}</td>
                    <td className="px-1 py-2.5 text-neutral-600">{l.profissao || "—"}</td>
                    <td className="px-1 py-2.5 text-neutral-600">{l.faturamento}</td>
                    <td className="px-1 py-2.5 text-neutral-600">
                      {l.ganho_em ? formatDate(l.ganho_em) : "—"}
                    </td>
                    <td className="px-1 py-2.5 text-right font-semibold tabular-nums text-neutral-900">
                      {formatBRL(valorFechado(l) ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Cartao>
    </>
  );
}

/** Conta por categoria. Com `ordem`, segue essa ordem; senão, do maior para o menor. */
function contar(leads: Lead[], chave: (l: Lead) => string, ordem?: string[]) {
  const m = new Map<string, number>();
  for (const l of leads) m.set(chave(l), (m.get(chave(l)) ?? 0) + 1);
  const itens = [...m.entries()].map(([rotulo, n]) => ({ rotulo, n }));
  if (ordem) {
    const pos = (r: string) => (ordem.includes(r) ? ordem.indexOf(r) : ordem.length);
    return itens.sort((a, b) => pos(a.rotulo) - pos(b.rotulo) || b.n - a.n);
  }
  // "Outros" e "Não informado" sempre no fim.
  const fim = (r: string) => (r === "Outros" || r === "Não informado" ? 1 : 0);
  return itens.sort((a, b) => fim(a.rotulo) - fim(b.rotulo) || b.n - a.n);
}

function Kpi({
  rotulo,
  valor,
  detalhe,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  detalhe: string;
  destaque?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={destaque ? { background: INK, borderColor: INK } : { background: "#FFFFFF", borderColor: BORDER }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
        style={{ color: destaque ? "#CFFF87" : "#78716C" }}
      >
        {rotulo}
      </p>
      <p
        className="mt-2 truncate text-2xl font-semibold tabular-nums sm:text-[28px]"
        style={{ color: destaque ? "#FFFFFF" : INK }}
      >
        {valor}
      </p>
      <p className="mt-1 truncate text-xs" style={{ color: destaque ? "rgba(255,255,255,0.6)" : "#78716C" }}>
        {detalhe}
      </p>
    </div>
  );
}

function Cartao({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-neutral-900">{titulo}</h2>
        {subtitulo && <p className="mt-0.5 text-xs text-neutral-500">{subtitulo}</p>}
      </div>
      {children}
    </section>
  );
}

/** Barras horizontais: rótulo, barra proporcional ao maior, contagem e %. */
function Barras({ itens, total }: { itens: { rotulo: string; n: number }[]; total: number }) {
  if (itens.length === 0) return <p className="text-sm text-neutral-500">Sem leads no período.</p>;
  const max = Math.max(...itens.map((i) => i.n));
  return (
    <ul className="space-y-2.5">
      {itens.map((i) => (
        <li key={i.rotulo} title={`${i.rotulo}: ${i.n} leads`}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate text-neutral-700">{i.rotulo}</span>
            <span className="shrink-0 tabular-nums text-neutral-900">
              <strong className="font-semibold">{i.n}</strong>
              <span className="ml-1.5 text-neutral-500">
                {total ? Math.round((i.n / total) * 100) : 0}%
              </span>
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full" style={{ background: "#F1EFEB" }}>
            <div
              className="h-2 rounded-full"
              style={{ width: `${Math.max(2, (i.n / max) * 100)}%`, background: INK }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Perguntas que só alguns formulários fazem: mostra só quem respondeu. */
function PerguntaOpcional({
  titulo,
  leads,
  campo,
}: {
  titulo: string;
  leads: Lead[];
  campo: (l: Lead) => string | null;
}) {
  const responderam = leads.filter((l) => campo(l)?.trim());
  return (
    <Cartao
      titulo={titulo}
      subtitulo={`${responderam.length} de ${leads.length} responderam (só alguns formulários perguntam)`}
    >
      <Barras itens={contar(responderam, (l) => campo(l)!.trim())} total={responderam.length} />
    </Cartao>
  );
}

function LeadsPorDia({ serie }: { serie: { dia: string; n: number }[] }) {
  const dados = serie.map((p) => {
    const [, mes, dia] = p.dia.split("-");
    return { ...p, rotulo: `${dia}/${mes}` };
  });
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 4, right: 4, bottom: 0, left: -24 }} barCategoryGap={2}>
          <CartesianGrid vertical={false} stroke="#EEECE8" />
          <XAxis
            dataKey="rotulo"
            tickLine={false}
            axisLine={{ stroke: BORDER }}
            tick={{ fontSize: 10, fill: "#78716C" }}
            interval="preserveStartEnd"
            minTickGap={16}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: "#78716C" }}
            width={40}
          />
          <Tooltip
            cursor={{ fill: "rgba(18,17,16,0.05)" }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as { dia: string; n: number };
              const [ano, mes, dia] = p.dia.split("-");
              return (
                <div className="rounded-lg bg-[#121110] px-3 py-2 text-xs text-white shadow-lg">
                  <p className="text-white/60">{`${dia}/${mes}/${ano}`}</p>
                  <p className="mt-0.5 font-semibold">
                    {p.n} {p.n === 1 ? "lead" : "leads"}
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="n" fill={INK} radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
