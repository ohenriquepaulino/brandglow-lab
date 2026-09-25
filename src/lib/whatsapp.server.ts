// WhatsApp de boas-vindas via Evolution API. Só roda no servidor (server
// routes): usa EVOLUTION_API_URL / EVOLUTION_API_KEY, que nunca vão pro browser.
//
// Uma instância só (o número da Legacy). Nome fixo, trocável por
// EVOLUTION_INSTANCE se um dia precisar.
import type { SupabaseClient } from "@supabase/supabase-js";

const TIMEOUT_MS = 10_000;

// O formato das respostas da Evolution muda entre versões; lemos campo a campo
// com optional chaining em vez de tipar cada variante.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EvoJson = any;

function evoConfig() {
  const url = process.env.EVOLUTION_API_URL;
  const key = process.env.EVOLUTION_API_KEY;
  if (!url || !key) return null;
  return {
    baseUrl: url.replace(/\/$/, ""),
    key,
    instance: process.env.EVOLUTION_INSTANCE || "legacy-brandco",
  };
}

async function evo(path: string, init: { method?: string; body?: unknown } = {}) {
  const cfg = evoConfig();
  if (!cfg)
    throw new Error("Evolution API não configurada (EVOLUTION_API_URL / EVOLUTION_API_KEY)");
  const res = await fetch(`${cfg.baseUrl}${path.replace("{instance}", cfg.instance)}`, {
    method: init.method ?? "GET",
    headers: { apikey: cfg.key, "Content-Type": "application/json" },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: data as EvoJson };
}

export function evolutionConfigurada() {
  return evoConfig() !== null;
}

function extractQr(data: EvoJson): string | null {
  return data?.qrcode?.base64 || data?.base64 || data?.qrcode?.code || data?.code || null;
}

export type EstadoConexao = "conectado" | "conectando" | "desconectado" | "sem_instancia";

export async function estadoDaConexao(): Promise<{ estado: EstadoConexao; numero: string | null }> {
  const r = await evo("/instance/connectionState/{instance}");
  if (r.status === 404) return { estado: "sem_instancia", numero: null };
  const state = r.data?.instance?.state || r.data?.state;
  if (state !== "open") {
    return { estado: state === "connecting" ? "conectando" : "desconectado", numero: null };
  }
  // Número conectado: a Evolution devolve em formatos diferentes por versão.
  let numero: string | null = null;
  try {
    const cfg = evoConfig()!;
    const list = await evo(
      `/instance/fetchInstances?instanceName=${encodeURIComponent(cfg.instance)}`,
    );
    const inst = Array.isArray(list.data) ? list.data[0] : list.data;
    const raw =
      inst?.ownerJid || inst?.instance?.owner || inst?.instance?.wuid || inst?.number || null;
    if (raw) numero = String(raw).replace(/@.*$/, "").replace(/\D/g, "") || null;
  } catch {
    // número é só informativo
  }
  return { estado: "conectado", numero };
}

/** Cria a instância se não existir e devolve o QR para escanear. */
export async function conectar(): Promise<{ qrcode: string | null; jaConectado: boolean }> {
  const cfg = evoConfig();
  if (!cfg) throw new Error("Evolution API não configurada");

  const atual = await estadoDaConexao();
  if (atual.estado === "conectado") return { qrcode: null, jaConectado: true };

  if (atual.estado === "sem_instancia") {
    const created = await evo("/instance/create", {
      method: "POST",
      body: { instanceName: cfg.instance, qrcode: true, integration: "WHATSAPP-BAILEYS" },
    });
    const qr = extractQr(created.data);
    if (qr) return { qrcode: qr, jaConectado: false };
    // 403 "already in use": a instância existe, segue para o connect.
    if (!created.ok && created.status !== 403) {
      throw new Error(`Falha ao criar instância (${created.status})`);
    }
  }

  const conn = await evo("/instance/connect/{instance}");
  return { qrcode: extractQr(conn.data), jaConectado: false };
}

export async function desconectar() {
  await evo("/instance/logout/{instance}", { method: "DELETE" });
}

/** "(11) 98888-7777" -> "5511988887777". */
export function normalizarTelefone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length <= 11 ? `55${digits}` : digits;
}

export function montarMensagem(template: string, nome: string): string {
  const primeiro = nome.trim().split(/\s+/)[0] ?? "";
  const primeiroFmt = primeiro ? primeiro[0].toUpperCase() + primeiro.slice(1).toLowerCase() : "";
  return template.replace(/\{primeiro-nome\}/g, primeiroFmt).replace(/\{nome\}/g, nome.trim());
}

export async function enviarTexto(telefone: string, texto: string) {
  const r = await evo("/message/sendText/{instance}", {
    method: "POST",
    body: { number: telefone, text: texto },
  });
  if (!r.ok) {
    const detalhe = JSON.stringify(r.data?.response?.message ?? r.data?.message ?? r.data).slice(
      0,
      300,
    );
    throw new Error(`Evolution ${r.status}: ${detalhe}`);
  }
}

