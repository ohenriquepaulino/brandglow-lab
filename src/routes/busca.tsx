import { createFileRoute } from "@tanstack/react-router";
import { PaginaAdsA, isSegmento, type Segmento } from "@/components/ads/PaginaAdsA";

// Destino das campanhas do Google Ads (rede de pesquisa). É a mesma página da
// /adsa, que já mostra o preço de partida, mas fora do teste A/B da Meta: as
// visitas daqui não entram no painel /crm/ab, e o lead chega com pagina=/busca.
// ?seg=saude|arquitetura|advocacia|reposicionar troca o título (ver SEGMENTOS).
export const Route = createFileRoute("/busca")({
  // Devolve o resto da query intacto: UTMs e gclid são lidos da URL depois.
  validateSearch: (
    search: Record<string, unknown>,
  ): Record<string, unknown> & { seg?: Segmento } => ({
    ...search,
    seg: isSegmento(search.seg) ? search.seg : undefined,
  }),
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
  component: BuscaPage,
});

function BuscaPage() {
  const { seg } = Route.useSearch();
  return <PaginaAdsA variante={null} segmento={seg} />;
}
