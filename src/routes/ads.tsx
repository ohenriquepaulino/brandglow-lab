import { createFileRoute } from "@tanstack/react-router";
import { AB_COOKIE, AB_PAGINAS, type Variante } from "@/lib/ab";

// Link das campanhas. Foi o split do teste A/B (sorteava /adsa ou /adsb) até
// 2026-11-12. De 12 a 19/11 levou todo mundo para a /adsa: 63 visitas e 0 lead.
// Desde 2026-11-19 leva todo mundo para a /adsb, que converteu melhor desde
// 19/10 (5,5% e 5,1% contra 3,8% e 2,4% da A), com a query intacta (UTMs,
// fbclid). Só servidor: não renderiza página. ?v=a ainda abre a /adsa.
const TRINTA_DIAS = 60 * 60 * 24 * 30;

export const Route = createFileRoute("/ads")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const forcada = url.searchParams.get("v");
        url.searchParams.delete("v");

        const variante: Variante = forcada === "a" ? "a" : "b";

        const destino = `${AB_PAGINAS[variante]}${url.search}`;
        return new Response(null, {
          status: 302,
          headers: {
            Location: destino,
            // Sem cache: o destino pode mudar de novo e não deve ficar preso no navegador.
            "Cache-Control": "no-store, max-age=0",
            "Set-Cookie": `${AB_COOKIE}=${variante}; Path=/; Max-Age=${TRINTA_DIAS}; SameSite=Lax; Secure`,
          },
        });
      },
    },
  },
});
