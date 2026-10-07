import type { Deliverable, Proposal, ProposalProduct } from "./types";

/** Caminho base dos arquivos em /public/proposta */
export const ASSET = (p: string) => `/proposta/${p}`;

/**
 * Domínio público do projeto onde a rota /p/:slug fica no ar.
 * Se o CRM estiver em outro projeto/domínio que o site, use o domínio do CRM.
 * O Claude Code confirma no Passo 0.
 */
export const PUBLIC_BASE_URL = "https://legacybc.com.br";
export const publicProposalUrl = (slug: string) => `${PUBLIC_BASE_URL}/p/${slug}`;

export const BRAND = {
  site: "https://legacybc.com.br",
  siteLabel: "legacybc.com.br",
  logoDark: ASSET("brand/legacy-logo-preto.webp"),
  logoLight: ASSET("brand/legacy-logo-branco.webp"),
  sealDark: ASSET("brand/legacy-selo-preto.webp"),
  sealLight: ASSET("brand/legacy-selo-branco.webp"),
  team: [1, 2, 3, 4, 5].map((n) => ASSET(`team/equipe-${n}.jpg`)),
};

export const DEFAULT_DELIVERABLES: Deliverable[] = [
  {
    title: "Narrativa da marca",
    text: "Colocamos no papel o que sua empresa comunica, com quem e como ela fala. É a tradução da sua estratégia em uma direção clara, que orienta todas as decisões visuais que vêm depois.",
  },
  {
    title: "Logotipo e suas versões",
    text: "Criamos a logo da sua empresa junto com todas as versões que você vai usar no dia a dia. Funciona bem em qualquer lugar, do perfil do Instagram à fachada da sua loja.",
  },
  {
    title: "Elementos visuais",
    text: "Ícones, formas e texturas que ampliam o repertório da sua marca e reforçam a identidade dela em todos os lugares onde sua empresa aparece.",
  },
  {
    title: "Paleta de cores",
    text: "Definimos as cores da sua marca com um critério claro: passar a mensagem certa sobre o seu negócio e te diferenciar de todos os seus concorrentes.",
  },
  {
    title: "Tipografia da marca",
    text: "Seleção das fontes que acompanham a marca, deixando seus materiais organizados, fáceis de ler e com liberdade para criar qualquer peça.",
  },
  {
    title: "Como fica na prática",
    text: "Simulações da sua marca aplicada no dia a dia, em cartões, papelaria, assinaturas, uniformes, sinalização, apresentações e ambientes internos e externos.",
  },
  {
    title: "Identidade do Instagram",
    text: "Orientações para o seu perfil ficar organizado e coerente, com direção de como montar as postagens e manter o feed com a cara da sua empresa.",
  },
  {
    title: "Todos os arquivos",
    text: "Entrega de todos os arquivos aprovados em formatos profissionais, organizados e disponibilizados via Google Drive para acesso imediato.",
  },
];

export const DIAGNOSIS_PLACEHOLDERS = {
  moment: "[Em uma frase, o momento atual do negócio]",
  challenge: "[Em uma frase, o que hoje trava o crescimento da marca]",
  goal: "[Em uma frase, onde o cliente quer chegar]",
};

export const DEFAULT_CASE_ORDER = [
  "geriacademy",
  "medcopilot",
  "nutri-yuri-gomes",
  "mariana-brumatti",
  "moewa",
  "joana-co",
  "308-network",
  "o-de-casa",
];

/* ---------- Direção de Marca Legacy ---------- */

export const PRODUCT_LABELS: Record<ProposalProduct, string> = {
  estrategia: "Estratégia de Marca e Identidade Visual",
  direcao: "Direção de Marca Legacy",
};

/** Valores aplicados ao criar uma proposta de Direção de Marca Legacy. */
export const DIRECAO_DEFAULTS = {
  cover_label: "Proposta de Direção de Marca",
  show_diagnosis: false,
  price_total: 2000,
  installments: 12,
  installments_note: "Parcelado no cartão de crédito",
  cash_discount_pct: 10,
  cash_note: "Pagamento via Pix na contratação",
  deadline_days: 30,
} satisfies Partial<Proposal>;

/** Cartão na Direção de Marca: sempre em 12x, com as taxas da operadora já incluídas. */
export const DIRECAO_CARD_INSTALLMENTS = 12;
/** Valor da parcela em 12x = total × taxa. Com R$ 2.000, dá 12x de R$ 206,85. */
export const DIRECAO_CARD_RATE_12X = 0.103425;

/** Textos padrão antigos (modelo 50% + 50%), trocados pelos novos na exibição. */
export const DIRECAO_OLD_NOTES: Record<string, string> = {
  "50% na contratação e 50% antes do Encontro 2": DIRECAO_DEFAULTS.installments_note,
  "Pagamento único na contratação": DIRECAO_DEFAULTS.cash_note,
};

export const DIRECAO_DELIVERABLES: Deliverable[] = [
  {
    title: "Diagnóstico da marca",
    text: "Uma leitura clara de como a sua marca está hoje: o que já funciona e o que ajustar primeiro pra vender mais.",
  },
  {
    title: "Mapa do cliente ideal",
    text: "Quem é o seu cliente, o que ele deseja, o que faz ele comprar e quem a sua marca deve deixar de atrair.",
  },
  {
    title: "Posicionamento e diferencial",
    text: "Como a sua marca quer ser lembrada e por que o cliente deve escolher você, com as provas que sustentam isso.",
  },
  {
    title: "Mensagem central",
    text: "A frase que resume o seu negócio, com versões prontas pra bio do Instagram, apresentação de 30 segundos e primeira mensagem no WhatsApp.",
  },
  {
    title: "Jeito de falar",
    text: "As palavras que a sua marca usa e evita, com exemplos de antes e depois feitos a partir dos seus próprios textos.",
  },
  {
    title: "Linha editorial",
    text: "Os temas que a sua marca deve abordar nos conteúdos, com o papel de cada um: atrair, gerar confiança e vender.",
  },
  {
    title: "Pautas e ganchos",
    text: "30 ideias de conteúdo e 20 frases de abertura prontas, alinhadas ao seu posicionamento.",
  },
  {
    title: "Plano de 90 dias",
    text: "Ações em três ciclos de 30 dias, com prioridades, responsáveis, calendário do primeiro mês e ajustes do seu perfil.",
  },
];
