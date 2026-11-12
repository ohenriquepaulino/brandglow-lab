import { createFileRoute } from "@tanstack/react-router";
import { AB_COOKIE, AB_PAGINAS, type Variante } from "@/lib/ab";

// Link das campanhas. Foi o split do teste A/B (sorteava /adsa ou /adsb) até
// 2026-11-12, quando a A foi oficializada: agora todo mundo vai para a /adsa,
// inclusive quem tinha o cookie da B, com a query intacta (UTMs, fbclid).
// Só servidor: não renderiza página. ?v=b ainda abre a /adsb, para conferir.
const TRINTA_DIAS = 60 * 60 * 24 * 30;

export const Route = createFileRoute("/ads")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const forcada = url.searchParams.get("v");
        url.searchParams.delete("v");

        const variante: Variante = forcada === "b" ? "b" : "a";

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
