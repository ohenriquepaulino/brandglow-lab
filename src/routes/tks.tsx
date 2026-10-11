import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { captureUtmsFromUrl } from "@/lib/utm";
import { FONTE_PRELOAD } from "@/components/novo/Estilo";
import { PaginaObrigado } from "@/components/novo/Obrigado";

export const Route = createFileRoute("/tks")({
  head: () => ({
    meta: [
      { title: "Obrigado — Legacy BrandCo." },
      {
        name: "description",
        content: "Informações recebidas com sucesso. Em breve entraremos em contato.",
      },
      { property: "og:title", content: "Obrigado — Legacy BrandCo." },
      {
        property: "og:description",
        content: "Informações recebidas com sucesso. Em breve entraremos em contato.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [FONTE_PRELOAD],
  }),
  component: TksPage,
});

function TksPage() {
  // Sem evento Lead do Pixel nesta pagina (leads sem faturamento): o Meta não
  // otimiza para eles. O evento personalizado serve só para montar públicos
  // (excluir ou remarketing) e não entra na otimização de Lead.
  useEffect(() => {
    captureUtmsFromUrl();
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq === "function") fbq("trackCustom", "LeadSemFaturamento");
  }, []);

  return <PaginaObrigado />;
}
