import type { Proposal } from "./types";
import { CRM_PASS } from "@/lib/crm-auth";

/** Campos que o CRM pode alterar numa proposta. */
export type ProposalPatch = Partial<
  Pick<
    Proposal,
    | "client_name"
    | "cover_label"
    | "show_diagnosis"
    | "diagnosis_moment"
    | "diagnosis_challenge"
    | "diagnosis_goal"
    | "price_total"
    | "installments"
    | "installments_note"
    | "cash_discount_pct"
    | "cash_note"
    | "deadline_days"
    | "valid_until"
  >
>;

function normalize(row: Record<string, unknown>): Proposal {
  return {
    ...(row as unknown as Proposal),
    price_total: Number(row.price_total ?? 0),
    cash_discount_pct: Number(row.cash_discount_pct ?? 0),
    installments: Number(row.installments ?? 1),
    deadline_days: Number(row.deadline_days ?? 40),
  };
}

/* ---------- Público (sem login) ---------- */

export async function getPublicProposal(slug: string): Promise<Proposal | null> {
  const res = await fetch("/api/public/proposta", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });
  if (!res.ok) throw new Error(`Proposta API error ${res.status}`);
  const { data } = (await res.json()) as { data: Record<string, unknown> | null };
  return data ? normalize(data) : null;
}

/* ---------- CRM (mesmo login e mesmo token das Tarefas) ---------- */

async function call<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/public/crm/proposals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-crm-token": CRM_PASS,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Proposals API error ${res.status}`);
  return (await res.json()) as T;
}

export async function listProposals(): Promise<Proposal[]> {
  const { data } = await call<{ data: Record<string, unknown>[] }>({ action: "list" });
  return (data ?? []).map(normalize);
}

export async function getProposal(id: string): Promise<Proposal | null> {
  const { data } = await call<{ data: Record<string, unknown> | null }>({ action: "get", id });
  return data ? normalize(data) : null;
}

export async function createProposal(client_name: string): Promise<Proposal> {
  const { data } = await call<{ data: Record<string, unknown> }>({ action: "create", client_name });
  return normalize(data);
}

export async function updateProposal(id: string, patch: ProposalPatch): Promise<Proposal> {
  const { data } = await call<{ data: Record<string, unknown> }>({ action: "update", id, patch });
  return normalize(data);
}

export async function duplicateProposal(id: string): Promise<Proposal> {
  const { data } = await call<{ data: Record<string, unknown> }>({ action: "duplicate", id });
  return normalize(data);
}

export async function deleteProposal(id: string): Promise<void> {
  await call({ action: "delete", id });
}
