import { Link, useRouterState } from "@tanstack/react-router";
import { FileText, KanbanSquare, ListChecks, MessageCircle } from "lucide-react";

const NAV_ITEMS = [
  { to: "/crm/kanban", label: "Leads", icon: KanbanSquare },
  { to: "/crm/tarefas", label: "Tarefas", icon: ListChecks },
  { to: "/crm/propostas", label: "Propostas", icon: FileText },
  { to: "/crm/whatsapp", label: "WhatsApp", icon: MessageCircle },
] as const;

export function CrmSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className="flex w-16 shrink-0 flex-col items-center gap-1 border-r bg-white py-4 md:w-52 md:items-stretch md:px-3"
      style={{ borderColor: "#E0DED9" }}
    >
      <p className="mb-3 hidden px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 md:block">
        Legacy BrandCo.
      </p>
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              style={{
                background: active ? "#ECE9E4" : "transparent",
                color: active ? "#121110" : "#57534E",
              }}
            >
              <Icon size={18} strokeWidth={2} />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
