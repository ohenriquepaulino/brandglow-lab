// Teste A/B das landing pages de anúncio. O split fica em /ads (rota do
// servidor, src/routes/ads.tsx), que sorteia A ou B, grava o cookie
// AB_COOKIE e redireciona para /adsa ou /adsb com a query intacta.
// Cada página registra a visita aqui; as conversões saem de leads.pagina.
import { useEffect } from "react";
import { captureUtmsFromUrl } from "@/lib/utm";

export type Variante = "a" | "b";

export const AB_TESTE = "ads";
export const AB_COOKIE = "lbc_ab_ads";
export const AB_PAGINAS: Record<Variante, string> = { a: "/adsa", b: "/adsb" };

const VISITANTE_KEY = "lbc_vid";
/** Gravado pelo painel /crm/ab: o navegador da equipe não conta como visitante. */
export const AB_IGNORAR_KEY = "lbc_ab_ignorar";

/** Id anônimo do navegador (também usado nas visitas dos vídeos, /v/:slug). */
export function visitanteId(): string {
  try {
    let id = localStorage.getItem(VISITANTE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(VISITANTE_KEY, id);
    }
    return id;
  } catch {
    // Sem localStorage (aba anônima restrita): conta como visitante novo.
    return crypto.randomUUID();
  }
}

/** Registra a visita da variante uma vez por carregamento. Nunca lança. null não registra. */
export function useAbVisit(variante: Variante | null) {
  useEffect(() => {
    if (!variante) return;
    try {
      if (localStorage.getItem(AB_IGNORAR_KEY) === "1") return;
    } catch {
      // sem localStorage: conta normalmente
    }
    try {
      const utms = captureUtmsFromUrl();
      const viaSplit = new RegExp(`(?:^|;\\s*)${AB_COOKIE}=${variante}(?:;|$)`).test(
        document.cookie,
      );
      void fetch("/api/public/ab/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          teste: AB_TESTE,
          variante,
          visitante: visitanteId(),
          via_split: viaSplit,
          utm_source: utms.utm_source ?? null,
          utm_campaign: utms.utm_campaign ?? null,
          utm_content: utms.utm_content ?? null,
        }),
      }).catch(() => {});
    } catch {
      // medição nunca atrapalha a página
    }
  }, [variante]);
}
