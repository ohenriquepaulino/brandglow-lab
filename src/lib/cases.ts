export type CaseStudy = {
  slug: string;
  name: string;
  segment: string;
  short: string;
  context: string;
  challenge: string;
  delivery: string;
  accent: string; // hex color for header bg
  accentText: "ink" | "cream";
};

export const cases: CaseStudy[] = [
  {
    slug: "joana-co",
    name: "Joana co*",
    segment: "Educação financeira",
    short:
      "Posicionamento e identidade visual para uma marca pessoal no mercado de finanças pessoais.",
    context:
      "Joana atua há anos como educadora financeira, com uma audiência fiel construída no digital. Antes da Legacy, a comunicação dependia da figura pessoal e não traduzia o método em uma marca reconhecível.",
    challenge:
      "Transformar uma marca pessoal em uma marca de educação financeira reconhecida, sem perder a proximidade que já era um diferencial.",
    delivery:
      "Diagnóstico de mercado, definição de posicionamento, construção do tom de voz e sistema visual completo, incluindo logotipo, paleta, tipografia e templates de conteúdo.",
    accent: "#cfff87",
    accentText: "ink",
  },
  {
    slug: "308-network",
    name: "308 Network",
    segment: "Negócios e comunidade",
    short:
      "Estratégia de marca e identidade visual para uma rede de conexões entre empreendedores.",
    context:
      "A 308 nasceu como uma rede privada de conexões entre empreendedores em diferentes estágios. Precisava de uma marca que comunicasse senioridade e seletividade.",
    challenge:
      "Construir uma marca que comunicasse exclusividade, sem soar fechada, e que sustentasse o crescimento da comunidade em diferentes praças.",
    delivery:
      "Posicionamento, manifesto, narrativa de marca, identidade visual completa e diretrizes de aplicação para eventos, materiais e digital.",
    accent: "#121110",
    accentText: "cream",
  },
  {
    slug: "moewa",
    name: "Moewa",
    segment: "Estética e longevidade",
    short:
      "Marca premium para uma clínica de estética, emagrecimento e longevidade em São Paulo.",
    context:
      "A Moewa é uma clínica em São Paulo que combina estética, emagrecimento e protocolos de longevidade. Buscava uma marca à altura do padrão de atendimento e do público que atende.",
    challenge:
      "Posicionar a clínica em um patamar premium, diferenciando-a de clínicas de estética convencionais, com uma marca sofisticada e atemporal.",
    delivery:
      "Diagnóstico, posicionamento, naming review, identidade visual completa e guia de aplicação para fachada, ambiente e digital.",
    accent: "#d75631",
    accentText: "cream",
  },
];

export function getCase(slug: string): CaseStudy | undefined {
  return cases.find((c) => c.slug === slug);
}
