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
 * Gatilho do cadastro: se a automação estiver ativa, manda a mensagem e grava
 * o resultado em whatsapp_envios. Nunca lança — o cadastro do lead não pode
 * falhar por causa do WhatsApp.
 */
export async function enviarBoasVindas(
  supabase: SupabaseClient,
  lead: { id: string | null; nome: string; whatsapp: string },
) {
  try {
    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("ativo, mensagem")
      .eq("id", 1)
      .maybeSingle();
    if (!config?.ativo || !config.mensagem?.trim()) return;

    const telefone = normalizarTelefone(lead.whatsapp);
    const mensagem = montarMensagem(config.mensagem, lead.nome);
    let erro: string | null = null;
    try {
      await enviarTexto(telefone, mensagem);
    } catch (e) {
      erro = e instanceof Error ? e.message : String(e);
      console.error("[whatsapp] envio falhou", erro);
    }

    await supabase.from("whatsapp_envios").insert({
      lead_id: lead.id,
      telefone,
      mensagem,
      status: erro ? "erro" : "enviado",
      erro,
    });
  } catch (e) {
    console.error("[whatsapp] boas-vindas error", e);
  }
}
