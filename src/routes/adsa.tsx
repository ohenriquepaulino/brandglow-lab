import { createFileRoute } from "@tanstack/react-router";
import { PaginaAdsA } from "@/components/ads/PaginaAdsA";

// Versão A do teste A/B (antiga /ads). As campanhas apontam para /ads, que
// sorteia entre esta página e a /adsb — ver src/lib/ab.ts.
export const Route = createFileRoute("/adsa")({
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
  component: () => <PaginaAdsA variante="a" />,
});
