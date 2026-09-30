import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { processarResumos } from "@/lib/video.server";

// Chamada pelo pg_cron 'video-resumo' (a cada 30s, só quando há visita parada
// há 2 min sem resumo). Autentica pelo cron_token de whatsapp_config.
export const Route = createFileRoute("/api/public/video/process")({
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

        return Response.json(await processarResumos(supabase, new URL(request.url).origin));
      },
    },
  },
});
