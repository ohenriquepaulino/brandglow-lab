import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

// Link da bio do Instagram: cai direto no WhatsApp do atendimento.
const WHATSAPP_ATENDIMENTO = "5511966064917";
const MENSAGEM = "Oi! Vim do Instagram e quero saber mais sobre a Legacy.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_ATENDIMENTO}?text=${encodeURIComponent(MENSAGEM)}`;

export const Route = createFileRoute("/whatsapp")({
  // Redireciona antes de renderizar: abre mais rápido no navegador interno do
  // Instagram, que corta o JS no meio da navegação.
  beforeLoad: () => {
    throw redirect({ href: WHATSAPP_URL, statusCode: 302 });
  },
  head: () => ({
    meta: [
      { title: "WhatsApp, Legacy BrandCo." },
      {
        name: "description",
        content: "Fale com a Legacy BrandCo. no WhatsApp.",
      },
      { property: "og:title", content: "WhatsApp, Legacy BrandCo." },
      {
        property: "og:description",
        content: "Fale com a Legacy BrandCo. no WhatsApp.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WhatsappPage,
});

function WhatsappPage() {
  useEffect(() => {
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    if (typeof fbq === "function") fbq("trackCustom", "CliqueWhatsAppInstagram");
    window.location.replace(WHATSAPP_URL);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink px-6 text-center text-cream">
      <p className="text-lg">Abrindo o WhatsApp...</p>
      <a
        href={WHATSAPP_URL}
        className="rounded-full bg-lime-brand px-6 py-3 text-sm font-semibold text-ink"
      >
        Toque aqui se não abrir
      </a>
    </div>
  );
}
