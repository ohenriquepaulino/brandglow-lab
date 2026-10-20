import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CRM_PASS, crmLogout, isCrmAuthed } from "@/lib/crm-auth";
import { CrmSidebar } from "@/components/crm/Sidebar";

export const Route = createFileRoute("/crm/conselheiro")({
  ssr: false,
  component: ConselheiroPage,
});

const BORDER = "#E0DED9";
const HIST_KEY = "lbc_conselheiro_hist";
// Quantas mensagens anteriores vão junto em cada pergunta.
const CONTEXTO = 20;

type Imagem = { mime: "image/jpeg"; base64: string };
type Msg = { papel: "user" | "model"; texto: string; imagens?: Imagem[]; qtdImagens?: number };

const ATALHOS = [
  {
    label: "Responder um lead",
    texto:
      "Me ajuda a responder esse lead.\nFaixa de faturamento: \nO que ele já recebeu: \nConversa (ou cole o print):\n",
  },
  {
    label: "Ideia de follow-up",
    texto:
      "Preciso de uma ideia de follow-up diferente.\nFaixa de faturamento: \nSegmento: \nO que ele já recebeu e há quanto tempo sumiu: \n",
  },
  {
    label: "Objeção",
    texto: 'O lead disse: ""\nFaixa de faturamento: \nComo eu respondo?',
  },
  { label: "Dúvida de vendas", texto: "Tenho uma dúvida de vendas: " },
];

function lerHistorico(): Msg[] {
  try {
    const bruto = localStorage.getItem(HIST_KEY);
    return bruto ? (JSON.parse(bruto) as Msg[]) : [];
  } catch {
    return [];
  }
}

function salvarHistorico(msgs: Msg[]) {
  try {
    // Imagens não ficam no navegador (pesam demais): só a contagem.
    const leve = msgs.map(({ imagens, ...m }) => ({
      ...m,
      qtdImagens: m.qtdImagens ?? imagens?.length,
    }));
    localStorage.setItem(HIST_KEY, JSON.stringify(leve.slice(-80)));
  } catch {
    /* sem armazenamento: a conversa só não sobrevive ao recarregar */
  }
}

