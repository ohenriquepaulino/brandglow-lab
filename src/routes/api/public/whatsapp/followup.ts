import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { enviarResumoFollowup } from "@/lib/followup.server";

// Chamada pelo pg_cron 'followup-resumo' (8h de Brasília, segunda a sexta).
// Autentica pelo cron_token guardado em whatsapp_config.
export const Route = createFileRoute("/api/public/whatsapp/followup")({
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
          .select("cron_token, followup_resumo_ativo")
          .eq("id", 1)
          .maybeSingle();
        if (!token || !config?.cron_token || token !== config.cron_token) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (!config.followup_resumo_ativo) return Response.json({ enviado: false });

        try {
          return Response.json(await enviarResumoFollowup(supabase));
        } catch (e) {
          console.error("[followup] resumo falhou", e);
          return Response.json(
            { error: e instanceof Error ? e.message : String(e) },
            { status: 502 },
          );
        }
      },
    },
  },
});
