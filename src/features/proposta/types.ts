export interface Deliverable {
  title: string;
  text: string;
}

/** Linha da tabela public.proposals (campos usados pelo front). */
export interface Proposal {
  id?: string;
  slug: string;
  client_name: string;
  cover_label: string;
  show_diagnosis: boolean;
  diagnosis_moment: string | null;
  diagnosis_challenge: string | null;
  diagnosis_goal: string | null;
  price_total: number;
  installments: number;
  installments_note: string;
  cash_discount_pct: number;
  cash_note: string;
  deadline_days: number;
  valid_until: string | null; // AAAA-MM-DD
  whatsapp: string | null;
  /** Cases e entregas são os padrões do kit; ficam opcionais aqui. */
  case_slugs?: string[] | null;
  deliverables?: Deliverable[] | null;
  created_at?: string;
  updated_at?: string;
}

export interface CaseStudy {
  slug: string;
  name: string;
  segment: string;
  summary?: string;
  context?: string;
  challenge?: string;
  solution?: string;
  quote?: string;
  handle?: string;
  /** Link para o case completo no site, quando existir. */
  siteUrl?: string;
  /** Primeira imagem é a principal. */
  images: string[];
}
