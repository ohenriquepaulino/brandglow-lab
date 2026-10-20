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

/**
 * Abre a resposta em streaming: devolve o texto aos pedaços, conforme o Gemini
 * escreve. A troca de modelo (reserva) só acontece antes do primeiro pedaço.
 */
export async function conversar(
  instrucoes: string,
  modelo: string,
  mensagens: MensagemChat[],
): Promise<ReadableStream<Uint8Array>> {
  const inicio = Date.now();
  const modelos = [modelo, ...RESERVAS.filter((m) => m !== modelo)];
  for (let rodada = 0; rodada < 2; rodada++) {
    if (rodada > 0) await new Promise((r) => setTimeout(r, 3_000));
    for (const m of modelos) {
      const resta = TETO_MS - (Date.now() - inicio);
      if (resta < 5_000) break;
      try {
        return await abrirStream(instrucoes, m, mensagens, resta);
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

/** Lê o stream inteiro (para quem não quer a resposta aos pedaços). */
export async function textoDoStream(stream: ReadableStream<Uint8Array>): Promise<string> {
  return (await new Response(stream).text()).trim();
}

async function abrirStream(
  instrucoes: string,
  modelo: string,
  mensagens: MensagemChat[],
  timeoutMs: number,
): Promise<ReadableStream<Uint8Array>> {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) throw new Error("GEMINI_API_KEY não configurada no projeto");

  const pedir = (pensarPouco: boolean) =>
    fetch(`${GEMINI_URL}/models/${encodeURIComponent(modelo)}:streamGenerateContent?alt=sse`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": chave },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${instrucoes}\n${REGRAS_DO_CHAT}` }] },
        contents: mensagens.map((m) => ({
          role: m.papel,
          parts: [
            ...(m.imagens ?? []).map((i) => ({
              inlineData: { mimeType: i.mime, data: i.base64 },
            })),
            ...(m.texto.trim() ? [{ text: m.texto }] : []),
          ],
        })),
        generationConfig: {
          temperature: 0.7,
          // Raciocínio curto: o pedido é simples e a demora vinha daqui.
          ...(pensarPouco ? { thinkingConfig: { thinkingLevel: "low" } } : {}),
        },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });

  let res = await pedir(true);
  if (res.status === 400) {
    // Modelo que não aceita thinkingLevel: pede de novo sem ele.
    const corpo = await res.text();
    if (!/thinking/i.test(corpo)) throw new Error(`Gemini 400: ${corpo.slice(0, 300)}`);
    res = await pedir(false);
  }
  if (!res.ok || !res.body) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json().catch(() => ({}));
    throw new Error(`Gemini ${res.status}: ${String(data?.error?.message ?? "").slice(0, 300)}`);
  }

  // SSE do Gemini ("data: {json}") -> só o texto, sem as partes de raciocínio.
  const leitor = res.body.pipeThrough(new TextDecoderStream()).getReader();
  const codificador = new TextEncoder();
  let resto = "";
  let algum = false;
  return new ReadableStream<Uint8Array>({
    async pull(controle) {
      for (;;) {
        const { value, done } = await leitor.read();
        if (done) {
          if (!algum)
            controle.enqueue(codificador.encode("O Gemini não devolveu resposta. Tente de novo."));
          controle.close();
          return;
        }
        resto += value;
        const linhas = resto.split("\n");
        resto = linhas.pop() ?? "";
        let saiu = "";
        for (const linha of linhas) {
          if (!linha.startsWith("data:")) continue;
          try {
            const json = JSON.parse(linha.slice(5));
            for (const parte of json?.candidates?.[0]?.content?.parts ?? []) {
              if (parte?.thought || typeof parte?.text !== "string") continue;
              saiu += parte.text;
            }
          } catch {
            /* linha incompleta: ignora */
          }
        }
        if (saiu) {
          algum = true;
          controle.enqueue(codificador.encode(saiu));
          return;
        }
      }
    },
    cancel() {
      void leitor.cancel();
    },
  });
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
