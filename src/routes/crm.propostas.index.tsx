import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { crmLogout, isCrmAuthed } from "@/lib/crm-auth";
import { CrmSidebar } from "@/components/crm/Sidebar";
import ProposalsListPage from "@/features/proposta/admin/ProposalsListPage";

export const Route = createFileRoute("/crm/propostas/")({
  ssr: false,
  component: PropostasPage,
});

function PropostasPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isCrmAuthed()) {
      navigate({ to: "/crm" });
      return;
    }
    setAuthed(true);
  }, [navigate]);

  function handleLogout() {
    crmLogout();
    navigate({ to: "/crm" });
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#F4F2EF", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <CrmSidebar />

      <div className="min-w-0 flex-1">
        <header
          className="flex items-center justify-between border-b bg-white px-6 py-3"
          style={{ borderColor: "#E0DED9" }}
        >
          <p className="text-sm font-semibold text-neutral-900">Propostas</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              style={{ borderColor: "#E0DED9" }}
            >
              Atualizar
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              style={{ borderColor: "#E0DED9" }}
            >
              Sair
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-6">
          {authed && (
            <ProposalsListPage
              key={reloadKey}
              onOpen={(id) => navigate({ to: "/crm/propostas/$id", params: { id } })}
            />
          )}
        </main>
      </div>
    </div>
  );
}
