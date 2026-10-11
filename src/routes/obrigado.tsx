import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { captureUtmsFromUrl } from "@/lib/utm";
import { leadSignal, readLeadFaturamento, readLeadTelefone } from "@/lib/lead-signal";
import { GOOGLE_ADS_LEAD } from "@/lib/google-ads";
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

    // Google Ads: o "ev" vai como transaction_id, e o Google descarta a repetição
    // se a página for recarregada. O valor é o mesmo peso por faixa do Lead da
    // Meta; o telefone alimenta as conversões otimizadas.
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === "function") {
      const telefone = readLeadTelefone();
      if (telefone) gtag("set", "user_data", { phone_number: telefone });
      gtag("event", "conversion", {
        send_to: GOOGLE_ADS_LEAD,
        value: leadSignal(readLeadFaturamento())?.value ?? 1,
        currency: "BRL",
        ...(eventId ? { transaction_id: eventId } : {}),
      });
    }

    // ChatGPT Ads: uma conversão por cadastro. O "ev" identifica o envio, então
    // recarregar a página não conta de novo.
    const oaiq = (window as unknown as { oaiq?: (...args: unknown[]) => void }).oaiq;
    const chave = `oaiq-registration:${eventId ?? "sem-ev"}`;
    let jaContou = false;
    try {
      jaContou = !!eventId && sessionStorage.getItem(chave) === "1";
    } catch {
      // sessionStorage bloqueado: conta mesmo assim
    }
    if (typeof oaiq === "function" && !jaContou) {
      oaiq("measure", "registration_completed", { type: "customer_action" });
      try {
        if (eventId) sessionStorage.setItem(chave, "1");
      } catch {
        // idem
      }
    }
  }, []);

  return <PaginaObrigado />;
}
