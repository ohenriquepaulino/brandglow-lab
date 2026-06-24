import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/crm")({
  ssr: false,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: () => <Outlet />,
});
