import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { quemRecebeuOLink } from "@/lib/link-enviado.server";

// Quem recebeu um link pelo WhatsApp (ex.: o vídeo genérico) e se abriu.
// Body: { slug, desde: "AAAA-MM-DD" }. Chamada manual via pg_net, com o
// cron_token de whatsapp_config, como as outras rotas de /whatsapp.
export const Route = createFileRoute("/api/public/whatsapp/link-enviado")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const token = request.headers.get("x-cron-token");
        const { data: config } = await supabase
          .from("whatsapp_config")
          .select("cron_token")
          .eq("id", 1)
          .maybeSingle();
        if (!token || !config?.cron_token || token !== config.cron_token) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = (await request.json().catch(() => ({}))) as {
          slug?: unknown;
          desde?: unknown;
        };
        const slug = typeof body.slug === "string" ? body.slug.trim() : "";
        const desde = new Date(typeof body.desde === "string" ? body.desde : "");
        if (!/^[a-z0-9-]{3,80}$/.test(slug) || Number.isNaN(desde.getTime())) {
          return Response.json(
            { error: "slug e desde (AAAA-MM-DD) são obrigatórios" },
            { status: 400 },
          );
        }

        try {
          return Response.json(await quemRecebeuOLink(supabase, slug, desde));
        } catch (e) {
          console.error("[link-enviado]", e);
          return Response.json(
            { error: e instanceof Error ? e.message : String(e) },
            { status: 502 },
          );
        }
      },
    },
  },
});
