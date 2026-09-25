import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  conectar,
  desconectar,
  enviarTexto,
  estadoDaConexao,
  evolutionConfigurada,
  montarMensagem,
  normalizarTelefone,
} from "@/lib/whatsapp.server";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("get") }),
  z.object({ action: z.literal("status") }),
  z.object({ action: z.literal("connect") }),
  z.object({ action: z.literal("disconnect") }),
  z.object({
    action: z.literal("save_config"),
    ativo: z.boolean(),
    mensagem: z.string().trim().min(1).max(2000),
    atraso_segundos: z.number().int().min(0).max(3600),
  }),
  z.object({
    action: z.literal("send_test"),
    telefone: z.string().trim().min(10).max(20),
    mensagem: z.string().trim().min(1).max(2000),
  }),
  z.object({ action: z.literal("list_envios_lead"), lead_id: z.string().uuid() }),
]);

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

function erro(e: unknown, status = 502) {
  return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status });
}

export const Route = createFileRoute("/api/public/crm/whatsapp")({
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
          case "get": {
            const [{ data: config, error }, { data: envios }] = await Promise.all([
              supabase
                .from("whatsapp_config")
                .select("ativo, mensagem, atraso_segundos")
                .eq("id", 1)
                .maybeSingle(),
              supabase
                .from("whatsapp_envios")
                .select("id, lead_id, telefone, status, erro, criado_em, enviar_em, leads(nome)")
                .order("criado_em", { ascending: false })
                .limit(20),
            ]);
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({
              data: { config, envios: envios ?? [], evolution_configurada: evolutionConfigurada() },
            });
          }
          case "status": {
            if (!evolutionConfigurada()) {
              return Response.json({ data: { estado: "nao_configurado", numero: null } });
            }
            try {
              return Response.json({ data: await estadoDaConexao() });
            } catch (e) {
              return erro(e);
            }
          }
          case "connect": {
            try {
              return Response.json({ data: await conectar() });
            } catch (e) {
              return erro(e);
            }
          }
          case "disconnect": {
            try {
              await desconectar();
              return Response.json({ success: true });
            } catch (e) {
              return erro(e);
            }
          }
          case "save_config": {
            const { error } = await supabase.from("whatsapp_config").upsert({
              id: 1,
              ativo: payload.ativo,
              mensagem: payload.mensagem,
              atraso_segundos: payload.atraso_segundos,
              updated_at: new Date().toISOString(),
            });
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ success: true });
          }
          case "send_test": {
            try {
              await enviarTexto(
                normalizarTelefone(payload.telefone),
                montarMensagem(payload.mensagem, "Teste"),
              );
              return Response.json({ success: true });
            } catch (e) {
              return erro(e);
            }
          }
          case "list_envios_lead": {
            const { data, error } = await supabase
              .from("whatsapp_envios")
              .select("id, lead_id, telefone, status, erro, criado_em, enviar_em")
              .eq("lead_id", payload.lead_id)
              .order("criado_em", { ascending: false });
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ data: data ?? [] });
          }
        }
      },
    },
  },
});
