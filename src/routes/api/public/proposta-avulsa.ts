import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Propostas avulsas (ex.: /propostadra). "get" é público; "save" exige o token do CRM.
const Slug = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .max(80);

const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("get"), slug: Slug }),
  z.object({
    action: z.literal("save"),
    slug: Slug,
    data: z.record(z.string(), z.unknown()),
  }),
]);

export const Route = createFileRoute("/api/public/proposta-avulsa")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        let payload;
        try {
          payload = ActionSchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        if (payload.action === "get") {
          const { data, error } = await supabase
            .from("custom_proposals")
            .select("data, updated_at")
            .eq("slug", payload.slug)
            .maybeSingle();
          if (error) return Response.json({ error: error.message }, { status: 500 });
          return Response.json({ data });
        }

        const token = request.headers.get("x-crm-token");
        const expected = process.env.CRM_API_TOKEN;
        if (!expected || !token || token !== expected) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (JSON.stringify(payload.data).length > 50_000) {
          return Response.json({ error: "Conteúdo grande demais" }, { status: 413 });
        }
        const { error } = await supabase
          .from("custom_proposals")
          .upsert({ slug: payload.slug, data: payload.data, updated_at: new Date().toISOString() });
        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ success: true });
      },
    },
  },
});
