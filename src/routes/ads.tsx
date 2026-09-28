import { createFileRoute } from "@tanstack/react-router";
import { AB_COOKIE, AB_PAGINAS, type Variante } from "@/lib/ab";

// Link das campanhas: sorteia A ou B (50/50), guarda a escolha num cookie de
// 30 dias (quem volta cai na mesma versão) e redireciona para /adsa ou /adsb
// com a query intacta (UTMs, fbclid). Só servidor: não renderiza página.
// ?v=a ou ?v=b força a versão (para conferir cada uma).
const TRINTA_DIAS = 60 * 60 * 24 * 30;

export const Route = createFileRoute("/ads")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const cookie = request.headers.get("cookie") ?? "";
        const salva = new RegExp(`(?:^|;\\s*)${AB_COOKIE}=(a|b)(?:;|$)`).exec(cookie)?.[1];
        const forcada = url.searchParams.get("v");
        url.searchParams.delete("v");

        const variante: Variante =
          forcada === "a" || forcada === "b"
            ? forcada
            : salva === "a" || salva === "b"
              ? salva
              : Math.random() < 0.5
                ? "a"
                : "b";

        const destino = `${AB_PAGINAS[variante]}${url.search}`;
        return new Response(null, {
          status: 302,
          headers: {
            Location: destino,
            // Sem cache: cada visitante precisa passar pelo sorteio.
            "Cache-Control": "no-store, max-age=0",
            "Set-Cookie": `${AB_COOKIE}=${variante}; Path=/; Max-Age=${TRINTA_DIAS}; SameSite=Lax; Secure`,
          },
        });
      },
    },
  },
});
