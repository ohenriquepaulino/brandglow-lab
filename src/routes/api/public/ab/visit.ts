import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Visita de uma variante do teste A/B (ver src/lib/ab.ts). Pública, sem
// token: só grava a linha, nunca devolve dados.
const VisitSchema = z.object({
  teste: z.literal("ads"),
  variante: z.enum(["a", "b"]),
  visitante: z.string().trim().min(8).max(64),
  via_split: z.boolean(),
  utm_source: z.string().max(120).nullish(),
  utm_campaign: z.string().max(120).nullish(),
  utm_content: z.string().max(120).nullish(),
});

export const Route = createFileRoute("/api/public/ab/visit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        let v;
        try {
          v = VisitSchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { error } = await supabase.from("ab_visitas").insert({
          teste: v.teste,
          variante: v.variante,
          visitante: v.visitante,
          via_split: v.via_split,
          utm_source: v.utm_source ?? null,
          utm_campaign: v.utm_campaign ?? null,
          utm_content: v.utm_content ?? null,
        });
        if (error) {
          console.error("[ab] visita", error.message);
          return Response.json({ error: "Failed" }, { status: 500 });
        }
        return Response.json({ success: true });
      },
    },
  },
});
