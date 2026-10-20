// Quem recebeu um link pelo WhatsApp e se abriu. Lê na Evolution as mensagens
// que nós mandamos (/chat/findMessages, fromMe) desde uma data, procura o
// texto do link e cruza o número com os leads e com as sessões do vídeo.
// O texto das mensagens só é lido para achar o link: nada é guardado.
import type { SupabaseClient } from "@supabase/supabase-js";
import { chaveTelefone, evo } from "@/lib/whatsapp.server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EvoJson = any;

const POR_PAGINA = 100;
const MAX_PAGINAS = 40;

function timestampMs(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return n < 1e12 ? n * 1000 : n;
}

function textoDa(msg: EvoJson): string {
  const m = msg?.message ?? {};
  return String(
    m.conversation ??
      m.extendedTextMessage?.text ??
      m.imageMessage?.caption ??
      m.videoMessage?.caption ??
      "",
  );
}

function numeroDa(msg: EvoJson): string | null {
  const key = msg?.key ?? {};
  const jids = [key.remoteJid, key.remoteJidAlt, key.senderPn];
  const jid = jids.find((j) => typeof j === "string" && j.endsWith("@s.whatsapp.net"));
  return jid ? jid.replace(/@.*$/, "") : null;
}

export type EnvioDoLink = {
  chave: string | null;
  jid: string;
  enviado_em: string;
  lead_id: string | null;
  nome: string | null;
  coluna: string | null;
  faturamento: string | null;
  abriu: boolean;
  /** O lead mandou alguma mensagem depois do link. null = não deu para ler. */
  respondeu: boolean | null;
  deu_play: boolean;
  maximo_seg: number;
};

export async function quemRecebeuOLink(
  supabase: SupabaseClient,
  slug: string,
  desde: Date,
): Promise<{ paginas: number; lidas: number; envios: EnvioDoLink[] }> {
  // Primeiro envio do link para cada conversa.
  const porConversa = new Map<string, { numero: string | null; jid: string; em: number }>();
  let paginas = 0;
  let lidas = 0;
  for (let page = 1; page <= MAX_PAGINAS; page++) {
    const r = await evo("/chat/findMessages/{instance}", {
      method: "POST",
      body: { where: { key: { fromMe: true } }, page, offset: POR_PAGINA },
      timeoutMs: 30_000,
    });
    if (!r.ok) throw new Error(`Não consegui ler as mensagens (Evolution ${r.status})`);
    const registros: EvoJson[] = r.data?.messages?.records ?? [];
    paginas++;
    lidas += registros.length;
    let algumNoPeriodo = false;
    for (const msg of registros) {
      const em = timestampMs(msg?.messageTimestamp);
      if (!em || em < desde.getTime()) continue;
      algumNoPeriodo = true;
      if (!msg?.key?.fromMe || !textoDa(msg).includes(slug)) continue;
      const jid = String(msg.key.remoteJid ?? "");
      if (jid.endsWith("@g.us")) continue;
      const atual = porConversa.get(jid);
      if (!atual || em < atual.em) porConversa.set(jid, { numero: numeroDa(msg), jid, em });
    }
    const totalPaginas = Number(r.data?.messages?.pages ?? 0);
    if (registros.length < POR_PAGINA || (totalPaginas && page >= totalPaginas)) break;
    if (!algumNoPeriodo) break; // vem do mais novo para o mais antigo
  }

  const [{ data: leads }, { data: sessoes }] = await Promise.all([
    supabase.from("leads").select("id, nome, whatsapp, coluna, faturamento"),
    supabase
      .from("video_sessoes")
      .select("lead_id, whatsapp, deu_play, maximo_seg, video_links!inner(slug)")
      .eq("video_links.slug", slug),
  ]);
  const leadPorChave = new Map<string, NonNullable<typeof leads>[number]>();
  for (const l of leads ?? []) {
    const c = chaveTelefone(l.whatsapp ?? "");
    if (c) leadPorChave.set(c, l);
  }

  const envios: EnvioDoLink[] = [];
  for (const e of porConversa.values()) {
    const respondeu = await respondeuDepois(e.jid, e.em);
    const chave = e.numero ? chaveTelefone(e.numero) : null;
    const lead = chave ? (leadPorChave.get(chave) ?? null) : null;
    const minhas = (sessoes ?? []).filter(
      (s) =>
        (lead && s.lead_id === lead.id) ||
        (chave && s.whatsapp && chaveTelefone(String(s.whatsapp)) === chave),
    );
    envios.push({
      chave,
      jid: e.jid,
      enviado_em: new Date(e.em).toISOString(),
      lead_id: lead?.id ?? null,
      nome: lead?.nome ?? null,
      coluna: lead?.coluna ?? null,
      faturamento: lead?.faturamento ?? null,
      abriu: minhas.length > 0,
      respondeu,
      deu_play: minhas.some((s) => s.deu_play),
      maximo_seg: Math.max(0, ...minhas.map((s) => Number(s.maximo_seg ?? 0))),
    });
  }
  envios.sort((a, b) => a.enviado_em.localeCompare(b.enviado_em));
  return { paginas, lidas, envios };
}

/** Alguma mensagem do lead (fromMe = false) nessa conversa depois de `desde`. */
async function respondeuDepois(jid: string, desde: number): Promise<boolean | null> {
  const r = await evo("/chat/findMessages/{instance}", {
    method: "POST",
    body: { where: { key: { remoteJid: jid, fromMe: false } }, page: 1, offset: 50 },
    timeoutMs: 20_000,
  }).catch(() => null);
  if (!r?.ok) return null;
  const registros: EvoJson[] = r.data?.messages?.records ?? [];
  return registros.some(
    (m) =>
      !m?.key?.fromMe &&
      m?.key?.remoteJid === jid &&
      (timestampMs(m?.messageTimestamp) ?? 0) > desde,
  );
}
