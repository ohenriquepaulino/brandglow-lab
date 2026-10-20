import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { GeminiOcupado, conversar, listarModelos, textoDoStream } from "@/lib/conselheiro.server";

const Imagem = z.object({
  mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  base64: z.string().max(6_000_000),
});

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("chat"),
    stream: z.boolean().optional(),
    mensagens: z
      .array(
        z.object({
          papel: z.enum(["user", "model"]),
          texto: z.string().max(20_000),
          imagens: z.array(Imagem).max(4).optional(),
        }),
      )
      .min(1)
      .max(60),
  }),
  z.object({ action: z.literal("modelos") }),
]);

// Chat do conselheiro de vendas. Autentica como as outras rotas do CRM
// (x-crm-token) ou pelo cron_token, para testes pelo banco.
export const Route = createFileRoute("/api/public/crm/conselheiro")({
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

        const crmToken = request.headers.get("x-crm-token");
        const cronToken = request.headers.get("x-cron-token");
        let autorizado = !!crmToken && crmToken === process.env.CRM_API_TOKEN;
        if (!autorizado && cronToken) {
          const { data } = await supabase
            .from("whatsapp_config")
            .select("cron_token")
            .eq("id", 1)
            .maybeSingle();
          autorizado = !!data?.cron_token && cronToken === data.cron_token;
        }
        if (!autorizado) return Response.json({ error: "Unauthorized" }, { status: 401 });

        let payload;
        try {
          payload = ActionSchema.parse(await request.json());
        } catch (err) {
          return Response.json({ error: "Invalid payload", details: String(err) }, { status: 400 });
        }

        try {
          if (payload.action === "modelos") {
            return Response.json({ modelos: await listarModelos() });
          }
          const { data: config } = await supabase
            .from("conselheiro_config")
            .select("instrucoes, modelo")
            .eq("id", 1)
            .maybeSingle();
          if (!config?.instrucoes?.trim()) {
            return Response.json({ error: "Base do conselheiro vazia" }, { status: 500 });
          }
          const stream = await conversar(config.instrucoes, config.modelo, payload.mensagens);
          if (payload.stream) {
            return new Response(stream, {
              headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
            });
          }
          return Response.json({ resposta: await textoDoStream(stream) });
        } catch (e) {
          console.error("[conselheiro]", e);
          return Response.json(
            { error: e instanceof Error ? e.message : String(e) },
            { status: e instanceof GeminiOcupado ? 503 : 502 },
          );
        }
      },
    },
  },
});
