import { createFileRoute } from "@tanstack/react-router";
import { PaginaAdsA } from "@/components/ads/PaginaAdsA";

// Destino das campanhas do Google Ads (rede de pesquisa). É a mesma página da
// /adsa, que já mostra o preço de partida, mas fora do teste A/B da Meta: as
// visitas daqui não entram no painel /crm/ab, e o lead chega com pagina=/busca.
export const Route = createFileRoute("/busca")({
  head: () => ({
    meta: [
      { title: "Estratégia e identidade visual | Legacy BrandCo." },
      {
        name: "description",
        content:
          "Consultoria de estratégia de marca e identidade visual. Preencha o formulário e marque uma conversa sobre o projeto da sua marca.",
      },
      { property: "og:title", content: "Estratégia e identidade visual | Legacy BrandCo." },
      {
        property: "og:description",
        content: "Estratégia de marca e identidade visual para negócios que já entregam resultado.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [
      {
        rel: "preload",
        href: "/proposta/fonts/inter-400.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      // 600 é o negrito do título, do formulário e do botão: sem o preload ele só
      // começava a baixar depois do CSS, e o título era redesenhado na troca.
      {
        rel: "preload",
        href: "/proposta/fonts/inter-600.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
    ],
  }),
  component: () => <PaginaAdsA variante={null} />,
});
