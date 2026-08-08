import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const LeadSchema = z.object({
  nome: z.string().trim().min(2).max(100),
  whatsapp: z.string().trim().min(10).max(20),
  instagram: z.string().trim().max(40).nullish(),
  faturamento: z.string().trim().min(1).max(80),
  profissao: z.string().trim().max(80).nullish(),

  utm_source: z.string().max(120).nullish(),
  utm_medium: z.string().max(120).nullish(),
  utm_campaign: z.string().max(120).nullish(),
  utm_content: z.string().max(120).nullish(),
  utm_term: z.string().max(120).nullish(),
  skip_meta: z.boolean().nullish(),
  event_id: z.string().max(80).nullish(),
  page_url: z.string().max(500).nullish(),
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
          instagram: lead.instagram?.trim() ? lead.instagram : "—",
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

async function sha256Hex(value: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readCookie(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

async function sendMetaLead(
  request: Request,
  lead: z.infer<typeof LeadSchema>,
  eventId: string,
  eventSourceUrl: string,
) {
  try {
    const pixelId = process.env["META_PIXEL_ID"];
    const token = process.env["META_CAPI_ACCESS_TOKEN"];
    if (!pixelId || !token) {
      console.error("[meta-capi] missing env");
      return;
    }
    const cookies = request.headers.get("cookie");
    const digits = lead.whatsapp.replace(/\D/g, "");
    const phoneE164 = digits.length >= 10 ? `55${digits}` : digits;
    const userData: Record<string, unknown> = {
      client_user_agent: request.headers.get("user-agent") ?? undefined,
      client_ip_address:
        request.headers.get("cf-connecting-ip") ??
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      fbp: readCookie(cookies, "_fbp"),
      fbc: readCookie(cookies, "_fbc"),
      ph: [await sha256Hex(phoneE164)],
      fn: [await sha256Hex(lead.nome.trim().toLowerCase().split(" ")[0] ?? "")],
      country: [await sha256Hex("br")],
    };
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Lead",
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              event_source_url: eventSourceUrl,
              action_source: "website",
              user_data: userData,
            },
          ],
        }),
      },
    );
    if (!res.ok) {
      console.error("[meta-capi] failed", res.status, await res.text());
    }
  } catch (err) {
    console.error("[meta-capi] error", err);
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
          instagram: parsed.instagram?.trim() ? parsed.instagram : null,
          faturamento: parsed.faturamento,
          profissao: parsed.profissao?.trim() ? parsed.profissao.trim() : null,

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
        if (!parsed.skip_meta) {
          await sendMetaLead(
            request,
            parsed,
            parsed.event_id ?? crypto.randomUUID(),
            parsed.page_url ?? origin,
          );
        }

        return Response.json({ success: true });
      },
    },
  },
});
