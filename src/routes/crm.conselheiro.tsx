import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Paperclip, X } from "lucide-react";
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
        texto:
          m.texto ||
          (m.imagens?.length
            ? "Me ajuda a responder esse lead com base nesse print da conversa."
            : m.qtdImagens
              ? "[print enviado antes]"
              : ""),
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

// ─── Guias: os atalhos perguntam o essencial antes de pedir ao conselheiro ───

const FAIXAS = ["Não fatura", "Até R$ 6 mil", "R$ 6 a 10 mil", "Acima de R$ 10 mil"];
const MATERIAIS = [
  "Boas-vindas com preço",
  "Vídeo de apresentação",
  "Vídeo de cases",
  "Parcelamento",
  "Proposta",
  "Despedida",
];
const SUMIU = ["1 a 2 dias", "3 a 7 dias", "2 semanas ou mais", "Meses"];
const OBJECOES = [
  "Tá caro",
  "Vou pensar",
  "Agora não é o momento",
  "Vou fazer no Canva / eu mesmo",
  "Achei mais barato",
  "Preciso falar com sócio / esposa",
  "Meu negócio ainda é pequeno",
  "Já tenho logo",
  "Não conheço a Legacy",
];
const DUVIDAS = [
  "Como chamar o lead pra uma ligação sem ele fugir?",
  "Como falar do preço sem assustar?",
  "Quando vale desistir de um lead?",
  "Como conduzir a conversa de 20 minutos?",
  "Como pedir indicação pra um cliente?",
];

