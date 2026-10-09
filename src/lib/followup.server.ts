// Follow-up a partir do WhatsApp. Lê na Evolution a última mensagem de cada
// conversa (uma chamada só, /chat/findChats) e marca os leads que precisam de
// atenção. Também monta e envia o resumo das 8h no grupo do aviso.
// O conteúdo das mensagens não é lido nem guardado — só quem mandou e quando.
import type { SupabaseClient } from "@supabase/supabase-js";
import { COLUNAS, normalizeColuna } from "@/lib/crm-auth";
import {
  COLUNAS_FOLLOWUP,
  FOLLOWUP_INFO,
  classificar,
  detalheFollowup,
  type FollowupTipo,
} from "@/lib/followup";
import {
  SITE_URL,
  chaveTelefone,
  enviarImagem,
  enviarTexto,
  evo,
  grupoDoAviso,
} from "@/lib/whatsapp.server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EvoJson = any;

type UltimaMensagem = { em: number; de: "lead" | "nos" };

/** messageTimestamp vem em segundos (às vezes como string). */
function timestampMs(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return n < 1e12 ? n * 1000 : n;
}

/** Números (só dígitos) que identificam a conversa. Grupos e status ficam de fora. */
function numerosDaConversa(chat: EvoJson): string[] {
  const key = chat?.lastMessage?.key ?? {};
  const jids = [chat?.remoteJid, key.remoteJid, key.remoteJidAlt, key.senderPn];
  if (jids.some((j) => typeof j === "string" && (j.endsWith("@g.us") || j.includes("broadcast")))) {
    return [];
  }
  return jids
    .filter((j): j is string => typeof j === "string" && j.endsWith("@s.whatsapp.net"))
    .map((j) => j.replace(/@.*$/, ""));
}

/** Última mensagem de cada conversa, indexada por DDD + 8 últimos dígitos. */
async function ultimasMensagens(): Promise<Map<string, UltimaMensagem>> {
  const r = await evo("/chat/findChats/{instance}", { method: "POST", body: {}, timeoutMs: 30_000 });
  if (!r.ok || !Array.isArray(r.data)) {
    throw new Error(`Não consegui ler as conversas do WhatsApp (Evolution ${r.status})`);
  }
  const mapa = new Map<string, UltimaMensagem>();
  for (const chat of r.data as EvoJson[]) {
    const em = timestampMs(chat?.lastMessage?.messageTimestamp);
    if (!em) continue;
    const de = chat.lastMessage?.key?.fromMe ? "nos" : "lead";
    for (const numero of numerosDaConversa(chat)) {
      const chave = chaveTelefone(numero);
      if (!chave) continue;
      // A mesma pessoa pode aparecer em duas conversas (@lid e número): vale a mais recente.
      const atual = mapa.get(chave);
      if (!atual || em > atual.em) mapa.set(chave, { em, de });
    }
  }
  return mapa;
}

export type ItemFollowup = {
  lead_id: string;
  nome: string;
  coluna: string;
  tipo: FollowupTipo;
  ultima_msg_em: string;
  ultima_de: "lead" | "nos";
};

export type Leitura = {
  itens: ItemFollowup[];
  /** Última mensagem de todo lead ativo com conversa (com ou sem tag). */
  ultimas: Map<string, UltimaMensagem>;
  ativos: number;
  semConversa: number;
};

/** Lê o WhatsApp e regrava as tags (substitui a leitura anterior inteira). */
export async function lerFollowups(supabase: SupabaseClient): Promise<Leitura> {
  const [mensagens, { data: leads, error }] = await Promise.all([
    ultimasMensagens(),
    supabase.from("leads").select("id, nome, whatsapp, coluna"),
  ]);
  if (error) throw new Error(error.message);

  const agora = Date.now();
  const itens: ItemFollowup[] = [];
  const ultimas = new Map<string, UltimaMensagem>();
  let ativos = 0;
  let semConversa = 0;

  for (const lead of leads ?? []) {
    const coluna = normalizeColuna(lead.coluna);
    if (!COLUNAS_FOLLOWUP.includes(coluna)) continue;
    ativos++;
    const chave = chaveTelefone(lead.whatsapp ?? "");
    const ultima = chave ? mensagens.get(chave) : undefined;
    if (!ultima) {
      semConversa++;
      continue;
    }
    ultimas.set(lead.id, ultima);
    const tipo = classificar(ultima.de, agora - ultima.em);
    if (!tipo) continue;
    itens.push({
      lead_id: lead.id,
      nome: lead.nome,
      coluna,
      tipo,
      ultima_msg_em: new Date(ultima.em).toISOString(),
      ultima_de: ultima.de,
    });
  }

  const lidoEm = new Date(agora).toISOString();
  const { error: errDel } = await supabase
    .from("followup_leads")
    .delete()
    .not("lead_id", "is", null);
  if (errDel) throw new Error(errDel.message);
  if (itens.length > 0) {
    const { error: errIns } = await supabase.from("followup_leads").insert(
      itens.map((i) => ({
        lead_id: i.lead_id,
        tipo: i.tipo,
        ultima_msg_em: i.ultima_msg_em,
        ultima_de: i.ultima_de,
        lido_em: lidoEm,
      })),
    );
    if (errIns) throw new Error(errIns.message);
  }
  await supabase.from("whatsapp_config").update({ followup_lido_em: lidoEm }).eq("id", 1);

  return { itens, ultimas, ativos, semConversa };
}

