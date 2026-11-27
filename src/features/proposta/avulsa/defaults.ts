import { DEFAULT_CASE_ORDER } from "../defaults";

export interface AvulsaItem {
  title: string;
  text: string;
}

/** Conteúdo editável de uma proposta avulsa. O que estiver salvo no banco sobrescreve isto. */
export interface AvulsaData {
  client_name: string;
  cover_label: string;
  entregas_kicker: string;
  entregas_title: string;
  entregas_lead: string;
  entregas: AvulsaItem[];
  bonus_title: string;
  bonus: AvulsaItem[];
  show_cases: boolean;
  case_slugs: string[];
  cases_title: string;
  show_price: boolean;
  price_total: number;
  cash_discount_pct: number;
  cash_note: string;
  installments_note: string;
  show_card: boolean;
  end_title: string;
  end_text: string;
}

export const DRA_DEFAULTS: AvulsaData = {
  client_name: "Smantjie",
  cover_label: "Proposta de Construção de Marca",
  entregas_kicker: "O que podemos entregar",
  entregas_title: "Uma marca completa, da estratégia ao digital",
  entregas_lead:
    "Construímos a sua marca de ponta a ponta: o que ela diz, como ela aparece e como ela se comunica no digital. Tudo pensado junto, para funcionar como um único sistema.",
  entregas: [
    {
      title: "Estratégia de marca",
      text: "Cliente ideal, posicionamento e narrativa. A base que define para quem a sua marca fala e por que escolher você.",
    },
    {
      title: "Identidade visual",
      text: "Logo e versões, cores, tipografia e aplicações. Uma marca de alto padrão em qualquer lugar.",
    },
    {
      title: "Estratégia de comunicação",
      text: "Tom de voz, mensagens e linha editorial. O que a sua marca diz e como ela fala.",
    },
    {
      title: "Estratégia e estruturação das redes sociais",
      text: "Perfil, bio, destaques, feed e plano de conteúdo. Um Instagram que atrai e vende.",
    },
  ],
  bonus_title: "Bônus exclusivos desta proposta",
  bonus: [
    {
      title: "Site próprio + página de links da bio",
      text: "Um site com a cara da nova marca e uma página de links própria para a bio. Pronto para receber os seus clientes.",
    },
    {
      title: "2 meses de redes sociais",
      text: "3 posts por semana, criados por nós com a nova identidade. A marca já entra no ar com consistência.",
    },
  ],
  show_cases: true,
  case_slugs: DEFAULT_CASE_ORDER.slice(0, 4),
  cases_title: "Marcas que construímos",
  show_price: true,
  price_total: 15000,
  cash_discount_pct: 10,
  cash_note: "Pagamento via Pix na contratação",
  installments_note: "50% na contratação e 50% na entrega",
  show_card: true,
  end_title: "Obrigado.",
  end_text: "Vamos construir juntos uma marca à altura do seu trabalho.",
};

/** Junta o que veio do banco com os padrões, ignorando campos de tipo errado. */
export function mergeAvulsa(base: AvulsaData, saved: unknown): AvulsaData {
  if (!saved || typeof saved !== "object") return base;
  const out = { ...base } as Record<string, unknown>;
  for (const [k, v] of Object.entries(saved as Record<string, unknown>)) {
    if (!(k in base)) continue;
    const def = (base as unknown as Record<string, unknown>)[k];
    if (Array.isArray(def) ? Array.isArray(v) : typeof v === typeof def) out[k] = v;
  }
  return out as unknown as AvulsaData;
}
