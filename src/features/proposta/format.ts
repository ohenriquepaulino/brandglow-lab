import type { Proposal } from "./types";

const brlFull = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** R$ 8.000,00 */
export const brl = (n: number) => brlFull.format(Number.isFinite(n) ? n : 0);

/** 8.000,00 (sem símbolo) */
export const brlNumber = (n: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Number.isFinite(n) ? n : 0,
  );

/** 4.000 quando inteiro, 4.166,67 quando tem centavos */
export const brlShort = (n: number) => {
  const v = Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
  return Number.isInteger(v)
    ? new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(v)
    : brlNumber(v);
};

/** Converte "8.000,50", "8000.5" ou "R$ 8.000" em número. Retorna NaN se inválido. */
export function parseBrl(input: string): number {
  const s = input.replace(/[^\d,.-]/g, "").trim();
  if (!s) return NaN;
  // "9.500" e "1.250.000" usam ponto como separador de milhar (pt-BR).
  const thousandsOnly = /^-?\d{1,3}(\.\d{3})+$/.test(s);
  const normalized = s.includes(",") || thousandsOnly ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function pricing(p: Pick<Proposal, "price_total" | "installments" | "cash_discount_pct">) {
  const total = Math.max(0, Number(p.price_total) || 0);
  const installments = Math.min(12, Math.max(1, Math.round(Number(p.installments) || 1)));
  const pct = Math.min(100, Math.max(0, Number(p.cash_discount_pct) || 0));
  return {
    total,
    installments,
    installmentValue: round2(total / installments),
    pct,
    cashValue: round2(total * (1 - pct / 100)),
    hasDiscount: pct > 0,
    showInstallments: installments > 1,
  };
}

/** Data AAAA-MM-DD interpretada como fim do dia local (evita o bug de fuso do new Date("2026-10-15")). */
export function parseLocalDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59);
}

export const fmtDate = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function validity(iso: string | null, now = new Date()) {
  const d = parseLocalDate(iso);
  if (!d) return { date: null as Date | null, days: Infinity, expired: false };
  const days = Math.ceil((d.getTime() - now.getTime()) / 864e5);
  return { date: d, days, expired: d.getTime() < now.getTime() };
}

export function addDaysISO(days: number, from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** "Clínica Aurora" -> "clinica-aurora-7k2f" (sufixo aleatório para o link não ser adivinhável) */
export function makeSlug(name: string) {
  const base =
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "proposta";
  const rand = Math.random().toString(36).slice(2, 6).padEnd(4, "0");
  return `${base}-${rand}`;
}

export const isValidSlug = (s: string) =>
  /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && s.length >= 3 && s.length <= 80;

/** Só dígitos; aceita 12 ou 13 dígitos (55 + DDD + número). */
export function normalizeWhatsapp(v: string) {
  const d = v.replace(/\D/g, "");
  return d.length ? d : "";
}
export const isValidWhatsapp = (v: string) => /^[0-9]{12,13}$/.test(v);
