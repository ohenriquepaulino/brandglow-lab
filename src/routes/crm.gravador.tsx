import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Circle,
  Download,
  FlipHorizontal2,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  Square,
  Video,
  VideoOff,
} from "lucide-react";
import { crmLogout, isCrmAuthed } from "@/lib/crm-auth";
import { CrmSidebar } from "@/components/crm/Sidebar";
import { Gravador, navegadorSuporta, type Resultado } from "@/lib/gravador";
import {
  abrirCameraFlutuante,
  formatarTempo,
  suportaCameraFlutuante,
  type CameraFlutuante,
} from "@/lib/camera-flutuante";

export const Route = createFileRoute("/crm/gravador")({
  ssr: false,
  component: GravadorPage,
});

const BORDER = "#E0DED9";
const INVERTER_KEY = "lbc_gravador_inverter";

function lerInvertida() {
  try {
    return localStorage.getItem(INVERTER_KEY) === "1";
  } catch {
    return false;
  }
}

function GravadorPage() {
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
          <p className="text-sm font-semibold text-neutral-900">Gravador · tela e câmera</p>
          <button
            onClick={handleLogout}
            className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            style={{ borderColor: BORDER }}
          >
            Sair
          </button>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-6">
          {authed && (navegadorSuporta() ? <GravadorContent /> : <SemSuporte />)}
        </main>
      </div>
    </div>
  );
}

function SemSuporte() {
  return (
    <section
      className="rounded-lg border bg-white p-6 text-sm text-neutral-700"
      style={{ borderColor: BORDER }}
    >
      <p className="font-semibold text-neutral-900">Este navegador não consegue gravar a tela.</p>
      <p className="mt-2">
        Abra o CRM no computador, de preferência no Chrome ou no Edge. Celular e tablet não permitem
        compartilhar a tela pelo navegador.
      </p>
    </section>
  );
}

type Dispositivos = { cameras: MediaDeviceInfo[]; mics: MediaDeviceInfo[] };

