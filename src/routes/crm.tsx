import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/crm")({
  ssr: false,
  component: () => <Outlet />,
});
