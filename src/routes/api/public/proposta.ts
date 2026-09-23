import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Leitura pública da proposta pelo link /p/:slug. Sem token: devolve só
// os campos que o cliente vê, nunca a lista de propostas.
const PUBLIC_COLUMNS = [
  "slug",
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
  "updated_at",
].join(",");

const BodySchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/i)
    .max(80),
});

export const Route = createFileRoute("/api/public/proposta")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        let body;
        try {
          body = BodySchema.parse(await request.json());
        } catch {
          return Response.json({ data: null });
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data, error } = await supabase
          .from("proposals")
          .select(PUBLIC_COLUMNS)
          .eq("slug", body.slug.toLowerCase())
          .maybeSingle();
        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ data });
      },
    },
  },
});
