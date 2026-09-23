import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isCrmAuthed } from "@/lib/crm-auth";
import ProposalEditPage from "@/features/proposta/admin/ProposalEditPage";

export const Route = createFileRoute("/crm/propostas/$id")({
  ssr: false,
  component: PropostaEditRoute,
});

function PropostaEditRoute() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!isCrmAuthed()) {
      navigate({ to: "/crm" });
      return;
    }
    setAuthed(true);
  }, [navigate]);

  if (!authed) return null;

  return (
    <ProposalEditPage
      key={id}
      id={id}
      onBack={() => navigate({ to: "/crm/propostas" })}
      onOpen={(next) => navigate({ to: "/crm/propostas/$id", params: { id: next } })}
    />
  );
}
