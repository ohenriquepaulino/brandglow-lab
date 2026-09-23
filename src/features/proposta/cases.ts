import type { CaseStudy } from "./types";
import { ASSET } from "./defaults";

/**
 * Cases usados na proposta.
 * Se o site já tiver uma fonte de dados de cases (as páginas /cases/:slug),
 * o ideal é mapear a partir dela e manter este arquivo só como complemento.
 * Veja CLAUDE.md, passo 4.
 */
const SITE = "https://legacybc.com.br";
const SITE_ASSET = (id: string, file: string) => `${SITE}/__l5e/assets-v1/${id}/${file}`;

export const CASES: CaseStudy[] = [
  {
    slug: "geriacademy",
    name: "Geriacademy",
    segment: "Educação médica",
    summary:
      "A Geriacademy é uma instituição de ensino voltada para a capacitação de médicos e profissionais de saúde no assunto da Geriatria e o cuidado com o Idoso. Lidera um movimento de valorização da saúde do idoso, atraindo profissionais comprometidos em melhorar a qualidade de vida desta população.",
    siteUrl: `${SITE}/cases/geriacademy`,
    images: [ASSET("cases/geriacademy.webp")],
  },
  {
    slug: "medcopilot",
    name: "MedCopilot",
    segment: "Tecnologia em saúde",
    summary:
      "Pioneira em tecnologia para uma nova era de cuidados na saúde. Conecta-se com profissionais que valorizam soluções inteligentes e personalizadas. Deseja passar segurança, acelerar inovações, descomplicar o atendimento médico e cultivar colaborações significativas no setor da saúde.",
    images: [ASSET("cases/medcopilot.webp")],
  },
  {
    slug: "nutri-yuri-gomes",
    name: "Nutri Yuri Gomes",
    segment: "Nutrição, marca pessoal",
    handle: "@nutriyurigomes",
    summary:
      "Nutri Yuri Gomes é uma marca pessoal que atua no mercado de Nutrição. Busca aumentar a autoestima, confiança, bem-estar e saúde de homens e mulheres que estão insatisfeitos e precisam de ajuda. Realiza tudo isso com cuidado personalizado e proximidade com seus pacientes.",
    images: [ASSET("cases/nutri-yuri-gomes.webp")],
  },
  {
    slug: "mariana-brumatti",
    name: "Mariana Brumatti",
    segment: "Estética, Minas Gerais",
    handle: "@dramarianabrumatti",
    summary:
      "Mariana Brumatti é uma biomédica esteta de Minas Gerais, uma profissional apaixonada e dedicada. Em sua empresa disponibiliza uma ampla gama de tratamentos de rejuvenescimento e bem-estar, para ajudar cada cliente a sentir-se bem consigo mesmo.",
    images: [ASSET("cases/mariana-brumatti.webp")],
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
      SITE_ASSET("e83156e5-125d-43cf-8084-8096fbf58b0d", "moewa-clube-card.png"),
      SITE_ASSET("2d3b1cc2-76ab-4bee-ad00-b51bc188a211", "moewa-poster-manifesto.png"),
      SITE_ASSET("1f792934-ba38-4766-9949-ed2b2d267e93", "moewa-uniform.png"),
      SITE_ASSET("c5666b9a-af37-4dab-9f6b-830a80e82d09", "moewa-wellness-shot.png"),
      SITE_ASSET("d7b57c27-42ef-4706-8c2c-a50102b0ae9e", "moewa-cartao.jpg"),
      SITE_ASSET("e2f26b8a-fef0-4ac7-abd4-77cc03ab0b38", "moewa-sacola.jpg"),
      SITE_ASSET("2673df9b-6104-4639-bd35-10b599dacfef", "moewa-home-spray.jpg"),
      SITE_ASSET("1f13c282-c6a2-41b9-aeaa-864c03f4ecb9", "moewa-palette.png"),
    ],
  },
  {
    slug: "joana-co",
    name: "Joana co*",
    segment: "Marca pessoal, educação financeira",
    quote: "Quanto você investiria na sua paz?",
    siteUrl: `${SITE}/cases/joana-co`,
    images: [ASSET("cases/joana-co-1.webp"), ASSET("cases/joana-co-2.webp")],
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
      SITE_ASSET("25f6fa8c-7e8a-437d-8eb5-1aabad5ec0e2", "308-network-out-banner.webp"),
      SITE_ASSET("1c26e373-2ad4-499f-b912-8629fa890648", "308-network-308-foto-correndo.webp"),
      SITE_ASSET("cf478be6-e711-4b6a-ac28-c8b87cedaf17", "308-network-308-variacoes-logo.webp"),
      SITE_ASSET("67faf196-eba5-4ec1-95df-be2f9aaf1230", "308-network-banner-metro-moema.webp"),
      SITE_ASSET("6fc56679-4ba3-4434-8914-7a384129ab12", "308-network-site-tela-pc.webp"),
      SITE_ASSET("5a6dae66-5287-463c-9120-8a95876819d7", "308-network-bone-e-moletom-juntos.webp"),
      SITE_ASSET("587d5cbf-55a5-489a-b3ba-b60621cb8ba5", "308-network-cartao-de-visitas.webp"),
      SITE_ASSET("ee87d032-20f2-48bb-8969-6f96e3a3ad1c", "308-network-iphone-app-patrimonio.webp"),
    ],
  },
];

/** Imagens locais extraídas da apresentação, caso as do site mudem de endereço. */
export const LOCAL_BACKUP_IMAGES: Record<string, string[]> = {
  moewa: [ASSET("cases/moewa-1.webp"), ASSET("cases/moewa-2.webp"), ASSET("cases/moewa-3.webp")],
  "308-network": [1, 2, 3, 4].map((n) => ASSET(`cases/308-network-${n}.webp`)),
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
