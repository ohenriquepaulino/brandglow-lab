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
import img308EfeitoMetal from "@/assets/308-network/308-network-308-efeito-metal.webp.asset.json";
import img308FotoCorrendo from "@/assets/308-network/308-network-308-foto-correndo.webp.asset.json";
import img308NetworkHorizontal from "@/assets/308-network/308-network-308-network-horizontal.webp.asset.json";
import img308NetworkVertical from "@/assets/308-network/308-network-308-network-vertical.webp.asset.json";
import img308VariacoesLogo from "@/assets/308-network/308-network-308-variacoes-logo.webp.asset.json";
import img308IphoneAppPatrimonio from "@/assets/308-network/308-network-iphone-app-patrimonio.webp.asset.json";
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
import imgJoanaBag from "@/assets/joana-ulmer/joana-ulmer-bag.webp.asset.json";
import imgJoanaBanner from "@/assets/joana-ulmer/joana-ulmer-banner.webp.asset.json";
import imgJoanaBillboardEvent from "@/assets/joana-ulmer/joana-ulmer-billboard-event.webp.asset.json";
import imgJoanaBillboardQuote from "@/assets/joana-ulmer/joana-ulmer-billboard-quote.webp.asset.json";
import imgJoanaEnvelope from "@/assets/joana-ulmer/joana-ulmer-envelope.webp.asset.json";
import imgJoanaHoodies from "@/assets/joana-ulmer/joana-ulmer-hoodies.webp.asset.json";
import imgJoanaLaptop from "@/assets/joana-ulmer/joana-ulmer-laptop.webp.asset.json";
import imgJoanaPhone from "@/assets/joana-ulmer/joana-ulmer-phone.webp.asset.json";
import imgJoanaProfileCard from "@/assets/joana-ulmer/joana-ulmer-profile-card.webp.asset.json";
import imgJoanaSportwear from "@/assets/joana-ulmer/joana-ulmer-sportwear.webp.asset.json";
import imgJoanaBoxLiberdade from "@/assets/joana-ulmer/joana-ulmer-box-liberdade.webp.asset.json";
import imgJoanaLogoAsterisk from "@/assets/joana-ulmer/joana-ulmer-logo-asterisk.webp.asset.json";
import imgJoanaLogoYellowBg from "@/assets/joana-ulmer/joana-ulmer-logo-yellow-bg.webp.asset.json";
import imgJoanaLogoJoanaCo from "@/assets/joana-ulmer/joana-ulmer-logo-joana-co.webp.asset.json";
import imgJoanaLogoJoanaUlmerCo from "@/assets/joana-ulmer/joana-ulmer-logo-joana-ulmer-co.webp.asset.json";

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
    name: "Joana Ulmer Co*",
    segment: "Marca pessoal · Educação financeira",
    short:
      "Transformação da presença de uma profissional em uma marca pessoal com clareza, direção e narrativa para conectar com o público certo.",
    context:
      "Quando a Joana chegou até nós, o pedido era simples: um site. Mas bastaram algumas conversas para entendermos que o desafio era mais profundo. Ela sabia do impacto do que fazia, mas ainda não conseguia traduzir isso em palavras com a clareza que sua marca precisava.",
    challenge:
      "Faltava definição sobre seus diferenciais, seu público e o posicionamento certo para sair de um mercado impessoal e repetitivo. O desafio era transformar sua presença profissional em uma marca pessoal que soubesse o que diz, conectasse com quem importa e comunicasse com clareza o valor que entrega.",
    delivery:
      "Começamos pelo trabalho estratégico e, juntos, construímos uma base sólida: clareza sobre quem a Joana é, o que entrega e como se destacar com autenticidade. O resultado foi uma marca com direção, consistência e uma narrativa capaz de comunicar com precisão ao público ideal em todos os pontos de contato.",
    accent: "#f4ff85",
    accentText: "ink",
    heroImage: imgJoanaBillboardQuote.url,
    gallery: [
      imgJoanaBillboardQuote.url,
      imgJoanaBanner.url,
      imgJoanaLogoJoanaUlmerCo.url,
      imgJoanaLogoJoanaCo.url,
      imgJoanaLogoYellowBg.url,
      imgJoanaLogoAsterisk.url,
      imgJoanaBoxLiberdade.url,
      imgJoanaLaptop.url,
      imgJoanaPhone.url,
      imgJoanaProfileCard.url,
      imgJoanaEnvelope.url,
      imgJoanaBag.url,
      imgJoanaHoodies.url,
      imgJoanaSportwear.url,
      imgJoanaBillboardEvent.url,
    ],
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
      img308FotoCorrendo.url,
      img308NetworkHorizontal.url,
      img308NetworkVertical.url,
      img308EfeitoMetal.url,
      img308IphoneAppPatrimonio.url,
      img308VariacoesLogo.url,
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
