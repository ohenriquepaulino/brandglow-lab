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
  return (await apiListLeadsComFollowup()).leads;
}

/** Leads + quando foi a última leitura de follow-up. */
export async function apiListLeadsComFollowup(): Promise<{
  leads: Lead[];
  followupLidoEm: string | null;
}> {
  const { data, followup_lido_em } = await call<{
    data: Lead[];
    followup_lido_em: string | null;
  }>({ action: "list_leads" });
  return { leads: data ?? [], followupLidoEm: followup_lido_em ?? null };
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
  valor_fechado?: number,
): Promise<void> {
  await call({ action: "update_column", id, coluna, coluna_origem, valor_fechado });
}

export async function apiUpdateValor(id: string, valor_fechado: number): Promise<void> {
  await call({ action: "update_valor", id, valor_fechado });
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
