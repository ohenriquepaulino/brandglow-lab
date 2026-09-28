import { CRM_PASS } from "./crm-auth";

export type AbNumeros = {
  visitantes: number;
  visitas: number;
  leads: number;
  qualificados: number;
  avancados: number;
};

export type AbResumo = {
  inicio: string | null;
  desde: string;
  campanha: string | null;
  campanhas: string[];
  variantes: { a: AbNumeros; b: AbNumeros };
};

export async function apiAbResumo(filtro: { desde?: string | null; campanha?: string | null }) {
  const res = await fetch("/api/public/crm/ab", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-crm-token": CRM_PASS },
    body: JSON.stringify({ action: "resumo", ...filtro }),
  });
  const json = (await res.json().catch(() => ({}))) as AbResumo & { error?: string };
  if (!res.ok) throw new Error(json.error || `A/B API error ${res.status}`);
  return json;
}
