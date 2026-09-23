import type { Deliverable } from "./types";

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
];