/**
 * Id do grupo de aviso ("...@g.us"). O grupo é definido pelo link de convite
 * guardado em whatsapp_config.aviso_grupo_convite — só no banco, nunca no
 * código (o repo é público e o link deixa qualquer um entrar no grupo).
 * Na primeira vez resolve o id pela Evolution e guarda; depois só lê.
 */
export async function grupoDoAviso(supabase: SupabaseClient): Promise<string> {
  const { data: config } = await supabase
    .from("whatsapp_config")
    .select("aviso_grupo_id, aviso_grupo_convite")
    .eq("id", 1)
    .maybeSingle();
  if (config?.aviso_grupo_id) return config.aviso_grupo_id;

  const codigo = String(config?.aviso_grupo_convite ?? "")
    .trim()
    .replace(/^https?:\/\/chat\.whatsapp\.com\//, "")
    .replace(/[/?#].*$/, "");
  if (!codigo) throw new Error("Link do grupo de aviso não configurado");

  const r = await evo(`/group/inviteInfo/{instance}?inviteCode=${encodeURIComponent(codigo)}`);
  const id: unknown = r.data?.id;
  if (!r.ok || typeof id !== "string" || !id.endsWith("@g.us")) {
    throw new Error(`Não consegui identificar o grupo pelo link (Evolution ${r.status})`);
  }
  await supabase
    .from("whatsapp_config")
    .update({ aviso_grupo_id: id, aviso_grupo_nome: r.data?.subject ?? null })
    .eq("id", 1);
  return id;
}

export function montarAviso(nome: string, telefone: string): string {
  return `🔔 *NOVO LEAD NO CRM*\n${nome.trim()}\nhttps://wa.me/${telefone}`;
}

/**
 * Gatilho do cadastro. Agenda até duas mensagens em whatsapp_envios
 * (status 'pendente'), que processarFila envia pelo pg_cron:
 *   - boas-vindas para o lead, daqui a `atraso_segundos`;
 *   - aviso "NOVO LEAD NO CRM" no grupo escolhido, na hora.
 * Nunca lança — o cadastro do lead não pode falhar por causa do WhatsApp.
 */
export async function agendarMensagensDoLead(
  supabase: SupabaseClient,
  lead: { id: string | null; nome: string; whatsapp: string },
) {
  try {
    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("ativo, mensagem, atraso_segundos, aviso_ativo")
      .eq("id", 1)
      .maybeSingle();
    if (!config) return;

    const telefone = normalizarTelefone(lead.whatsapp);
    const agora = Date.now();
    const envios = [];

    if (config.ativo && config.mensagem?.trim()) {
      envios.push({
        lead_id: lead.id,
        tipo: "boas_vindas",
        telefone,
        mensagem: montarMensagem(config.mensagem, lead.nome),
        status: "pendente",
        enviar_em: new Date(agora + (config.atraso_segundos ?? 30) * 1000).toISOString(),
      });
    }
    if (config.aviso_ativo) {
      envios.push({
        lead_id: lead.id,
        tipo: "aviso",
        telefone: await grupoDoAviso(supabase).catch((e) => {
          console.error("[whatsapp] grupo do aviso", e);
          return null;
        }),
        mensagem: montarAviso(lead.nome, telefone),
        status: "pendente",
        enviar_em: new Date(agora).toISOString(),
      });
    }
    // Sem grupo resolvido o aviso não tem para onde ir: fica de fora.
    const validos = envios.filter((e) => e.telefone);
    if (validos.length === 0) return;

    const { error } = await supabase.from("whatsapp_envios").insert(validos);
    if (error) console.error("[whatsapp] agendar falhou", error.message);
  } catch (e) {
    console.error("[whatsapp] agendar error", e);
  }
}

/** Envia os pendentes vencidos. Chamada pelo cron a cada ~10s. */
export async function processarFila(supabase: SupabaseClient) {
  // Envio que ficou "enviando" por mais de 2 min: a chamada morreu no meio.
  // Marca como erro em vez de reenviar — melhor não chegar do que chegar duas vezes.
  await supabase
    .from("whatsapp_envios")
    .update({ status: "erro", erro: "Envio interrompido" })
    .eq("status", "enviando")
    .lt("enviar_em", new Date(Date.now() - 2 * 60_000).toISOString());

  const { data: vencidos } = await supabase
    .from("whatsapp_envios")
    .select("id, telefone, mensagem")
    .eq("status", "pendente")
    .lte("enviar_em", new Date().toISOString())
    .order("enviar_em", { ascending: true })
    .limit(10);

  let enviados = 0;
  for (const envio of vencidos ?? []) {
    // Trava otimista: se duas chamadas do cron se sobrepõem, só uma pega o envio.
    const { data: travado } = await supabase
      .from("whatsapp_envios")
      .update({ status: "enviando" })
      .eq("id", envio.id)
      .eq("status", "pendente")
      .select("id")
      .maybeSingle();
    if (!travado) continue;

    let erro: string | null = null;
    try {
      await enviarTexto(envio.telefone, envio.mensagem);
      enviados++;
    } catch (e) {
      erro = e instanceof Error ? e.message : String(e);
      console.error("[whatsapp] envio falhou", erro);
    }
    await supabase
      .from("whatsapp_envios")
      .update({ status: erro ? "erro" : "enviado", erro })
      .eq("id", envio.id);
  }
  return { vencidos: vencidos?.length ?? 0, enviados };
}

// ─── Lead respondeu -> "Conversando" ─────────────────────────────────────────

// Domínio publicado. O webhook aponta sempre para cá, mesmo que o CRM seja
// aberto pelo preview do Lovable (o mesmo endereço do pg_cron).
const SITE_URL = "https://legacybc.com.br";

/** Colunas de onde uma resposta do lead move o card. Mais adiante, não mexe. */
const COLUNAS_ANTES_DE_CONVERSAR = ["novo-lead", "aguardando-resposta", "contato-feito"];
const COLUNA_CONVERSANDO = "conversando";

/**
 * Registra na Evolution o webhook de mensagens recebidas, uma vez. Chamada
 * quando o CRM vê o número conectado; o flag é zerado ao reconectar.
 */
export async function garantirWebhook(supabase: SupabaseClient) {
  const { data: config } = await supabase
    .from("whatsapp_config")
    .select("webhook_token, webhook_registrado")
    .eq("id", 1)
    .maybeSingle();
  if (!config?.webhook_token || config.webhook_registrado) return;

  const r = await evo("/webhook/set/{instance}", {
    method: "POST",
    body: {
      webhook: {
        enabled: true,
        url: `${SITE_URL}/api/public/whatsapp/webhook?token=${config.webhook_token}`,
        webhookByEvents: false,
        webhookBase64: false,
        events: ["MESSAGES_UPSERT"],
      },
    },
  });
  if (!r.ok) throw new Error(`Evolution ${r.status} ao registrar webhook`);
  await supabase.from("whatsapp_config").update({ webhook_registrado: true }).eq("id", 1);
}

/**
 * DDD + 8 últimos dígitos: casa "(11) 98888-7777" do formulário com o JID
 * "551188887777@s.whatsapp.net" (o WhatsApp às vezes omite o 9º dígito).
 */
function chaveTelefone(raw: string): string | null {
  let d = raw.replace(/\D/g, "");
  if (d.length >= 12 && d.startsWith("55")) d = d.slice(2);
  if (d.length < 10) return null;
  return d.slice(0, 2) + d.slice(-8);
}

/** Número de quem mandou a mensagem, ou null (grupo, status, próprio número). */
function remetente(msg: EvoJson): string | null {
  const key = msg?.key ?? {};
  if (key.fromMe) return null;
  const jid = String(key.remoteJid ?? "");
  if (jid.endsWith("@g.us") || jid.endsWith("@broadcast")) return null;
  // No endereçamento novo (@lid) o número vem em remoteJidAlt / senderPn.
  const candidatos = [jid, key.remoteJidAlt, key.senderPn].filter(
    (j): j is string => typeof j === "string" && j.endsWith("@s.whatsapp.net"),
  );
  return candidatos[0]?.replace(/@.*$/, "") ?? null;
}

/**
 * Webhook MESSAGES_UPSERT: se quem mandou é um lead em Oportunidades /
 * Aguardando resposta, move o card para Conversando e registra no histórico.
 * O conteúdo da mensagem não é lido nem guardado — só o número.
 */
export async function moverLeadsQueResponderam(supabase: SupabaseClient, payload: EvoJson) {
  const evento = String(payload?.event ?? "").toLowerCase();
  if (!evento.includes("messages.upsert") && !evento.includes("messages_upsert")) return 0;

  const mensagens: EvoJson[] = Array.isArray(payload?.data) ? payload.data : [payload?.data];
  const chaves = new Set(
    mensagens
      .map(remetente)
      .map((n) => (n ? chaveTelefone(n) : null))
      .filter((c): c is string => !!c),
  );
  if (chaves.size === 0) return 0;

  const { data: leads } = await supabase
    .from("leads")
    .select("id, whatsapp, coluna")
    .in("coluna", COLUNAS_ANTES_DE_CONVERSAR);

  let movidos = 0;
  for (const lead of leads ?? []) {
    const chave = chaveTelefone(lead.whatsapp ?? "");
    if (!chave || !chaves.has(chave)) continue;

    const { data: movido } = await supabase
      .from("leads")
      .update({ coluna: COLUNA_CONVERSANDO })
      .eq("id", lead.id)
      .eq("coluna", lead.coluna) // se alguém moveu no meio tempo, não sobrescreve
      .select("id")
      .maybeSingle();
    if (!movido) continue;

    await supabase.from("historico_movimentacoes").insert({
      lead_id: lead.id,
      coluna_origem: lead.coluna,
      coluna_destino: COLUNA_CONVERSANDO,
    });
    movidos++;
  }
  return movidos;
}
