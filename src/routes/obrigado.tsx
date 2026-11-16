import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { captureUtmsFromUrl } from "@/lib/utm";
import { readLeadFaturamento, readLeadTelefone } from "@/lib/lead-signal";
import { dispararConversoesLead } from "@/lib/conversoes";
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
    dispararConversoesLead(eventId, readLeadFaturamento(), readLeadTelefone());
  }, []);

  return <PaginaObrigado />;
}
