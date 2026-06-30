import { CRM_PASS } from "./crm-auth";
import type { Lead, Movimentacao } from "./crm-auth";

async function call<T = any>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/public/crm/data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-crm-token": CRM_PASS,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`CRM API error ${res.status}`);
  return (await res.json()) as T;
}

export async function apiListLeads(): Promise<Lead[]> {
  const { data } = await call<{ data: Lead[] }>({ action: "list_leads" });
  return data ?? [];
}

export async function apiListHistorico(lead_id: string): Promise<Movimentacao[]> {
  const { data } = await call<{ data: Movimentacao[] }>({
    action: "list_historico",
    lead_id,
  });
  return data ?? [];
}

export async function apiUpdateColumn(
  id: string,
  coluna: string,
  coluna_origem: string,
): Promise<void> {
  await call({ action: "update_column", id, coluna, coluna_origem });
}

export async function apiUpdateAnotacoes(id: string, anotacoes: string): Promise<Lead | null> {
  const { data } = await call<{ data: Lead | null }>({
    action: "update_anotacoes",
    id,
    anotacoes,
  });
  return data;
}

export async function apiDeleteLead(id: string): Promise<void> {
  await call({ action: "delete_lead", id });
}
