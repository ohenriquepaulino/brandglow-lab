import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { captureUtmsFromUrl } from "@/lib/utm";
import { leadSignal, readLeadFaturamento } from "@/lib/lead-signal";
import { FONTE_PRELOAD } from "@/components/novo/Estilo";
import { PaginaObrigado } from "@/components/novo/Obrigado";

export const Route = createFileRoute("/obrigado")({
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
  component: ObrigadoPage,
});

function ObrigadoPage() {
  useEffect(() => {
    captureUtmsFromUrl();
    const eventId = new URLSearchParams(window.location.search).get("ev");
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq === "function") {
      fbq(
        "track",
        "Lead",
        leadSignal(readLeadFaturamento()) ?? {},
        eventId ? { eventID: eventId } : undefined,
      );
    }
  }, []);

  return <PaginaObrigado />;
}
