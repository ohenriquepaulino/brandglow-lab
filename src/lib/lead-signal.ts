// Sinal de faturamento enviado ao Meta junto com o evento Lead (pixel e CAPI).
// Não muda quando o Lead dispara: só acrescenta parâmetros ao mesmo evento,
// com o mesmo event_id (a deduplicação continua igual).
//
// value é um peso relativo por faixa, não um preço: diz ao Meta que um lead
// acima de R$ 20 mil/mês vale mais que um de até R$ 6 mil.
// faixa_faturamento e lead_10k servem para conversões personalizadas
// (ex.: "Lead 10k+" = Lead com lead_10k igual a "sim").
const FAIXAS: Record<string, { faixa: string; value: number; lead10k: boolean }> = {
  "Até R$ 6.000": { faixa: "ate_6k", value: 1, lead10k: false },
  "De R$ 6.000 a R$ 10.000": { faixa: "6k_10k", value: 2, lead10k: false },
  "De R$ 10.000 a R$ 20.000": { faixa: "10k_20k", value: 4, lead10k: true },
  "Acima de R$ 20.000": { faixa: "acima_20k", value: 6, lead10k: true },
};

export type LeadSignal = {
  faixa_faturamento: string;
  lead_10k: "sim" | "nao";
  value: number;
  currency: "BRL";
};

/** Parâmetros do Lead para a faixa informada. Faixa desconhecida: null (Lead vai sem parâmetros, como antes). */
export function leadSignal(faturamento: string | null | undefined): LeadSignal | null {
  const f = FAIXAS[(faturamento ?? "").trim()];
  if (!f) return null;
  return {
    faixa_faturamento: f.faixa,
    lead_10k: f.lead10k ? "sim" : "nao",
    value: f.value,
    currency: "BRL",
  };
}

// O formulário guarda a faixa aqui antes de ir para /obrigado, onde o Lead do
// navegador dispara. sessionStorage (e não a URL) para não mexer no link da
// página de obrigado, que é a regra da conversão personalizada "Lead lbc".
const STORAGE_KEY = "lb_lead_faturamento";

export function saveLeadFaturamento(faturamento: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, faturamento);
  } catch {
    // sem storage: o Lead segue sem parâmetros
  }
}

export function readLeadFaturamento(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
