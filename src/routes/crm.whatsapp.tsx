import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { crmLogout, formatDateTime, isCrmAuthed } from "@/lib/crm-auth";
import { CrmSidebar } from "@/components/crm/Sidebar";
import {
  apiWhatsAppConnect,
  apiWhatsAppDisconnect,
  apiWhatsAppGet,
  apiWhatsAppSaveConfig,
  apiWhatsAppSendTest,
  apiWhatsAppStatus,
  apiWhatsAppGrupos,
  apiWhatsAppSaveAviso,
  apiWhatsAppTestAviso,
  type AvisoConfig,
  type Grupo,
  type EstadoWhatsApp,
  type WhatsAppConfig,
  type WhatsAppEnvio,
} from "@/lib/whatsapp-api";

export const Route = createFileRoute("/crm/whatsapp")({
  ssr: false,
  component: WhatsAppPage,
});

const BORDER = "#E0DED9";

const ESTADO_LABEL: Record<EstadoWhatsApp, { label: string; cor: string }> = {
  conectado: { label: "Conectado", cor: "#16A34A" },
  conectando: { label: "Aguardando leitura do QR", cor: "#CA8A04" },
  desconectado: { label: "Desconectado", cor: "#DC2626" },
  sem_instancia: { label: "Desconectado", cor: "#DC2626" },
  nao_configurado: { label: "Evolution API não configurada", cor: "#737373" },
};

function WhatsAppPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!isCrmAuthed()) {
      navigate({ to: "/crm" });
      return;
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
          <p className="text-sm font-semibold text-neutral-900">WhatsApp</p>
          <button
            onClick={handleLogout}
            className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            style={{ borderColor: BORDER }}
          >
            Sair
          </button>
        </header>

        <main className="mx-auto max-w-3xl space-y-6 px-6 py-6">
          {authed && <WhatsAppContent />}
        </main>
      </div>
    </div>
  );
}