function GravadorContent() {
  const gravadorRef = useRef<Gravador | null>(null);
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const nivelRef = useRef<HTMLDivElement | null>(null);
  const flutuanteRef = useRef<CameraFlutuante | null>(null);
  const pararRef = useRef<() => void>(() => {});

  const [, setVersao] = useState(0);
  const atualizar = useCallback(() => {
    setVersao((v) => v + 1);
    flutuanteRef.current?.atualizar();
  }, []);

  const [ativado, setAtivado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [dispositivos, setDispositivos] = useState<Dispositivos>({ cameras: [], mics: [] });
  const [camId, setCamId] = useState("");
  const [micId, setMicId] = useState("");
  const [contagem, setContagem] = useState<number | null>(null);
  const [flutuanteAberta, setFlutuanteAberta] = useState(false);
  // Algumas câmeras (driver, app da webcam, câmera virtual) já mandam a imagem
  // espelhada. Inverter vira de volta, na prévia e na janela flutuante — e
  // portanto no vídeo, que grava a tela.
  const [invertida, setInvertida] = useState(lerInvertida);
  const [resultado, setResultado] = useState<(Resultado & { url: string; nome: string }) | null>(
    null,
  );
  const [baixado, setBaixado] = useState(false);

  useEffect(() => {
    const g = new Gravador();
    g.onMudanca = atualizar;
    g.onFonteEncerrada = () => pararRef.current();
    gravadorRef.current = g;
    atualizar();
    return () => {
      flutuanteRef.current?.fechar();
      g.destruir();
      gravadorRef.current = null;
    };
  }, [atualizar]);

  const g = gravadorRef.current;
  const estado = g?.estado ?? "parado";
  const emGravacao = estado !== "parado";
  const camera = g?.camera ?? null;
  const tela = g?.tela ?? null;

  // Prévia: a tela (ou a câmera, sem tela). Desligada durante a gravação para
  // não gastar o computador à toa.
  useEffect(() => {
    const v = previewRef.current;
    if (!v) return;
    v.srcObject = emGravacao ? null : (tela ?? camera);
  }, [tela, camera, emGravacao]);

  // A janela flutuante acompanha a câmera ligada/desligada/trocada.
  useEffect(() => {
    flutuanteRef.current?.trocarCamera(camera);
  }, [camera]);

  useEffect(() => {
    flutuanteRef.current?.inverter(invertida);
    try {
      localStorage.setItem(INVERTER_KEY, invertida ? "1" : "0");
    } catch {
      // sem localStorage: vale só nesta visita
    }
  }, [invertida]);

  // Cronômetro na tela enquanto grava.
  useEffect(() => {
    if (!emGravacao) return;
    const id = window.setInterval(atualizar, 500);
    return () => window.clearInterval(id);
  }, [emGravacao, atualizar]);

  // Medidor do microfone.
  useEffect(() => {
    if (!g?.temMicrofone) return;
    const dados = new Uint8Array(g.analisador.fftSize);
    let raf = 0;
    const loop = () => {
      g.analisador.getByteTimeDomainData(dados);
      let pico = 0;
      for (const v of dados) pico = Math.max(pico, Math.abs(v - 128));
      if (nivelRef.current) nivelRef.current.style.width = `${Math.min(100, (pico / 128) * 160)}%`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [g, g?.temMicrofone]);

  // Avisa antes de fechar a aba no meio da gravação ou sem baixar o vídeo.
  const temAlgoAPerder = emGravacao || (!!resultado && !baixado);
  useEffect(() => {
    if (!temAlgoAPerder) return;
    const avisar = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, [temAlgoAPerder]);

  useEffect(() => {
    return () => {
      if (resultado) URL.revokeObjectURL(resultado.url);
    };
  }, [resultado]);

  const listarDispositivos = useCallback(async () => {
    const todos = await navigator.mediaDevices.enumerateDevices();
    setDispositivos({
      cameras: todos.filter((d) => d.kind === "videoinput" && d.deviceId),
      mics: todos.filter((d) => d.kind === "audioinput" && d.deviceId),
    });
  }, []);

  useEffect(() => {
    if (!ativado) return;
    navigator.mediaDevices.addEventListener("devicechange", listarDispositivos);
    return () => navigator.mediaDevices.removeEventListener("devicechange", listarDispositivos);
  }, [ativado, listarDispositivos]);

  async function tentar(acao: () => Promise<void>) {
    setErro(null);
    try {
      await acao();
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  async function ativar() {
    if (!g) return;
    g.acordarAudio();
    setErro(null);
    const falhas: string[] = [];
    try {
      await g.ligarCamera(camId || undefined);
    } catch (e) {
      falhas.push(`Câmera: ${mensagemDeErro(e)}`);
    }
    try {
      await g.ligarMicrofone(micId || undefined);
    } catch (e) {
      falhas.push(`Microfone: ${mensagemDeErro(e)}`);
    }
    if (falhas.length) setErro(falhas.join(" "));
    setAtivado(true);
    await listarDispositivos();
  }

  async function compartilhar() {
    if (!g) return;
    try {
      await g.compartilharTela();
      setErro(null);
    } catch (e) {
      // Cancelar o seletor não é erro.
      if (e instanceof DOMException && e.name === "NotAllowedError") return;
      setErro(mensagemDeErro(e));
    }
  }

  /** Abre a janela da câmera. Tem que vir direto de um clique. */
  async function abrirFlutuante() {
    if (!g?.camera || flutuanteRef.current) return;
    try {
      flutuanteRef.current = await abrirCameraFlutuante(
        g.camera,
        {
          estado: () => gravadorRef.current?.estado ?? "parado",
          duracaoMs: () => gravadorRef.current?.duracaoMs() ?? 0,
          onPausar: () => gravadorRef.current?.pausar(),
          onRetomar: () => gravadorRef.current?.retomar(),
          onParar: () => pararRef.current(),
        },
        () => {
          flutuanteRef.current = null;
          setFlutuanteAberta(false);
        },
        invertida,
      );
      setFlutuanteAberta(true);
    } catch (e) {
      setErro(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "O navegador bloqueou a janela da câmera. Clique em “Abrir câmera flutuante” e grave de novo."
          : `Não deu para abrir a câmera flutuante: ${mensagemDeErro(e)}`,
      );
    }
  }

  function fecharFlutuante() {
    flutuanteRef.current?.fechar();
  }

  async function gravar() {
    if (!g) return;
    g.acordarAudio();
    // Com tela, a câmera só sai no vídeo se estiver na janela flutuante.
    if (g.temTela && g.temCamera && !flutuanteRef.current) await abrirFlutuante();
    for (let n = 3; n > 0; n--) {
      setContagem(n);
      flutuanteRef.current?.contagem(n);
      await new Promise((r) => window.setTimeout(r, 1000));
    }
    setContagem(null);
    flutuanteRef.current?.contagem(null);
    try {
      g.iniciar();
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  async function parar() {
    const atual = gravadorRef.current;
    if (!atual || atual.estado === "parado") return;
    const r = await atual.parar();
    flutuanteRef.current?.fechar();
    setBaixado(false);
    setResultado({ ...r, url: URL.createObjectURL(r.blob), nome: nomeDoArquivo(r.extensao) });
  }
  pararRef.current = () => void parar();

  function descartar() {
    if (resultado && !baixado && !confirm("Descartar este vídeo sem baixar?")) return;
    setResultado(null);
    setBaixado(false);
  }

  const podeGravar = !!g && (g.temCamera || g.temTela) && contagem === null && !resultado;
  const temFlutuante = suportaCameraFlutuante();

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4">
        <div
          className="relative overflow-hidden rounded-lg border bg-neutral-900"
          style={{ borderColor: BORDER }}
        >
          <video
            ref={previewRef}
            autoPlay
            muted
            playsInline
            className="block aspect-video w-full bg-neutral-900 object-contain"
            // Só a câmera vira; a prévia da tela fica como está.
            style={invertida && !tela ? { transform: "scaleX(-1)" } : undefined}
          />
          {!ativado && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="max-w-sm text-sm text-neutral-300">
                O navegador vai pedir permissão para usar a câmera e o microfone. Nada é enviado
                para fora do seu computador.
              </p>
              <button
                onClick={() => void ativar()}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-neutral-900"
              >
                Ativar câmera e microfone
              </button>
            </div>
          )}
          {ativado && !emGravacao && !tela && !camera && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400">
              Ligue a câmera ou compartilhe a tela
            </p>
          )}
          {emGravacao && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-white">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: estado === "gravando" ? "#EF4444" : "#A8A29E" }}
                />
                {estado === "gravando" ? "Gravando" : "Pausado"}
              </span>
              <span className="text-4xl font-semibold tabular-nums">
                {formatarTempo(g?.duracaoMs() ?? 0)}
              </span>
              {flutuanteAberta && (
                <span className="max-w-xs text-xs text-neutral-400">
                  Pausar e parar também estão na janela da câmera (passe o mouse em cima dela).
                </span>
              )}
            </div>
          )}
          {contagem !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="text-8xl font-semibold text-white">{contagem}</span>
            </div>
          )}
        </div>

        {erro && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {erro}
          </p>
        )}

        {resultado && (
          <section className="rounded-lg border bg-white p-5" style={{ borderColor: BORDER }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Vídeo gravado
            </p>
            <video src={resultado.url} controls className="mt-3 w-full rounded-md bg-black" />
            <p className="mt-3 text-xs text-neutral-500">
              {formatarTempo(resultado.duracaoMs)} · {formatarTamanho(resultado.blob.size)} ·{" "}
              {resultado.extensao.toUpperCase()}
              {resultado.extensao === "webm" &&
                " — o YouTube aceita; para mandar pelo WhatsApp, prefira gravar no Chrome atualizado (sai em MP4)."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={resultado.url}
                download={resultado.nome}
                onClick={() => setBaixado(true)}
                className="inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
              >
                <Download size={16} /> Baixar vídeo
              </a>
              <button
                onClick={descartar}
                className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                style={{ borderColor: BORDER }}
              >
                <RotateCcw size={16} /> {baixado ? "Gravar outro" : "Descartar"}
              </button>
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              O vídeo só existe nesta aba até você baixar. Para mandar a um lead: suba no YouTube
              como "não listado" e cole o link em Vídeos.
            </p>
          </section>
        )}

        {!resultado && (
          <section
            className="rounded-lg border bg-white p-5 text-xs leading-relaxed text-neutral-600"
            style={{ borderColor: BORDER }}
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Como gravar
            </p>
            <ol className="list-decimal space-y-1 pl-4">
              <li>Ative câmera e microfone.</li>
              <li>
                Clique em <strong>Compartilhar tela</strong> e escolha <strong>Tela inteira</strong>{" "}
                (o monitor onde vai estar a apresentação).
              </li>
              <li>
                Clique em <strong>Gravar</strong>. A câmera abre numa janelinha por cima de tudo:
                arraste para onde quiser e puxe a borda para mudar o tamanho, também durante a
                gravação.
              </li>
              <li>
                Vá para a apresentação. Para pausar ou parar, passe o mouse na janela da câmera.
              </li>
            </ol>
            <p className="mt-2 text-neutral-500">
              Tudo o que aparecer nesse monitor entra no vídeo, inclusive notificações. No Mac, o
              som do computador não entra ao gravar a tela inteira; a sua voz entra normalmente.
            </p>
          </section>
        )}
      </div>

      <aside className="space-y-4">
        <Painel titulo="Gravação">
          {!emGravacao ? (
            <button
              disabled={!podeGravar}
              onClick={() => void gravar()}
              className="flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: "#DC2626" }}
            >
              <Circle size={14} fill="currentColor" /> Gravar
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-center text-2xl font-semibold tabular-nums text-neutral-900">
                {formatarTempo(g?.duracaoMs() ?? 0)}
              </p>
              <div className="flex gap-2">
                {estado === "gravando" ? (
                  <BotaoSec onClick={() => g?.pausar()}>
                    <Pause size={16} /> Pausar
                  </BotaoSec>
                ) : (
                  <BotaoSec onClick={() => g?.retomar()}>
                    <Play size={16} /> Retomar
                  </BotaoSec>
                )}
                <button
                  onClick={() => void parar()}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
                >
                  <Square size={14} fill="currentColor" /> Parar
                </button>
              </div>
              <p className="text-center text-xs text-neutral-500">
                {formatarTamanho(g?.bytesGravados() ?? 0)} até agora
              </p>
            </div>
          )}
          {resultado && !emGravacao && (
            <p className="mt-2 text-xs text-neutral-500">
              Baixe ou descarte o vídeo anterior para gravar outro.
            </p>
          )}
          {!emGravacao && !resultado && !g?.temTela && g?.temCamera && (
            <p className="mt-2 text-xs text-neutral-500">
              Sem tela compartilhada, grava só a câmera.
            </p>
          )}
        </Painel>

        <Painel titulo="Tela">
          {tela ? (
            <div className="space-y-2">
              <p className="text-xs text-neutral-600">
                Compartilhando.
                {g?.temAudioDaTela && " O som da tela também entra na gravação."}
              </p>
              {!emGravacao && (
                <div className="flex gap-2">
                  <BotaoSec onClick={() => void compartilhar()}>
                    <Monitor size={16} /> Trocar
                  </BotaoSec>
                  <BotaoSec onClick={() => g?.pararTela()}>
                    <MonitorOff size={16} /> Parar
                  </BotaoSec>
                </div>
              )}
            </div>
          ) : (
            <BotaoSec onClick={() => void compartilhar()} disabled={!ativado || emGravacao}>
              <Monitor size={16} /> Compartilhar tela
            </BotaoSec>
          )}
        </Painel>

        <Painel titulo="Câmera">
          <div className="space-y-3">
            <div className="flex gap-2">
              <select
                value={camId}
                disabled={!ativado}
                onChange={(e) => {
                  setCamId(e.target.value);
                  void tentar(() => g!.ligarCamera(e.target.value || undefined));
                }}
                className="min-w-0 flex-1 rounded-md border bg-white px-2 py-1.5 text-xs"
                style={{ borderColor: BORDER }}
              >
                <option value="">Câmera padrão</option>
                {dispositivos.cameras.map((d, i) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Câmera ${i + 1}`}
                  </option>
                ))}
              </select>
              <BotaoIcone
                ativo={!!g?.temCamera}
                disabled={!ativado || (emGravacao && !g?.temTela)}
                titulo={g?.temCamera ? "Desligar câmera" : "Ligar câmera"}
                onClick={() =>
                  g?.temCamera
                    ? g.desligarCamera()
                    : void tentar(() => g!.ligarCamera(camId || undefined))
                }
              >
                {g?.temCamera ? <Video size={16} /> : <VideoOff size={16} />}
              </BotaoIcone>
              <BotaoIcone
                ativo={invertida}
                disabled={!ativado}
                titulo={invertida ? "Desfazer inversão da imagem" : "Inverter imagem (desespelhar)"}
                onClick={() => setInvertida((v) => !v)}
              >
                <FlipHorizontal2 size={16} />
              </BotaoIcone>
            </div>
            {invertida && (
              <p className="text-xs text-neutral-500">
                Imagem invertida: sai assim no vídeo. Desligue se o texto atrás de você aparecer ao
                contrário.
              </p>
            )}
            {temFlutuante && (
              <BotaoSec
                disabled={!g?.temCamera}
                onClick={() => (flutuanteAberta ? fecharFlutuante() : void abrirFlutuante())}
              >
                <PictureInPicture2 size={16} />
                {flutuanteAberta ? "Fechar câmera flutuante" : "Abrir câmera flutuante"}
              </BotaoSec>
            )}
            <p className="text-xs text-neutral-500">
              Abra antes de gravar para posicionar a janela. Ela abre sozinha ao clicar em Gravar.
            </p>
          </div>
        </Painel>

        <Painel titulo="Microfone">
          <div className="flex gap-2">
            <select
              value={micId}
              disabled={!ativado}
              onChange={(e) => {
                setMicId(e.target.value);
                void tentar(() => g!.ligarMicrofone(e.target.value || undefined));
              }}
              className="min-w-0 flex-1 rounded-md border bg-white px-2 py-1.5 text-xs"
              style={{ borderColor: BORDER }}
            >
              <option value="">Microfone padrão</option>
              {dispositivos.mics.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `Microfone ${i + 1}`}
                </option>
              ))}
            </select>
            <BotaoIcone
              ativo={!!g?.temMicrofone}
              disabled={!ativado}
              titulo={g?.temMicrofone ? "Desligar microfone" : "Ligar microfone"}
              onClick={() =>
                g?.temMicrofone
                  ? g.desligarMicrofone()
                  : void tentar(() => g!.ligarMicrofone(micId || undefined))
              }
            >
              {g?.temMicrofone ? <Mic size={16} /> : <MicOff size={16} />}
            </BotaoIcone>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div
              ref={nivelRef}
              className="h-full rounded-full transition-[width] duration-75"
              style={{ width: 0, background: "#16A34A" }}
            />
          </div>
        </Painel>
      </aside>
    </div>
  );
}

function Painel({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-white p-4" style={{ borderColor: BORDER }}>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
        {titulo}
      </p>
      {children}
    </section>
  );
}

function BotaoSec({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex w-full flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-40"
      style={{ borderColor: BORDER }}
    >
      {children}
    </button>
  );
}

function BotaoIcone({
  children,
  onClick,
  ativo,
  disabled,
  titulo,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ativo: boolean;
  disabled?: boolean;
  titulo: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={titulo}
      aria-label={titulo}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border disabled:opacity-40"
      style={{
        borderColor: ativo ? "#121110" : BORDER,
        background: ativo ? "#121110" : "white",
        color: ativo ? "white" : "#57534E",
      }}
    >
      {children}
    </button>
  );
}

function mensagemDeErro(e: unknown) {
  if (e instanceof DOMException) {
    if (e.name === "NotAllowedError")
      return "Permissão negada. Libere no ícone de cadeado ao lado do endereço e tente de novo.";
    if (e.name === "NotFoundError") return "Nenhum dispositivo encontrado.";
    if (e.name === "NotReadableError")
      return "O dispositivo está sendo usado por outro programa (Zoom, Meet...). Feche-o e tente de novo.";
    if (e.name === "OverconstrainedError") return "Esse dispositivo não está mais disponível.";
  }
  return e instanceof Error ? e.message : String(e);
}

function formatarTamanho(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function nomeDoArquivo(extensao: string) {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `gravacao-legacy-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}h${p(d.getMinutes())}.${extensao}`;
}
