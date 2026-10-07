import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { crmLogout, isCrmAuthed } from "@/lib/crm-auth";
import { CrmSidebar } from "@/components/crm/Sidebar";
import { BotaoAtualizar } from "@/components/crm/BotaoAtualizar";
import { apiAbResumo, type AbNumeros, type AbResumo } from "@/lib/ab-api";
import { AB_IGNORAR_KEY } from "@/lib/ab";

export const Route = createFileRoute("/crm/ab")({
  ssr: false,
  component: AbPage,
});

const BORDER = "#E0DED9";
const LINK_CAMPANHA = "https://legacybc.com.br/ads";

const PERIODOS = [
  { id: "inicio", label: "Desde o início do teste", dias: null },
  { id: "hoje", label: "Hoje", dias: 0 },
  { id: "7", label: "Últimos 7 dias", dias: 7 },
  { id: "30", label: "Últimos 30 dias", dias: 30 },
] as const;
type PeriodoId = (typeof PERIODOS)[number]["id"];

function desdeDoPeriodo(id: PeriodoId): string | null {
  const p = PERIODOS.find((x) => x.id === id);
  if (!p || p.dias === null) return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - p.dias);
  return d.toISOString();
}

function AbPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  // Muda a cada clique em "Atualizar": o AbContent busca os números de novo.
  const [versao, setVersao] = useState(0);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!isCrmAuthed()) {
      navigate({ to: "/crm" });
      return;
    }
    // Quem abre o painel não conta como visitante quando for ver as páginas.
    try {
      localStorage.setItem(AB_IGNORAR_KEY, "1");
    } catch {
      // sem localStorage: segue contando
    }
    setAuthed(true);
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
          <p className="text-sm font-semibold text-neutral-900">Teste A/B · landing pages</p>
          <div className="flex items-center gap-2">
            <BotaoAtualizar onClick={() => setVersao((v) => v + 1)} carregando={carregando} />
            <button
              onClick={handleLogout}
              className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              style={{ borderColor: BORDER }}
            >
              Sair
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-4xl space-y-6 px-6 py-6">
          {authed && <AbContent versao={versao} onCarregando={setCarregando} />}
        </main>
      </div>
    </div>
  );
}

function AbContent({
  versao,
  onCarregando,
}: {
  versao: number;
  onCarregando: (carregando: boolean) => void;
}) {
  const [periodo, setPeriodo] = useState<PeriodoId>("inicio");
  const [campanha, setCampanha] = useState("");
  const [dados, setDados] = useState<AbResumo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let vivo = true;
    setCarregando(true);
    setErro(null);
    apiAbResumo({ desde: desdeDoPeriodo(periodo), campanha: campanha || null })
      .then((d) => vivo && setDados(d))
      .catch((e) => vivo && setErro(e instanceof Error ? e.message : String(e)))
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [periodo, campanha, versao]);

  useEffect(() => onCarregando(carregando), [carregando, onCarregando]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(LINK_CAMPANHA);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1500);
    } catch {
      // sem permissão de área de transferência
    }
  }

  const a = dados?.variantes.a;
  const b = dados?.variantes.b;

  return (
    <>
      <section className="rounded-lg border bg-white p-5" style={{ borderColor: BORDER }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Link das campanhas
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <code className="rounded-md bg-neutral-100 px-3 py-2 text-sm text-neutral-900">
            {LINK_CAMPANHA}
          </code>
          <button
            onClick={copiar}
            className="rounded-md bg-neutral-900 px-3 py-2 text-xs font-medium text-white"
          >
            {copiado ? "Copiado" : "Copiar"}
          </button>
        </div>
        <p className="mt-3 text-xs text-neutral-500">
          Metade dos visitantes cai na versão A (<code>/adsa</code>) e metade na B (
          <code>/adsb</code>). Quem volta vê sempre a mesma versão. As UTMs da campanha são mantidas.{" "}
          <a href="/adsa" target="_blank" rel="noreferrer" className="underline">
            Ver A
          </a>{" "}
          ·{" "}
          <a href="/adsb" target="_blank" rel="noreferrer" className="underline">
            Ver B
          </a>
        </p>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value as PeriodoId)}
          className="rounded-md border bg-white px-3 py-2 text-sm"
          style={{ borderColor: BORDER }}
        >
          {PERIODOS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          value={campanha}
          onChange={(e) => setCampanha(e.target.value)}
          className="rounded-md border bg-white px-3 py-2 text-sm"
          style={{ borderColor: BORDER }}
        >
          <option value="">Todas as campanhas</option>
          {dados?.campanhas.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {carregando && <span className="text-xs text-neutral-500">Atualizando...</span>}
        {dados?.inicio && (
          <span className="ml-auto text-xs text-neutral-500">
            Teste rodando desde {new Date(dados.inicio).toLocaleDateString("pt-BR")}
          </span>
        )}
      </section>

      {erro && <p className="text-sm text-red-600">{erro}</p>}

      {dados && !dados.inicio && (
        <p className="rounded-lg border bg-white p-5 text-sm text-neutral-600" style={{ borderColor: BORDER }}>
          Nenhuma visita registrada ainda. Assim que as campanhas apontarem para o link acima, os
          números aparecem aqui.
        </p>
      )}

      {a && b && (
        <>
          <Veredito a={a} b={b} />
          <div className="grid gap-4 md:grid-cols-2">
            <Card nome="A" pagina="/adsa" descricao="Página atual" n={a} outro={b} />
            <Card nome="B" pagina="/adsb" descricao="Visual da proposta" n={b} outro={a} />
          </div>
          <p className="text-xs leading-relaxed text-neutral-500">
            <b>Conversão</b> = leads ÷ visitantes únicos. <b>Qualificados</b> = leads que faturam
            (os que marcam Lead no Meta). <b>Avançaram</b> = leads hoje em Reunião agendada/gravada,
            Fechamento ou Ganho. Visitas de quem abriu este painel no mesmo navegador não entram na
            conta.
          </p>
        </>
      )}
    </>
  );
}

