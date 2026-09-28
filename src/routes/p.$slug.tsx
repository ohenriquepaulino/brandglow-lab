import { createFileRoute } from "@tanstack/react-router";
import PublicProposalPage from "@/features/proposta/pages/PublicProposalPage";
import { HideLovableBadge } from "@/components/HideLovableBadge";

// Pública: fora do CRM e sem login. Só leitura, pelo slug.
export const Route = createFileRoute("/p/$slug")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: PublicProposalRoute,
});

function PublicProposalRoute() {
  const { slug } = Route.useParams();
  return (
    <>
      <HideLovableBadge />
      <PublicProposalPage slug={slug} />
    </>
  );
}
