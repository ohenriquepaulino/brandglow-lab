import { CRM_PASS } from "./crm-auth";

export type EstadoWhatsApp =
  | "conectado"
  | "conectando"
  | "desconectado"
  | "sem_instancia"
  | "nao_configurado";

export type WhatsAppConfig = { ativo: boolean; mensagem: string; atraso_segundos: number };

export type AvisoConfig = { aviso_ativo: boolean; aviso_grupo_nome: string | null };

export type WhatsAppEnvio = {
  id: string;
  lead_id: string | null;
  tipo: "boas_vindas" | "aviso";
  telefone: string;
  status: "pendente" | "enviando" | "enviado" | "erro";
  erro: string | null;
  criado_em: string;
  enviar_em: string;
  leads?: { nome: string } | null;
};

async function call<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/public/crm/whatsapp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-crm-token": CRM_PASS,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(json.error || `WhatsApp API error ${res.status}`);
  return json;
}

export async function apiWhatsAppGet() {
  const { data } = await call<{
    data: {
      config: (WhatsAppConfig & AvisoConfig) | null;
      envios: WhatsAppEnvio[];
      evolution_configurada: boolean;
    };
  }>({ action: "get" });
  return data;
}

export async function apiWhatsAppStatus() {
  const { data } = await call<{ data: { estado: EstadoWhatsApp; numero: string | null } }>({
    action: "status",
  });
  return data;
}

export async function apiWhatsAppConnect() {
  const { data } = await call<{ data: { qrcode: string | null; jaConectado: boolean } }>({
    action: "connect",
  });
  return data;
}

export async function apiWhatsAppDisconnect() {
  await call({ action: "disconnect" });
}

export async function apiWhatsAppSaveConfig(config: WhatsAppConfig) {
  await call({ action: "save_config", ...config });
}

export async function apiWhatsAppSendTest(telefone: string, mensagem: string) {
  await call({ action: "send_test", telefone, mensagem });
}

export async function apiWhatsAppEnviosDoLead(lead_id: string): Promise<WhatsAppEnvio[]> {
  const { data } = await call<{ data: WhatsAppEnvio[] }>({ action: "list_envios_lead", lead_id });
  return data ?? [];
}

export async function apiWhatsAppSaveAviso(aviso_ativo: boolean) {
  await call({ action: "save_aviso", aviso_ativo });
}

export async function apiWhatsAppTestAviso() {
  await call({ action: "test_aviso" });
}