/** Reduz o print para até 1600px em JPEG, para a pergunta não ficar pesada. */
async function prepararImagem(arquivo: File): Promise<Imagem> {
  const url = URL.createObjectURL(arquivo);
  try {
    const img = await new Promise<HTMLImageElement>((ok, falha) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => falha(new Error("Não consegui ler a imagem"));
      i.src = url;
    });
    const escala = Math.min(1, 1600 / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    return { mime: "image/jpeg", base64: dataUrl.split(",")[1] };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function perguntar(msgs: Msg[]): Promise<string> {
  const res = await fetch("/api/public/crm/conselheiro", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-crm-token": CRM_PASS },
    body: JSON.stringify({
      action: "chat",
      mensagens: msgs.slice(-CONTEXTO).map((m) => ({
        papel: m.papel,
        texto: m.texto || (m.qtdImagens ? "[print enviado antes]" : ""),
        ...(m.imagens?.length ? { imagens: m.imagens } : {}),
      })),
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { resposta?: string; error?: string };
  if (!res.ok || !json.resposta) throw new Error(json.error || `Erro ${res.status}`);
  return json.resposta;
}

function ConselheiroPage() {
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
      className="flex h-screen"
      style={{ background: "#F4F2EF", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <CrmSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="flex items-center justify-between border-b bg-white px-6 py-3"
          style={{ borderColor: BORDER }}
        >
          <p className="text-sm font-semibold text-neutral-900">Conselheiro de vendas</p>
          <button
            onClick={handleLogout}
            className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            style={{ borderColor: BORDER }}
          >
            Sair
          </button>
        </header>
        {authed && <Chat />}
      </div>
    </div>
  );
}

function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>(() => lerHistorico());
  const [texto, setTexto] = useState("");
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [pensando, setPensando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);
  const caixaRef = useRef<HTMLTextAreaElement>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    salvarHistorico(msgs);
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, pensando]);

  async function anexar(arquivos: File[]) {
    const imgs = arquivos.filter((a) => a.type.startsWith("image/")).slice(0, 4 - imagens.length);
    if (imgs.length === 0) return;
    try {
      const prontas = await Promise.all(imgs.map(prepararImagem));
      setImagens((atual) => [...atual, ...prontas].slice(0, 4));
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    }
  }

  async function enviar() {
    if (pensando || (!texto.trim() && imagens.length === 0)) return;
    const nova: Msg = { papel: "user", texto: texto.trim(), imagens };
    const lista = [...msgs, nova];
    setMsgs(lista);
    setTexto("");
    setImagens([]);
    setErro(null);
    setPensando(true);
    try {
      const resposta = await perguntar(lista);
      setMsgs((atual) => [
        ...atual.map(({ imagens: i, ...m }) => ({ ...m, qtdImagens: m.qtdImagens ?? i?.length })),
        { papel: "model", texto: resposta },
      ]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    }
    setPensando(false);
  }

  function usarAtalho(t: string) {
    setTexto(t);
    setTimeout(() => {
      caixaRef.current?.focus();
      caixaRef.current?.setSelectionRange(t.length, t.length);
    }, 0);
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 md:px-6">
          {msgs.length === 0 && (
            <div
              className="rounded-lg border bg-white p-5 text-sm text-neutral-600"
              style={{ borderColor: BORDER }}
            >
              <p className="font-medium text-neutral-900">Como posso ajudar nas vendas hoje?</p>
              <p className="mt-2">
                Cole a conversa ou o print do WhatsApp (Cmd+V aqui na caixa) e diga a faixa de
                faturamento do lead. Eu devolvo a próxima mensagem pronta para copiar.
              </p>
            </div>
          )}
          {msgs.map((m, i) => (
            <Bolha key={i} msg={m} />
          ))}
          {pensando && <p className="text-sm text-neutral-500">Pensando…</p>}
          {erro && <p className="text-sm text-red-600">Não consegui responder: {erro}</p>}
          <div ref={fimRef} />
        </div>
      </div>

      <div className="border-t bg-white" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-3xl px-4 py-3 md:px-6">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {ATALHOS.map((a) => (
              <button
                key={a.label}
                onClick={() => usarAtalho(a.texto)}
                className="rounded-full border px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-50"
                style={{ borderColor: BORDER }}
              >
                {a.label}
              </button>
            ))}
            {msgs.length > 0 && (
              <button
                onClick={() => {
                  setMsgs([]);
                  setErro(null);
                }}
                className="ml-auto text-xs text-neutral-500 hover:text-neutral-900"
              >
                Nova conversa
              </button>
            )}
          </div>
          {imagens.length > 0 && (
            <div className="mb-2 flex gap-2">
              {imagens.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={`data:${img.mime};base64,${img.base64}`}
                    alt="Print anexado"
                    className="h-16 w-16 rounded-md border object-cover"
                    style={{ borderColor: BORDER }}
                  />
                  <button
                    onClick={() => setImagens((atual) => atual.filter((_, j) => j !== i))}
                    className="absolute -right-1.5 -top-1.5 h-5 w-5 rounded-full bg-neutral-900 text-[11px] text-white"
                    aria-label="Remover imagem"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              onClick={() => arquivoRef.current?.click()}
              className="rounded-md border px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-50"
              style={{ borderColor: BORDER }}
              title="Anexar print"
            >
              Print
            </button>
            <input
              ref={arquivoRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                void anexar(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
            <textarea
              ref={caixaRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onPaste={(e) => {
                const arquivos = Array.from(e.clipboardData.files);
                if (arquivos.some((a) => a.type.startsWith("image/"))) {
                  e.preventDefault();
                  void anexar(arquivos);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void enviar();
                }
              }}
              rows={Math.min(8, Math.max(2, texto.split("\n").length))}
              placeholder="Escreva ou cole a conversa… (Enter envia, Shift+Enter quebra linha)"
              className="min-w-0 flex-1 resize-none rounded-md border bg-white p-2.5 text-sm outline-none focus:border-neutral-900"
              style={{ borderColor: BORDER }}
            />
            <button
              onClick={() => void enviar()}
              disabled={pensando || (!texto.trim() && imagens.length === 0)}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Bolha({ msg }: { msg: Msg }) {
  if (msg.papel === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg bg-neutral-900 px-3.5 py-2.5 text-sm text-white">
          {(msg.imagens?.length || msg.qtdImagens) && (
            <p className="mb-1 text-[11px] text-neutral-300">
              {msg.imagens?.length ?? msg.qtdImagens} print(s) anexado(s)
            </p>
          )}
          <p className="whitespace-pre-wrap">{msg.texto}</p>
        </div>
      </div>
    );
  }
  // Blocos ``` são as mensagens prontas para o lead: viram caixas com "Copiar".
  const partes = msg.texto.split(/```(?:[a-z]*)\n?([\s\S]*?)```/g);
  return (
    <div className="max-w-[92%] space-y-3 text-sm text-neutral-800">
      {partes.map((p, i) =>
        i % 2 === 1 ? (
          <Pronta key={i} texto={p.trim()} />
        ) : p.trim() ? (
          <p key={i} className="whitespace-pre-wrap leading-relaxed">
            {p.trim().replace(/\*\*(.+?)\*\*/g, "$1")}
          </p>
        ) : null,
      )}
    </div>
  );
}

function Pronta({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="rounded-lg border bg-white p-3.5" style={{ borderColor: BORDER }}>
      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-900">{texto}</p>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(texto);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 1500);
          } catch {
            /* sem permissão de área de transferência */
          }
        }}
        className="mt-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
      >
        {copiado ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}
