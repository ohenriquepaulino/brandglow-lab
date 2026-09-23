import type { CaseStudy } from "./types";
import { ASSET } from "./defaults";

/**
 * Cases usados na proposta.
 * Se o site já tiver uma fonte de dados de cases (as páginas /cases/:slug),
 * o ideal é mapear a partir dela e manter este arquivo só como complemento.
 * Veja CLAUDE.md, passo 4.
 */
const SITE = "https://legacybc.com.br";

export const CASES: CaseStudy[] = [
  {
    slug: "geriacademy",
    name: "Geriacademy",
    segment: "Educação médica",
    summary:
      "A Geriacademy é uma instituição de ensino voltada para a capacitação de médicos e profissionais de saúde no assunto da Geriatria e o cuidado com o Idoso. Lidera um movimento de valorização da saúde do idoso, atraindo profissionais comprometidos em melhorar a qualidade de vida desta população.",
    siteUrl: `${SITE}/cases/geriacademy`,
    images: [ASSET("cases/geriacademy.jpg")],
  },
  {
    slug: "medcopilot",
    name: "MedCopilot",
    segment: "Tecnologia em saúde",
    summary:
      "Pioneira em tecnologia para uma nova era de cuidados na saúde. Conecta-se com profissionais que valorizam soluções inteligentes e personalizadas. Deseja passar segurança, acelerar inovações, descomplicar o atendimento médico e cultivar colaborações significativas no setor da saúde.",
    images: [ASSET("cases/medcopilot.jpg")],
  },
  {
    slug: "nutri-yuri-gomes",
    name: "Nutri Yuri Gomes",
    segment: "Nutrição, marca pessoal",
    handle: "@nutriyurigomes",
    summary:
      "Nutri Yuri Gomes é uma marca pessoal que atua no mercado de Nutrição. Busca aumentar a autoestima, confiança, bem-estar e saúde de homens e mulheres que estão insatisfeitos e precisam de ajuda. Realiza tudo isso com cuidado personalizado e proximidade com seus pacientes.",
    images: [ASSET("cases/nutri-yuri-gomes.jpg")],
  },
  {
    slug: "mariana-brumatti",
    name: "Mariana Brumatti",
    segment: "Estética, Minas Gerais",
    handle: "@dramarianabrumatti",
    summary:
      "Mariana Brumatti é uma biomédica esteta de Minas Gerais, uma profissional apaixonada e dedicada. Em sua empresa disponibiliza uma ampla gama de tratamentos de rejuvenescimento e bem-estar, para ajudar cada cliente a sentir-se bem consigo mesmo.",
    images: [ASSET("cases/mariana-brumatti.jpg")],
  },
  {
    slug: "moewa",
    name: "MOEWA",
    segment: "Estética, emagrecimento e longevidade",
    handle: "@clinicamoewa",
    summary:
      "Posicionamento de uma clínica de estética, emagrecimento e longevidade em um ecossistema de alto valor, com marca forte, comunidade viva e uma jornada integrada de protocolos.",
    context:
      "A MOEWA nasceu de uma história verdadeira: duas mulheres que vivem na pele a disciplina do autocuidado. O desafio era criar um posicionamento único capaz de refletir essa autenticidade e profundidade, transformando a marca, em um mar de rosas vermelhas, na única rosa branca do mercado.",
    challenge:
      "A estratégia começou redefinindo o propósito da marca: ser a clínica que completa a jornada de mulheres que já fazem metade do caminho sozinhas. O desafio era sair da lógica de uma clínica tradicional e construir uma percepção de alto valor, clareza e diferenciação de verdade.",
    solution:
      'A partir de uma tese de comunicação forte, "Quando uma mulher está com autoestima elevada e organização mental, ela resolve qualquer problema", unificamos a entrega técnica em uma jornada completa. Em vez de procedimentos isolados e promessas milagrosas de antes e depois, a MOEWA passou a se posicionar com uma experiência integrada em que estética corporal, nutrição e bem-estar caminham juntos. O resultado não aparece apenas no espelho, mas se sustenta no sono, na energia e no treino.',
    siteUrl: `${SITE}/cases/moewa`,
    images: [
      ASSET("cases/moewa/moewa-clube-card.jpg"),
      ASSET("cases/moewa/moewa-poster-manifesto.jpg"),
      ASSET("cases/moewa/moewa-uniform.jpg"),
      ASSET("cases/moewa/moewa-wellness-shot.jpg"),
      ASSET("cases/moewa/moewa-cartao.jpg"),
      ASSET("cases/moewa/moewa-sacola.jpg"),
      ASSET("cases/moewa/moewa-home-spray.jpg"),
      ASSET("cases/moewa/moewa-palette.jpg"),
    ],
  },
  {
    slug: "joana-co",
    name: "Joana co*",
    segment: "Marca pessoal, educação financeira",
    quote: "Quanto você investiria na sua paz?",
    siteUrl: `${SITE}/cases/joana-co`,
    images: [ASSET("cases/joana-co-1.jpg"), ASSET("cases/joana-co-2.jpg")],
  },
  {
    slug: "308-network",
    name: "308NETWORK",
    segment: "Decisões patrimoniais inteligentes",
    summary:
      "Reposicionamento de uma marca imobiliária tradicional para uma referência em decisões patrimoniais inteligentes, pronta para expandir sua atuação.",
    context:
      "Com anos de mercado e uma reputação construída na base do atendimento e da confiança, a 308 já era reconhecida. Mas, para o próximo nível, tornar-se top of mind para investidores e famílias que valorizam estratégia, isso já não bastava.",
    challenge:
      "O modelo tradicional de imobiliária já não representava o que a 308 havia se tornado. O desafio era transformar essa percepção e fazer a marca ser vista como realmente era: uma parceira estratégica na construção e proteção de patrimônio imobiliário.",
    solution:
      "Criamos um reposicionamento completo de marca para sustentar a expansão da 308, com narrativa mais estratégica, identidade visual de presença forte e aplicações que reforçam autoridade, clareza e visão de longo prazo em todos os pontos de contato.",
    siteUrl: `${SITE}/cases/308-network`,
    images: [
      ASSET("cases/308-network/308-network-out-banner.jpg"),
      ASSET("cases/308-network/308-network-308-foto-correndo.jpg"),
      ASSET("cases/308-network/308-network-308-variacoes-logo.jpg"),
      ASSET("cases/308-network/308-network-banner-metro-moema.jpg"),
      ASSET("cases/308-network/308-network-site-tela-pc.jpg"),
      ASSET("cases/308-network/308-network-bone-e-moletom-juntos.jpg"),
      ASSET("cases/308-network/308-network-cartao-de-visitas.jpg"),
      ASSET("cases/308-network/308-network-iphone-app-patrimonio.jpg"),
    ],
  },
];

/** Imagens locais extraídas da apresentação, caso as do site mudem de endereço. */
export const LOCAL_BACKUP_IMAGES: Record<string, string[]> = {
  moewa: [ASSET("cases/moewa-1.jpg"), ASSET("cases/moewa-2.jpg"), ASSET("cases/moewa-3.jpg")],
  "308-network": [1, 2, 3, 4].map((n) => ASSET(`cases/308-network-${n}.jpg`)),
};

export const CASES_BY_SLUG: Record<string, CaseStudy> = Object.fromEntries(
  CASES.map((c) => [c.slug, c]),
);

export function resolveCases(slugs: string[] | null | undefined): CaseStudy[] {
  const list = (slugs && slugs.length ? slugs : CASES.map((c) => c.slug))
    .map((s) => CASES_BY_SLUG[s])
    .filter(Boolean) as CaseStudy[];
  return list;
}
