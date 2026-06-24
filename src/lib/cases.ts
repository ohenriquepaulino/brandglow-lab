import img308BannerMetroMoema from "@/assets/308-network/308-network-banner-metro-moema.webp.asset.json";
import img308BoneMoletom from "@/assets/308-network/308-network-bone-e-moletom-juntos.webp.asset.json";
import img308Cartao from "@/assets/308-network/308-network-cartao-de-visitas.webp.asset.json";
import img308CopoCafe from "@/assets/308-network/308-network-copo-cafe.webp.asset.json";
import img308Insta from "@/assets/308-network/308-network-insta-fundo.webp.asset.json";
import img308Iphone from "@/assets/308-network/308-network-iphone-mao-podcast.webp.asset.json";
import img308Livro from "@/assets/308-network/308-network-livro-portfolio.webp.asset.json";
import img308LogoPalavras from "@/assets/308-network/308-network-logo-branco-fundo-palavras.webp.asset.json";
import img308OutBanner from "@/assets/308-network/308-network-out-banner.webp.asset.json";
import img308SiteTelaPc from "@/assets/308-network/308-network-site-tela-pc.webp.asset.json";
import img44 from "@/assets/geriacademy/geriacademy-page-0044.webp.asset.json";
import img46 from "@/assets/geriacademy/geriacademy-page-0046.webp.asset.json";
import img49 from "@/assets/geriacademy/geriacademy-page-0049.webp.asset.json";
import img50 from "@/assets/geriacademy/geriacademy-page-0050.webp.asset.json";
import img52 from "@/assets/geriacademy/geriacademy-page-0052.webp.asset.json";
import img53 from "@/assets/geriacademy/geriacademy-page-0053.webp.asset.json";
import img54 from "@/assets/geriacademy/geriacademy-page-0054.webp.asset.json";
import img55 from "@/assets/geriacademy/geriacademy-page-0055.webp.asset.json";
import img57 from "@/assets/geriacademy/geriacademy-page-0057.webp.asset.json";
import img58 from "@/assets/geriacademy/geriacademy-page-0058.webp.asset.json";
import img60 from "@/assets/geriacademy/geriacademy-page-0060.webp.asset.json";
import img61 from "@/assets/geriacademy/geriacademy-page-0061.webp.asset.json";

export type CaseStudy = {
  slug: string;
  name: string;
  segment: string;
  short: string;
  context: string;
  challenge: string;
  delivery: string;
  accent: string;
  accentText: "ink" | "cream";
  heroImage?: string;
  gallery?: string[];
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
    name: "308NETWORK",
    segment: "Decisões patrimoniais inteligentes",
    short:
      "Reposicionamento de uma marca imobiliária tradicional para uma referência em decisões patrimoniais inteligentes, pronta para expandir sua atuação.",
    context:
      "Com anos de mercado e uma reputação construída na base do atendimento e da confiança, a 308 já era reconhecida. Mas, para o próximo nível — tornar-se top of mind para investidores e famílias que valorizam estratégia — isso já não bastava.",
    challenge:
      "O modelo tradicional de imobiliária já não representava o que a 308 havia se tornado. O desafio era transformar essa percepção e fazer a marca ser vista como realmente era: uma parceira estratégica na construção e proteção de patrimônio imobiliário.",
    delivery:
      "Criamos um reposicionamento completo de marca para sustentar a expansão da 308, com narrativa mais estratégica, identidade visual de presença forte e aplicações que reforçam autoridade, clareza e visão de longo prazo em todos os pontos de contato.",
    accent: "#121110",
    accentText: "cream",
    heroImage: img308OutBanner.url,
    gallery: [
      img308SiteTelaPc.url,
      img308BannerMetroMoema.url,
      img308BoneMoletom.url,
      img308Cartao.url,
      img308CopoCafe.url,
      img308Iphone.url,
      img308Livro.url,
      img308Insta.url,
      img308LogoPalavras.url,
    ],
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
  {
    slug: "geriacademy",
    name: "Geriacademy",
    segment: "Educação médica · 2026",
    short:
      "Posicionamento de uma escola médica com propósito em um ecossistema educacional de alto valor — marca forte, comunidade viva e esteira estratégica.",
    context:
      "A Geriacademy chegou com um propósito claro: qualificar o cuidado com o idoso no Brasil. O desafio era construir uma marca à altura desse propósito, capaz de sustentar uma plataforma educacional comprometida com uma transformação real no cuidado geriátrico.",
    challenge:
      "Posicionar a Geriacademy como mais do que uma escola — uma plataforma educacional de referência, com comunidade viva e esteira de produtos pronta para escalar.",
    delivery:
      "Base estratégica em três pilares — posicionamento único, mensagem clara e comunidade forte. Criação da narrativa de marca, da comunidade Geri Sim! (movimento que une profissionais da saúde em torno de uma nova visão sobre o envelhecer) e de uma esteira inteligente de produtos: cursos, certificações, plataforma viva, mentorias, encontros presenciais e uma IA própria, a GerIA.",
    accent: "#121110",
    accentText: "cream",
    heroImage: img60.url,
    gallery: [
      img58.url,
      img55.url,
      img54.url,
      img61.url,
      img57.url,
      img53.url,
      img52.url,
      img46.url,
      img49.url,
      img50.url,
      img44.url,
    ],
  },
];

export function getCase(slug: string): CaseStudy | undefined {
  return cases.find((c) => c.slug === slug);
}