// ─── Resumo das 8h no grupo ──────────────────────────────────────────────────

const IMAGEM_RESUMO = `${SITE_URL}/whatsapp/followup-do-dia.png`;
const MAX_POR_SECAO = 10;
// Brasília é UTC-3 o ano todo (sem horário de verão desde 2019).
const BRASILIA_OFFSET_MS = -3 * 60 * 60_000;
const DIAS_SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function hojeEmBrasilia(agora: number) {
  const local = new Date(agora + BRASILIA_OFFSET_MS);
  const data = local.toISOString().slice(0, 10);
  const [, mes, dia] = data.split("-");
  return { data, rotulo: `${DIAS_SEMANA[local.getUTCDay()]}, ${dia}/${mes}` };
}

const NOME_COLUNA = new Map<string, string>(COLUNAS.map((c) => [c.id, c.label]));

export function montarResumo(
  itens: ItemFollowup[],
  rotuloDia: string,
  anterior: { andaram: number; total: number } | null,
  agora: number,
): string {
  const linhas = [`*☐ FOLLOW-UP DO DIA · ${rotuloDia}*`];

  if (itens.length === 0) {
    linhas.push("", "Nenhum follow-up pendente hoje. 🎉");
  }
  for (const tipo of ["responder", "cobrar", "puxar"] as FollowupTipo[]) {
    // Quem espera há mais tempo primeiro.
    const doTipo = itens
      .filter((i) => i.tipo === tipo)
      .sort((a, b) => a.ultima_msg_em.localeCompare(b.ultima_msg_em));
    if (doTipo.length === 0) continue;
    const info = FOLLOWUP_INFO[tipo];
    linhas.push("", `*${info.emoji} ${info.titulo}* _(${info.dica})_`);
    for (const i of doTipo.slice(0, MAX_POR_SECAO)) {
      const idade = agora - new Date(i.ultima_msg_em).getTime();
      const coluna = NOME_COLUNA.get(i.coluna) ?? i.coluna;
      linhas.push(`☐ ${i.nome.trim()} · ${coluna} · ${detalheFollowup(tipo, idade)}`);
    }
    if (doTipo.length > MAX_POR_SECAO) {
      linhas.push(`_…e mais ${doTipo.length - MAX_POR_SECAO} no CRM_`);
    }
  }

  if (anterior && anterior.total > 0) {
    linhas.push(
      "",
      `✅ Da última lista: ${anterior.andaram} de ${anterior.total} ${
        anterior.total === 1 ? "conversa andou" : "conversas andaram"
      }`,
    );
  }
  if (itens.length > 0) {
    linhas.push(
      "",
      `${itens.length} ${itens.length === 1 ? "tarefa" : "tarefas"} para hoje. Abrir o CRM: ${SITE_URL.replace(/^https?:\/\//, "")}/crm/kanban`,
    );
  }
  return linhas.join("\n");
}

/**
 * Lê os follow-ups e manda o resumo no grupo do aviso. Uma vez por dia: se o
 * resumo de hoje já saiu, não faz nada. `forcar` é o teste do CRM: envia
 * sempre e não fica registrado como o resumo do dia.
 */
export async function enviarResumoFollowup(
  supabase: SupabaseClient,
  { forcar = false }: { forcar?: boolean } = {},
) {
  const agora = Date.now();
  const hoje = hojeEmBrasilia(agora);

  if (!forcar) {
    const { data: jaEnviado } = await supabase
      .from("followup_resumos")
      .select("data")
      .eq("data", hoje.data)
      .maybeSingle();
    if (jaEnviado) return { enviado: false, motivo: "O resumo de hoje já foi enviado" };
  }

  const leitura = await lerFollowups(supabase);

  // Da lista anterior: quantas conversas tiveram mensagem nova depois dela.
  const { data: ultimoResumo } = await supabase
    .from("followup_resumos")
    .select("enviado_em, itens")
    .lt("data", hoje.data)
    .order("data", { ascending: false })
    .limit(1)
    .maybeSingle();
  let anterior: { andaram: number; total: number } | null = null;
  if (ultimoResumo && Array.isArray(ultimoResumo.itens)) {
    const desde = new Date(ultimoResumo.enviado_em).getTime();
    const ids = (ultimoResumo.itens as { lead_id: string }[]).map((i) => i.lead_id);
    anterior = {
      total: ids.length,
      andaram: ids.filter((id) => (leitura.ultimas.get(id)?.em ?? 0) > desde).length,
    };
  }

  const texto = montarResumo(leitura.itens, hoje.rotulo, anterior, agora);
  const grupo = await grupoDoAviso(supabase);
  try {
    await enviarImagem(grupo, IMAGEM_RESUMO, texto);
  } catch (e) {
    // Sem a imagem (ex.: site ainda não publicado), o texto chega do mesmo jeito.
    console.error("[followup] imagem falhou, enviando só o texto", e);
    await enviarTexto(grupo, texto);
  }

  // O envio de teste não conta como o resumo do dia.
  if (forcar) return { enviado: true, itens: leitura.itens.length };
  await supabase.from("followup_resumos").upsert({
    data: hoje.data,
    enviado_em: new Date(agora).toISOString(),
    itens: leitura.itens.map((i) => ({ lead_id: i.lead_id, tipo: i.tipo })),
  });
  return { enviado: true, itens: leitura.itens.length };
}
