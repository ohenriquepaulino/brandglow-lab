import { createFileRoute } from "@tanstack/react-router";
import PropostaAvulsa from "@/features/proposta/avulsa/PropostaAvulsa";
import { DRA_DEFAULTS } from "@/features/proposta/avulsa/defaults";
import { HideLovableBadge } from "@/components/HideLovableBadge";

// Proposta avulsa da Smantjie. Pública pelo link, fora do Google.
// Logado no CRM, aparece a barra de edição no topo.
export const Route = createFileRoute("/propostadra")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Proposta Legacy BrandCo." },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <>
      <HideLovableBadge />
      <PropostaAvulsa slug="propostadra" defaults={DRA_DEFAULTS} />
    </>
  ),
});
