import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const LeadSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  whatsapp: z.string().trim().min(10).max(20),
  instagram: z.string().trim().min(2).max(40),
  faturamento: z.string().trim().min(1).max(80),
  utm_source: z.string().max(120).nullish(),
  utm_medium: z.string().max(120).nullish(),
  utm_campaign: z.string().max(120).nullish(),
  utm_content: z.string().max(120).nullish(),
  utm_term: z.string().max(120).nullish(),
});

async function notify(origin: string, lead: z.infer<typeof LeadSchema>) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      console.error("[lead-notify] missing supabase env");
      return;
    }
    // Mint a short-lived service token to call the protected send route
    const res = await fetch(`${origin}/lovable/email/transactional/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        templateName: "new-lead",
        templateData: {
          ...lead,
          recebido_em: new Date().toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
          }),
        },
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[lead-notify] send failed", res.status, text);
    }
  } catch (err) {
    console.error("[lead-notify] error", err);
  }
}

export const Route = createFileRoute("/api/public/leads/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        let parsed;
        try {
          const body = await request.json();
          parsed = LeadSchema.parse(body);
        } catch (err) {
          return Response.json(
            { error: "Invalid payload", details: String(err) },
            { status: 400 },
          );
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { error: insertError } = await supabase.from("leads").insert({
          nome: parsed.nome,
          whatsapp: parsed.whatsapp,
          instagram: parsed.instagram,
          faturamento: parsed.faturamento,
          utm_source: parsed.utm_source ?? null,
          utm_medium: parsed.utm_medium ?? null,
          utm_campaign: parsed.utm_campaign ?? null,
          utm_content: parsed.utm_content ?? null,
          utm_term: parsed.utm_term ?? null,
          coluna: "novo-lead",
        });

        if (insertError) {
          console.error("[leads-submit] insert error", insertError);
          return Response.json({ error: "Failed to save lead" }, { status: 500 });
        }

        const origin = new URL(request.url).origin;
        // Await the enqueue so the worker doesn't exit before it runs.
        // Enqueue is fast (pgmq insert); actual delivery happens in the cron.
        await notify(origin, parsed);

        return Response.json({ success: true });
      },
    },
  },
});
