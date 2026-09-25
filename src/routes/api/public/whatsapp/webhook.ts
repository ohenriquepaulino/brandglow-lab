import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { moverLeadsQueResponderam } from "@/lib/whatsapp.server";

// Webhook da Evolution (MESSAGES_UPSERT). A Evolution não manda header
// customizado: autentica pelo ?token= (whatsapp_config.webhook_token).
// Responde sempre 200 rápido — a Evolution reenvia em caso de erro.
export const Route = createFileRoute("/api/public/whatsapp/webhook")({
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

        const token = new URL(request.url).searchParams.get("token");
        const { data: config } = await supabase
          .from("whatsapp_config")
          .select("webhook_token")
          .eq("id", 1)
          .maybeSingle();
        if (!token || !config?.webhook_token || token !== config.webhook_token) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const payload = await request.json().catch(() => ({}));
          const movidos = await moverLeadsQueResponderam(supabase, payload);
          return Response.json({ ok: true, movidos });
        } catch (e) {
          console.error("[whatsapp-webhook] error", e);
          return Response.json({ ok: false });
        }
      },
    },
  },
});