const taxa = (x: number, de: number) => (de > 0 ? x / de : 0);
const pct = (x: number) => `${(x * 100).toFixed(1).replace(".", ",")}%`;

function Card({
  nome,
  pagina,
  descricao,
  n,
  outro,
}: {
  nome: string;
  pagina: string;
  descricao: string;
  n: AbNumeros;
  outro: AbNumeros;
}) {
  const conv = taxa(n.leads, n.visitantes);
  const qual = taxa(n.qualificados, n.visitantes);
  const lider =
    n.visitantes > 0 && qual > taxa(outro.qualificados, outro.visitantes) && n.qualificados > 0;
  return (
    <section
      className="rounded-lg border bg-white p-5"
      style={{ borderColor: lider ? "#16A34A" : BORDER, borderWidth: lider ? 2 : 1 }}
    >
      <div className="flex items-baseline justify-between">
        <p className="text-lg font-semibold text-neutral-900">
          Versão {nome} <span className="text-sm font-normal text-neutral-500">· {descricao}</span>
        </p>
        <code className="text-xs text-neutral-500">{pagina}</code>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-neutral-500">Conversão</p>
          <p className="text-3xl font-semibold text-neutral-900">{pct(conv)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-neutral-500">
            Conversão qualificada
          </p>
          <p className="text-3xl font-semibold" style={{ color: lider ? "#16A34A" : "#171717" }}>
            {pct(qual)}
          </p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-4 gap-2 border-t pt-4 text-center" style={{ borderColor: BORDER }}>
        {(
          [
            ["Visitantes", n.visitantes],
            ["Leads", n.leads],
            ["Qualificados", n.qualificados],
            ["Avançaram", n.avancados],
          ] as const
        ).map(([k, v]) => (
          <div key={k}>
            <dd className="text-lg font-semibold text-neutral-900">{v}</dd>
            <dt className="text-[10px] uppercase tracking-wide text-neutral-500">{k}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Φ(x) pela aproximação de Abramowitz–Stegun (erro < 1e-7). */
function normalCdf(x: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp((-x * x) / 2);
  const p =
    d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

/** Teste de duas proporções sobre os leads qualificados. */
function Veredito({ a, b }: { a: AbNumeros; b: AbNumeros }) {
  const MIN_VISITANTES = 100;
  let titulo: string;
  let texto: string;
  let cor = "#737373";

  if (a.visitantes < MIN_VISITANTES || b.visitantes < MIN_VISITANTES) {
    titulo = "Ainda coletando dados";
    texto = `Espere pelo menos ${MIN_VISITANTES} visitantes em cada versão antes de tirar conclusões (hoje: A ${a.visitantes}, B ${b.visitantes}).`;
  } else {
    const pa = taxa(a.qualificados, a.visitantes);
    const pb = taxa(b.qualificados, b.visitantes);
    const p = (a.qualificados + b.qualificados) / (a.visitantes + b.visitantes);
    const se = Math.sqrt(p * (1 - p) * (1 / a.visitantes + 1 / b.visitantes));
    const z = se > 0 ? (pb - pa) / se : 0;
    const confianca = 2 * normalCdf(Math.abs(z)) - 1;
    const lider = pb >= pa ? "B" : "A";
    const base = Math.min(pa, pb);
    const dif = base > 0 ? Math.abs(pb - pa) / base : 0;
    const difTxt = base > 0 ? `${Math.round(dif * 100)}% a mais` : "mais";

    if (pa === pb) {
      titulo = "Empate até agora";
      texto = "As duas versões convertem igual em leads qualificados.";
    } else if (confianca >= 0.95) {
      titulo = `Versão ${lider} vence`;
      texto = `${lider} converte ${difTxt} em leads qualificados, com ${pct(confianca)} de confiança. Pode mandar todo o tráfego para ela.`;
      cor = "#16A34A";
    } else if (confianca >= 0.8) {
      titulo = `Versão ${lider} na frente`;
      texto = `${lider} converte ${difTxt}, mas a confiança ainda é de ${pct(confianca)}. O ideal é chegar a 95% antes de decidir.`;
      cor = "#CA8A04";
    } else {
      titulo = "Empate técnico";
      texto = `A diferença ainda pode ser acaso (confiança de ${pct(confianca)}). Continue rodando.`;
    }
  }

  return (
    <section className="rounded-lg border bg-white p-5" style={{ borderColor: BORDER }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
        Resultado
      </p>
      <p className="mt-2 text-xl font-semibold" style={{ color: cor }}>
        {titulo}
      </p>
      <p className="mt-1 text-sm text-neutral-600">{texto}</p>
    </section>
  );
}
