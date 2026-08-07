export const CRM_USER = "legacybrandco";
export const CRM_PASS = "Henrique05!!.";

const CRM_USERS: { user: string; pass: string }[] = [
  { user: CRM_USER, pass: CRM_PASS },
  { user: "lais", pass: "Henrique05!!." },
];

const KEY = "lbc_crm_auth";

export function isCrmAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(KEY) === "1";
}

export function crmLogin(user: string, pass: string): boolean {
  const u = user.trim().toLowerCase();
  const ok = CRM_USERS.some((c) => c.user.toLowerCase() === u && c.pass === pass);
  if (ok) {
    sessionStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}


export function crmLogout() {
  sessionStorage.removeItem(KEY);
}

export const COLUNAS = [
  { id: "novo-lead", label: "Novo lead", accent: "#D75631" },
  { id: "contato-feito", label: "Contato feito", accent: "#121110" },
  { id: "em-qualificacao", label: "Em qualificação", accent: "#121110" },
  { id: "proposta-enviada", label: "Proposta enviada", accent: "#121110" },
  { id: "fechado", label: "Fechado", accent: "#CFFF87" },
  { id: "perdido", label: "Perdido", accent: "#AAAAAA" },
] as const;

export type ColunaId = (typeof COLUNAS)[number]["id"];

export type Lead = {
  id: string;
  nome: string;
  whatsapp: string;
  instagram: string | null;
  faturamento: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  coluna: string;
  anotacoes: string | null;
  criado_em: string;
};

export type Movimentacao = {
  id: string;
  lead_id: string;
  coluna_origem: string;
  coluna_destino: string;
  movido_em: string;
};

export const SEM_FATURAMENTO = "Ainda não estou faturando";

export function isSemFaturamento(lead: { faturamento: string | null }): boolean {
  return (lead.faturamento ?? "").trim().toLowerCase() === SEM_FATURAMENTO.toLowerCase();
}

export function whatsappDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function whatsappHref(value: string): string {
  const digits = whatsappDigits(value);
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

export function instagramHandle(value: string): string {
  return value.replace(/^@/, "").trim();
}

export function instagramHref(value: string): string {
  return `https://instagram.com/${instagramHandle(value)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR");
}
