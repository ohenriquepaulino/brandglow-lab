import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list_leads") }),
  z.object({ action: z.literal("list_historico"), lead_id: z.string().uuid() }),
  z.object({
    action: z.literal("update_column"),
    id: z.string().uuid(),
    coluna: z.string().min(1).max(60),
    coluna_origem: z.string().min(1).max(60),
  }),
  z.object({
    action: z.literal("update_anotacoes"),
    id: z.string().uuid(),
    anotacoes: z.string().max(5000),
  }),
  z.object({ action: z.literal("delete_lead"), id: z.string().uuid() }),
]);

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export const Route = createFileRoute("/api/public/crm/data")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("x-crm-token");
        const expected = process.env.CRM_API_TOKEN;
        if (!expected || !token || token !== expected) return unauthorized();

        const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        let payload;
        try {
          payload = ActionSchema.parse(await request.json());
        } catch (err) {
          return Response.json({ error: "Invalid payload", details: String(err) }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        switch (payload.action) {
          case "list_leads": {
            const { data, error } = await supabase
              .from("leads")
              .select("*")
              .order("criado_em", { ascending: false });
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ data });
          }
          case "list_historico": {
            const { data, error } = await supabase
              .from("historico_movimentacoes")
              .select("*")
              .eq("lead_id", payload.lead_id)
              .order("movido_em", { ascending: false });
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ data });
          }
          case "update_column": {
            const { error } = await supabase
              .from("leads")
              .update({ coluna: payload.coluna })
              .eq("id", payload.id);
            if (error) return Response.json({ error: error.message }, { status: 500 });
            await supabase.from("historico_movimentacoes").insert({
              lead_id: payload.id,
              coluna_origem: payload.coluna_origem,
              coluna_destino: payload.coluna,
            });
            return Response.json({ success: true });
          }
          case "update_anotacoes": {
            const { data, error } = await supabase
              .from("leads")
              .update({ anotacoes: payload.anotacoes })
              .eq("id", payload.id)
              .select()
              .single();
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ data });
          }
          case "delete_lead": {
            await supabase.from("historico_movimentacoes").delete().eq("lead_id", payload.id);
            const { error } = await supabase.from("leads").delete().eq("id", payload.id);
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ success: true });
          }
        }
      },
    },
  },
});
