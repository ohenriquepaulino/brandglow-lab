// Conselheiro de vendas: conversa com o Gemini (API do Google AI Studio).
// A chave fica em GEMINI_API_KEY (secret do Lovable); as instruções e o
// modelo, em conselheiro_config (só no banco, o repo é público).
// Nada da conversa é guardado no servidor: o histórico vive no navegador.

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta";

export type ParteImagem = { mime: string; base64: string };
export type MensagemChat = { papel: "user" | "model"; texto: string; imagens?: ParteImagem[] };

// Regras fixas por cima da base editável: o formato do chat e o que fazer com
// os pontos ainda não confirmados.
const REGRAS_DO_CHAT = `
Regras do chat:
- Responda sempre em português do Brasil.
- Quando escrever uma mensagem para mandar ao lead, coloque-a sozinha dentro de um bloco de código (\`\`\` ... \`\`\`), para a pessoa copiar com um clique. Fora do bloco, use texto simples, sem títulos.
- Informações marcadas como [CONFIRMAR] na base não estão confirmadas: não as afirme ao lead como certas sem avisar quem está usando o chat.
`;

// No plano gratuito, os modelos do Gemini às vezes ficam sobrecarregados (503)
// ou sem cota (429). Tenta o escolhido e os de reserva; se todos falharem,
// espera um pouco e faz uma segunda rodada, dentro de um teto de tempo.
const RESERVAS = [
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-lite-latest",
];
const TETO_MS = 100_000;
const TEMPORARIO = /Gemini (404|429|500|503)|aborted|timeout/i;

export class GeminiOcupado extends Error {}

export async function conversar(
  instrucoes: string,
  modelo: string,
  mensagens: MensagemChat[],
): Promise<string> {
  const inicio = Date.now();
  const modelos = [modelo, ...RESERVAS.filter((m) => m !== modelo)];
  for (let rodada = 0; rodada < 2; rodada++) {
    if (rodada > 0) await new Promise((r) => setTimeout(r, 3_000));
    for (const m of modelos) {
      const resta = TETO_MS - (Date.now() - inicio);
      if (resta < 5_000) break;
      try {
        return await conversarCom(instrucoes, m, mensagens, Math.min(45_000, resta));
      } catch (e) {
        const erro = e instanceof Error ? e : new Error(String(e));
        if (!TEMPORARIO.test(erro.message)) throw erro;
        console.warn("[conselheiro]", m, erro.message.slice(0, 120));
      }
    }
  }
  throw new GeminiOcupado(
    "O Gemini está sobrecarregado agora. Espere um minuto e clique em Tentar de novo.",
  );
}

async function conversarCom(
  instrucoes: string,
  modelo: string,
  mensagens: MensagemChat[],
  timeoutMs: number,
): Promise<string> {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) throw new Error("GEMINI_API_KEY não configurada no projeto");

  const res = await fetch(`${GEMINI_URL}/models/${encodeURIComponent(modelo)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": chave },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: `${instrucoes}\n${REGRAS_DO_CHAT}` }] },
      contents: mensagens.map((m) => ({
        role: m.papel,
        parts: [
          ...(m.imagens ?? []).map((i) => ({ inlineData: { mimeType: i.mime, data: i.base64 } })),
          ...(m.texto.trim() ? [{ text: m.texto }] : []),
        ],
      })),
      generationConfig: { temperature: 0.7 },
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Gemini ${res.status}: ${String(data?.error?.message ?? "").slice(0, 300)}`);
  }
  const texto = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? "")
    .join("")
    .trim();
  if (!texto) throw new Error("O Gemini não devolveu resposta. Tente reformular.");
  return texto;
}

/** Modelos disponíveis para a chave (para escolher o melhor no banco). */
export async function listarModelos(): Promise<string[]> {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) throw new Error("GEMINI_API_KEY não configurada no projeto");
  const res = await fetch(`${GEMINI_URL}/models?pageSize=200`, {
    headers: { "x-goog-api-key": chave },
    signal: AbortSignal.timeout(20_000),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${data?.error?.message ?? ""}`);
  return (data?.models ?? [])
    .filter((m: { supportedGenerationMethods?: string[] }) =>
      m.supportedGenerationMethods?.includes("generateContent"),
    )
    .map((m: { name: string }) => m.name.replace(/^models\//, ""));
}
