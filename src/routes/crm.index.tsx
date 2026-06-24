import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { crmLogin, isCrmAuthed } from "@/lib/crm-auth";

export const Route = createFileRoute("/crm/")({
  ssr: false,
  component: CrmLogin,
});

function CrmLogin() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isCrmAuthed()) navigate({ to: "/crm/kanban" });
  }, [navigate]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (crmLogin(user, pass)) {
      navigate({ to: "/crm/kanban" });
    } else {
      setError(true);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: "#F4F2EF", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-lg border bg-white p-8"
        style={{ borderColor: "#E0DED9" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Legacy BrandCo.
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
          Acesso ao CRM
        </h1>

        <div className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-neutral-700">Usuário</span>
            <input
              required
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoComplete="username"
              className="rounded-md border bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
              style={{ borderColor: "#E0DED9" }}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-neutral-700">Senha</span>
            <input
              required
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
              className="rounded-md border bg-white px-3 py-2.5 text-sm outline-none focus:border-neutral-900"
              style={{ borderColor: "#E0DED9" }}
            />
          </label>

          {error && (
            <p className="text-sm text-red-600">Usuário ou senha inválidos.</p>
          )}

          <button
            type="submit"
            className="mt-2 rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Entrar
          </button>
        </div>
      </form>
    </div>
  );
}