type GuiaId = "responder" | "followup" | "objecao" | "duvida";
const GUIAS: { id: GuiaId; label: string }[] = [
  { id: "responder", label: "Responder um lead" },
  { id: "followup", label: "Ideia de follow-up" },
  { id: "objecao", label: "Objeção" },
  { id: "duvida", label: "Dúvida de vendas" },
];

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3 py-1 text-xs transition-colors"
      style={{
        borderColor: ativo ? "#121110" : BORDER,
        background: ativo ? "#121110" : "#fff",
        color: ativo ? "#fff" : "#44403C",
      }}
    >
      {children}
    </button>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-neutral-500">
        {titulo}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Guia({
  id,
  onPreencher,
  onEnviar,
  onFechar,
}: {
  id: GuiaId;
  onPreencher: (texto: string) => void;
  onEnviar: (texto: string) => void;
  onFechar: () => void;
}) {
  const [faixa, setFaixa] = useState<string | null>(null);
  const [recebeu, setRecebeu] = useState<string[]>([]);
  const [sumiu, setSumiu] = useState<string | null>(null);
  const [segmento, setSegmento] = useState("");
  const [objecao, setObjecao] = useState<string | null>(null);

  const alternar = (m: string) =>
    setRecebeu((r) => (r.includes(m) ? r.filter((x) => x !== m) : [...r, m]));
  const contexto = [
    faixa && `Faixa de faturamento: ${faixa}.`,
    segmento.trim() && `Segmento: ${segmento.trim()}.`,
    recebeu.length > 0 && `Já recebeu: ${recebeu.join(", ").toLowerCase()}.`,
  ]
    .filter(Boolean)
    .join(" ");

  const faixaEl = (
    <Grupo titulo="Faixa de faturamento">
      {FAIXAS.map((f) => (
        <Chip key={f} ativo={faixa === f} onClick={() => setFaixa(faixa === f ? null : f)}>
          {f}
        </Chip>
      ))}
    </Grupo>
  );
  const recebeuEl = (
    <Grupo titulo="O que já recebeu">
      {MATERIAIS.map((m) => (
        <Chip key={m} ativo={recebeu.includes(m)} onClick={() => alternar(m)}>
          {m}
        </Chip>
      ))}
    </Grupo>
  );

  let corpo: React.ReactNode;
  let acao: { label: string; pronto: boolean; fazer: () => void } | null = null;

  if (id === "responder") {
    corpo = (
      <>
        {faixaEl}
        {recebeuEl}
        <p className="text-xs text-neutral-500">
          Depois é só colar ou arrastar o print da conversa na caixa abaixo.
        </p>
      </>
    );
    acao = {
      label: "Continuar",
      pronto: true,
      fazer: () =>
        onPreencher(
          `Me ajuda a responder esse lead. ${contexto}\nSegue a conversa (print ou texto):\n`,
        ),
    };
  } else if (id === "followup") {
    corpo = (
      <>
        {faixaEl}
        <Grupo titulo="Sumiu há">
          {SUMIU.map((t) => (
            <Chip key={t} ativo={sumiu === t} onClick={() => setSumiu(sumiu === t ? null : t)}>
              {t}
            </Chip>
          ))}
        </Grupo>
        {recebeuEl}
        <input
          value={segmento}
          onChange={(e) => setSegmento(e.target.value)}
          placeholder="Segmento do lead (opcional): clínica, imobiliária…"
          className="w-full rounded-md border px-2.5 py-1.5 text-xs outline-none focus:border-neutral-900"
          style={{ borderColor: BORDER }}
        />
      </>
    );
    acao = {
      label: "Gerar ideias",
      pronto: !!sumiu,
      fazer: () =>
        onEnviar(
          `Me dá 3 ideias de follow-up com estímulos diferentes, cada uma com a mensagem pronta. O lead sumiu há ${sumiu?.toLowerCase()}. ${contexto}`,
        ),
    };
  } else if (id === "objecao") {
    corpo = (
      <>
        <Grupo titulo="O lead disse">
          {OBJECOES.map((o) => (
            <Chip
              key={o}
              ativo={objecao === o}
              onClick={() => setObjecao(objecao === o ? null : o)}
            >
              {o}
            </Chip>
          ))}
        </Grupo>
        {faixaEl}
      </>
    );
    acao = {
      label: "Gerar resposta",
      pronto: !!objecao,
      fazer: () => onEnviar(`O lead disse: "${objecao}". ${contexto} Como eu respondo?`),
    };
  } else {
    corpo = (
      <Grupo titulo="Perguntas frequentes">
        {DUVIDAS.map((d) => (
          <Chip key={d} onClick={() => onEnviar(d)}>
            {d}
          </Chip>
        ))}
        <Chip onClick={() => onPreencher("Tenho uma dúvida de vendas: ")}>Outra dúvida…</Chip>
      </Grupo>
    );
  }

  return (
    <div className="mb-3 rounded-lg border bg-[#FAF9F7] p-3.5" style={{ borderColor: BORDER }}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-900">
          {GUIAS.find((g) => g.id === id)?.label}
        </p>
        <button
          type="button"
          onClick={onFechar}
          className="text-neutral-400 hover:text-neutral-900"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>
      <div className="space-y-3">{corpo}</div>
      {acao && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={acao.fazer}
            disabled={!acao.pronto}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
          >
            {acao.label}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Chat ────────────────────────────────────────────────────────────────────

function Chat() {
  const [msgs, setMsgs] = useState<Msg[]>(() => lerHistorico());
  const [texto, setTexto] = useState("");
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [pensando, setPensando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [guia, setGuia] = useState<GuiaId | null>(null);
  const [arrastando, setArrastando] = useState(false);
  const fimRef = useRef<HTMLDivElement>(null);
  const caixaRef = useRef<HTMLTextAreaElement>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);
  const profundidade = useRef(0);

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
      caixaRef.current?.focus();
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    }
  }

  async function enviar(textoForcado?: string) {
    const conteudo = (textoForcado ?? texto).trim();
    if (pensando || (!conteudo && imagens.length === 0)) return;
    const nova: Msg = { papel: "user", texto: conteudo, imagens };
    const lista = [...msgs, nova];
    setMsgs(lista);
    setTexto("");
    setImagens([]);
    setGuia(null);
    await responder(lista);
  }

  /** Pede a resposta para a conversa dada (a última mensagem é do usuário). */
  async function responder(lista: Msg[]) {
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

  function preencher(t: string) {
    setTexto(t);
    setGuia(null);
    setTimeout(() => {
      caixaRef.current?.focus();
      caixaRef.current?.setSelectionRange(t.length, t.length);
    }, 0);
  }

  const temArquivo = (e: React.DragEvent) => Array.from(e.dataTransfer.types).includes("Files");

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      onDragEnter={(e) => {
        if (!temArquivo(e)) return;
        profundidade.current++;
        setArrastando(true);
      }}
      onDragLeave={() => {
        profundidade.current = Math.max(0, profundidade.current - 1);
        if (profundidade.current === 0) setArrastando(false);
      }}
      onDragOver={(e) => {
        if (temArquivo(e)) e.preventDefault();
      }}
      onDrop={(e) => {
        if (!temArquivo(e)) return;
        e.preventDefault();
        profundidade.current = 0;
        setArrastando(false);
        void anexar(Array.from(e.dataTransfer.files));
      }}
    >
      {arrastando && (
        <div className="pointer-events-none absolute inset-3 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-neutral-400 bg-white/80">
          <p className="text-sm font-medium text-neutral-700">Solte o print aqui</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-5 px-4 py-6 md:px-6">
          {msgs.length === 0 && (
            <div className="pt-8 text-center">
              <p className="text-lg font-semibold text-neutral-900">
                Como posso ajudar nas vendas hoje?
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
                Escolha um atalho abaixo ou cole a conversa do WhatsApp. Dá para arrastar o print
                direto para cá.
              </p>
            </div>
          )}
          {msgs.map((m, i) => (
            <Bolha key={i} msg={m} />
          ))}
          {pensando && (
            <div className="flex items-center gap-1.5 py-1 text-neutral-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:300ms]" />
            </div>
          )}
          {erro && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              <span>{erro.startsWith("Gemini") ? `Não consegui responder: ${erro}` : erro}</span>
              {msgs.at(-1)?.papel === "user" && !pensando && (
                <button
                  type="button"
                  onClick={() => void responder(msgs)}
                  className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  Tentar de novo
                </button>
              )}
            </div>
          )}
          <div ref={fimRef} />
        </div>
      </div>

      <div className="px-4 pb-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          {guia ? (
            <Guia
              key={guia}
              id={guia}
              onPreencher={preencher}
              onEnviar={(t) => void enviar(t)}
              onFechar={() => setGuia(null)}
            />
          ) : (
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              {GUIAS.map((g) => (
                <Chip key={g.id} onClick={() => setGuia(g.id)}>
                  {g.label}
                </Chip>
              ))}
              {msgs.length > 0 && (
                <button
                  type="button"
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
          )}

          <div
            className="rounded-xl border bg-white shadow-sm focus-within:border-neutral-400"
            style={{ borderColor: BORDER }}
          >
            {imagens.length > 0 && (
              <div className="flex gap-2 px-3 pt-3">
                {imagens.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={`data:${img.mime};base64,${img.base64}`}
                      alt="Print anexado"
                      className="h-16 w-16 rounded-md border object-cover"
                      style={{ borderColor: BORDER }}
                    />
                    <button
                      type="button"
                      onClick={() => setImagens((atual) => atual.filter((_, j) => j !== i))}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white"
                      aria-label="Remover imagem"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              placeholder="Escreva, cole a conversa ou arraste um print…"
              className="block w-full resize-none bg-transparent px-3.5 pt-3 text-sm outline-none"
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <button
                type="button"
                onClick={() => arquivoRef.current?.click()}
                className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                title="Anexar print"
                aria-label="Anexar print"
              >
                <Paperclip size={17} />
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
              <button
                type="button"
                onClick={() => void enviar()}
                disabled={pensando || (!texto.trim() && imagens.length === 0)}
                className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-white disabled:opacity-30"
                aria-label="Enviar"
              >
                <ArrowUp size={17} />
              </button>
            </div>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-neutral-400">
            Enter envia · Shift+Enter quebra linha
          </p>
        </div>
      </div>
    </div>
  );
}

function Bolha({ msg }: { msg: Msg }) {
  if (msg.papel === "user") {
    const qtd = msg.imagens?.length ?? msg.qtdImagens ?? 0;
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-neutral-900 px-4 py-2.5 text-sm text-white">
          {msg.imagens && msg.imagens.length > 0 ? (
            <div className="mb-2 flex gap-1.5">
              {msg.imagens.map((img, i) => (
                <img
                  key={i}
                  src={`data:${img.mime};base64,${img.base64}`}
                  alt="Print enviado"
                  className="h-20 rounded-md object-cover"
                />
              ))}
            </div>
          ) : qtd > 0 ? (
            <p className="mb-1 text-[11px] text-neutral-400">
              {qtd === 1 ? "1 print anexado" : `${qtd} prints anexados`}
            </p>
          ) : null}
          {msg.texto && <p className="whitespace-pre-wrap leading-relaxed">{msg.texto}</p>}
        </div>
      </div>
    );
  }
  // Blocos ``` são as mensagens prontas para o lead: viram cartões com "Copiar".
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
    <div className="rounded-xl border bg-white p-4 shadow-sm" style={{ borderColor: BORDER }}>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
        Mensagem pronta
      </p>
      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-900">{texto}</p>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(texto);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 1500);
            } catch {
              /* sem permissão de área de transferência */
            }
          }}
          className="rounded-md border px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          style={{ borderColor: BORDER }}
        >
          {copiado ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}
