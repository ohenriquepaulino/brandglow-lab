import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { makeSlug } from "@/features/proposta/format";

const PatchSchema = z
  .object({
    client_name: z.string().max(120),
    cover_label: z.string().max(120),
    show_diagnosis: z.boolean(),
    diagnosis_moment: z.string().max(400).nullable(),
    diagnosis_challenge: z.string().max(400).nullable(),
    diagnosis_goal: z.string().max(400).nullable(),
    price_total: z.number().min(0).max(9999999999),
    installments: z.number().int().min(1).max(12),
    installments_note: z.string().max(160),
    cash_discount_pct: z.number().min(0).max(100),
    cash_note: z.string().max(160),
    deadline_days: z.number().int().min(1).max(365),
    valid_until: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
    whatsapp: z
      .string()
      .regex(/^[0-9]{12,13}$/)
      .nullable(),
  })
  .partial()
  .strict();

const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({ action: z.literal("get"), id: z.string().uuid() }),
  z.object({ action: z.literal("create"), client_name: z.string().max(120) }),
  z.object({ action: z.literal("update"), id: z.string().uuid(), patch: PatchSchema }),
  z.object({ action: z.literal("duplicate"), id: z.string().uuid() }),
  z.object({ action: z.literal("delete"), id: z.string().uuid() }),
]);

// Colunas copiadas ao duplicar (tudo menos id, slug e datas).
const COPY_COLUMNS = [
  "client_name",
  "cover_label",
  "show_diagnosis",
  "diagnosis_moment",
  "diagnosis_challenge",
  "diagnosis_goal",
  "price_total",
  "installments",
  "installments_note",
  "cash_discount_pct",
  "cash_note",
  "deadline_days",
  "valid_until",
  "whatsapp",
] as const;

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export const Route = createFileRoute("/api/public/crm/proposals")({
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

        // Insere com link único; tenta de novo se o slug colidir (23505).
        async function insertWithSlug(row: Record<string, unknown>) {
          const name = typeof row.client_name === "string" ? row.client_name : "";
          for (let attempt = 0; attempt < 4; attempt++) {
            const { data, error } = await supabase
              .from("proposals")
              .insert({ ...row, slug: makeSlug(name || "proposta") })
              .select()
              .single();
            if (!error) return Response.json({ data });
            if (error.code !== "23505")
              return Response.json({ error: error.message }, { status: 500 });
          }
          return Response.json({ error: "Não foi possível gerar um link único." }, { status: 500 });
        }

        switch (payload.action) {
          case "list": {
            const { data, error } = await supabase
              .from("proposals")
              .select("*")
              .order("updated_at", { ascending: false });
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ data });
          }

          case "get": {
            const { data, error } = await supabase
              .from("proposals")
              .select("*")
              .eq("id", payload.id)
              .maybeSingle();
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ data });
          }

          case "create":
            return insertWithSlug({ client_name: payload.client_name.trim() });

          case "update": {
            const { data, error } = await supabase
              .from("proposals")
              .update(payload.patch)
              .eq("id", payload.id)
              .select()
              .single();
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ data });
          }

          case "duplicate": {
            const { data: original, error } = await supabase
              .from("proposals")
              .select(COPY_COLUMNS.join(","))
              .eq("id", payload.id)
              .single();
            if (error || !original) {
              return Response.json({ error: error?.message ?? "Not found" }, { status: 404 });
            }
            const copy = { ...(original as unknown as Record<string, unknown>) };
            copy.client_name = copy.client_name ? `${copy.client_name} (cópia)`.slice(0, 120) : "";
            return insertWithSlug(copy);
          }

          case "delete": {
            const { error } = await supabase.from("proposals").delete().eq("id", payload.id);
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ success: true });
          }
        }
      },
    },
  },
});