function WhatsAppContent() {
  const [estado, setEstado] = useState<EstadoWhatsApp | null>(null);
  const [numero, setNumero] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [conectando, setConectando] = useState(false);
  const [erroConexao, setErroConexao] = useState<string | null>(null);

  const [ativo, setAtivo] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [atraso, setAtraso] = useState(30);
  const [salvo, setSalvo] = useState<WhatsAppConfig | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [telTeste, setTelTeste] = useState("");
  const [testeMsg, setTesteMsg] = useState<string | null>(null);

  const [envios, setEnvios] = useState<WhatsAppEnvio[]>([]);
  const [aviso, setAviso] = useState<AvisoConfig | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    void carregar();
    void atualizarStatus();
    return () => pararPolling();
  }, []);

  async function carregar() {
    try {
      const data = await apiWhatsAppGet();
      if (data.config) {
        setAtivo(data.config.ativo);
        setMensagem(data.config.mensagem);
        setAtraso(data.config.atraso_segundos);
        setSalvo(data.config);
      }
      setEnvios(data.envios);
      if (data.config) {
        setAviso({
          aviso_ativo: data.config.aviso_ativo,
          aviso_grupo_id: data.config.aviso_grupo_id,
          aviso_grupo_nome: data.config.aviso_grupo_nome,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function atualizarStatus() {
    try {
      const s = await apiWhatsAppStatus();
      setEstado(s.estado);
      setNumero(s.numero);
      if (s.estado === "conectado") {
        setQr(null);
        pararPolling();
      }
    } catch (err) {
      console.error(err);
      setErroConexao(err instanceof Error ? err.message : String(err));
    }
  }

  function pararPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
  }

  async function handleConectar() {
    setConectando(true);
    setErroConexao(null);
    try {
      const r = await apiWhatsAppConnect();
      if (r.jaConectado) {
        await atualizarStatus();
      } else if (r.qrcode) {
        setQr(r.qrcode.startsWith("data:") ? r.qrcode : `data:image/png;base64,${r.qrcode}`);
        setEstado("conectando");
        pararPolling();
        pollRef.current = setInterval(atualizarStatus, 3000);
      } else {
        setErroConexao("A Evolution não devolveu o QR code. Tente de novo.");
      }
    } catch (err) {
      setErroConexao(err instanceof Error ? err.message : String(err));
    }
    setConectando(false);
  }

  async function handleDesconectar() {
    if (!confirm("Desconectar o WhatsApp? As mensagens automáticas param até reconectar.")) return;
    try {
      await apiWhatsAppDisconnect();
      await atualizarStatus();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  async function handleSalvar() {
    setSalvando(true);
    try {
      const config = { ativo, mensagem, atraso_segundos: atraso };
      await apiWhatsAppSaveConfig(config);
      setSalvo(config);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
    setSalvando(false);
  }

  async function handleTeste() {
    setTesteMsg("Enviando...");
    try {
      await apiWhatsAppSendTest(telTeste, mensagem);
      setTesteMsg("Enviado. Confira o WhatsApp.");
    } catch (err) {
      setTesteMsg(`Falhou: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const info = estado ? ESTADO_LABEL[estado] : null;
  const alterado =
    !salvo ||
    salvo.ativo !== ativo ||
    salvo.mensagem !== mensagem ||
    salvo.atraso_segundos !== atraso;

  return (
    <>
      {/* Conexão */}
      <section className="rounded-lg border bg-white p-5" style={{ borderColor: BORDER }}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Conexão
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: info?.cor ?? "#D4D4D4" }}
            />
            <span className="font-medium text-neutral-900">{info?.label ?? "Verificando..."}</span>
            {numero && <span className="text-neutral-500">· +{numero}</span>}
          </div>
          {estado === "conectado" ? (
            <button
              onClick={handleDesconectar}
              className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              style={{ borderColor: BORDER }}
            >
              Desconectar
            </button>
          ) : (
            estado !== "nao_configurado" && (
              <button
                onClick={handleConectar}
                disabled={conectando || estado === null}
                className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
              >
                {conectando ? "Gerando QR..." : qr ? "Gerar novo QR" : "Conectar WhatsApp"}
              </button>
            )
          )}
        </div>

        {estado === "nao_configurado" && (
          <p className="mt-3 text-xs text-neutral-500">
            Faltam os secrets <code>EVOLUTION_API_URL</code> e <code>EVOLUTION_API_KEY</code> no
            projeto.
          </p>
        )}
        {erroConexao && <p className="mt-3 text-xs text-red-600">{erroConexao}</p>}

        {qr && estado !== "conectado" && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <img src={qr} alt="QR code do WhatsApp" className="h-64 w-64" />
            <p className="text-center text-xs text-neutral-500">
              No celular: WhatsApp → Aparelhos conectados → Conectar um aparelho.
              <br />O QR expira em cerca de 40 segundos.
            </p>
          </div>
        )}
      </section>

      {/* Mensagem automática */}
      <section className="rounded-lg border bg-white p-5" style={{ borderColor: BORDER }}>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Mensagem para lead novo
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-4 w-4 accent-neutral-900"
            />
            Ativa
          </label>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Enviada alguns segundos depois que o lead se cadastra no site. Use{" "}
          <code>{"{primeiro-nome}"}</code> ou <code>{"{nome}"}</code>.
        </p>
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          rows={6}
          maxLength={2000}
          className="mt-3 w-full rounded-md border bg-white p-3 text-sm outline-none focus:border-neutral-900"
          style={{ borderColor: BORDER }}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-neutral-700">
            Enviar
            <input
              type="number"
              min={0}
              max={3600}
              value={atraso}
              onChange={(e) =>
                setAtraso(Math.max(0, Math.min(3600, Math.round(Number(e.target.value) || 0))))
              }
              className="w-16 rounded-md border px-2 py-1 text-sm outline-none focus:border-neutral-900"
              style={{ borderColor: BORDER }}
            />
            segundos após o cadastro
          </label>
          <button
            onClick={handleSalvar}
            disabled={!alterado || salvando || !mensagem.trim()}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            {salvando ? "Salvando..." : alterado ? "Salvar" : "Salvo"}
          </button>
        </div>

        <div className="mt-4 border-t pt-4" style={{ borderColor: BORDER }}>
          <p className="text-xs font-medium text-neutral-700">Enviar teste</p>
          <div className="mt-2 flex gap-2">
            <input
              value={telTeste}
              onChange={(e) => setTelTeste(e.target.value)}
              placeholder="(11) 98888-7777"
              className="flex-1 rounded-md border px-3 py-1.5 text-sm outline-none focus:border-neutral-900"
              style={{ borderColor: BORDER }}
            />
            <button
              onClick={handleTeste}
              disabled={estado !== "conectado" || telTeste.replace(/\D/g, "").length < 10}
              className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
              style={{ borderColor: BORDER }}
            >
              Enviar
            </button>
          </div>
          {testeMsg && <p className="mt-2 text-xs text-neutral-600">{testeMsg}</p>}
        </div>
      </section>

      {aviso && <AvisoGrupo inicial={aviso} conectado={estado === "conectado"} />}

      {/* Últimos envios */}
      <section className="rounded-lg border bg-white p-5" style={{ borderColor: BORDER }}>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Últimos envios automáticos
          </p>
          <button onClick={carregar} className="text-xs text-neutral-500 hover:text-neutral-900">
            Atualizar
          </button>
        </div>
        {envios.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-500">Nenhum envio ainda.</p>
        ) : (
          <ul className="mt-3 divide-y text-sm" style={{ borderColor: BORDER }}>
            {envios.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-neutral-900">
                    {e.leads?.nome ?? e.telefone}
                    {e.tipo === "aviso" && (
                      <span className="ml-1 text-xs text-neutral-500">· aviso no grupo</span>
                    )}
                  </p>
                  {e.erro && <p className="truncate text-xs text-red-600">{e.erro}</p>}
                  <p className="text-[11px] text-neutral-500">{formatDateTime(e.enviar_em)}</p>
                </div>
                <StatusPill status={e.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function AvisoGrupo({ inicial, conectado }: { inicial: AvisoConfig; conectado: boolean }) {
  const [ativo, setAtivo] = useState(inicial.aviso_ativo);
  const [grupoId, setGrupoId] = useState(inicial.aviso_grupo_id);
  const [grupoNome, setGrupoNome] = useState(inicial.aviso_grupo_nome);
  const [salvo, setSalvo] = useState(inicial);
  const [grupos, setGrupos] = useState<Grupo[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function carregarGrupos() {
    setCarregando(true);
    setMsg(null);
    try {
      const lista = await apiWhatsAppGrupos();
      setGrupos(lista);
      if (lista.length === 0) setMsg("Esse número não está em nenhum grupo.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : String(err));
    }
    setCarregando(false);
  }

  async function salvar() {
    const config = {
      aviso_ativo: ativo && !!grupoId,
      aviso_grupo_id: grupoId,
      aviso_grupo_nome: grupoNome,
    };
    try {
      await apiWhatsAppSaveAviso(config);
      setAtivo(config.aviso_ativo);
      setSalvo(config);
      setMsg(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  async function testar() {
    if (!grupoId) return;
    setMsg("Enviando teste...");
    try {
      await apiWhatsAppTestAviso(grupoId);
      setMsg("Teste enviado no grupo.");
    } catch (err) {
      setMsg(`Falhou: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const alterado = salvo.aviso_ativo !== ativo || salvo.aviso_grupo_id !== grupoId;

  return (
    <section className="rounded-lg border bg-white p-5" style={{ borderColor: BORDER }}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Aviso de novo lead no grupo
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            disabled={!grupoId}
            className="h-4 w-4 accent-neutral-900"
          />
          Ativo
        </label>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        Assim que o lead se cadastra, o número conectado manda no grupo:{" "}
        <em>🔔 NOVO LEAD NO CRM · nome · link wa.me</em>. Quem envia não recebe notificação — ela
        chega para os outros membros do grupo.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {grupos ? (
          <select
            value={grupoId ?? ""}
            onChange={(e) => {
              const g = grupos.find((x) => x.id === e.target.value);
              setGrupoId(g?.id ?? null);
              setGrupoNome(g?.nome ?? null);
            }}
            className="min-w-0 flex-1 rounded-md border bg-white px-3 py-1.5 text-sm outline-none focus:border-neutral-900"
            style={{ borderColor: BORDER }}
          >
            <option value="">Escolha o grupo...</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nome}
              </option>
            ))}
          </select>
        ) : (
          <p className="min-w-0 flex-1 truncate text-sm text-neutral-800">
            {grupoNome ?? <span className="text-neutral-500">Nenhum grupo escolhido</span>}
          </p>
        )}
        <button
          onClick={carregarGrupos}
          disabled={!conectado || carregando}
          className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
          style={{ borderColor: BORDER }}
        >
          {carregando ? "Carregando..." : grupos ? "Recarregar grupos" : "Escolher grupo"}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          onClick={testar}
          disabled={!conectado || !grupoId}
          className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
          style={{ borderColor: BORDER }}
        >
          Enviar teste no grupo
        </button>
        <button
          onClick={salvar}
          disabled={!alterado}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
        >
          {alterado ? "Salvar" : "Salvo"}
        </button>
      </div>
      {msg && <p className="mt-2 text-xs text-neutral-600">{msg}</p>}
    </section>
  );
}

const STATUS_PILL: Record<WhatsAppEnvio["status"], { label: string; cor: string }> = {
  pendente: { label: "Agendado", cor: "#CA8A04" },
  enviando: { label: "Enviando", cor: "#CA8A04" },
  enviado: { label: "Enviado", cor: "#16A34A" },
  erro: { label: "Erro", cor: "#DC2626" },
};

function StatusPill({ status }: { status: WhatsAppEnvio["status"] }) {
  const { label, cor } = STATUS_PILL[status];
  return (
    <span
      className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
      style={{ background: cor }}
    >
      {label}
    </span>
  );
}
