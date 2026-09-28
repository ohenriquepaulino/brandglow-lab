import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { SEM_FATURAMENTO } from "@/lib/crm-auth";

// Resultado do teste A/B /ads (A = /adsa, B = /adsb) para o painel do CRM.
// Visitantes vêm de ab_visitas; conversões de leads.pagina.
const ActionSchema = z.object({
  action: z.literal("resumo"),
  /** ISO. Sem data: desde a primeira visita registrada (início do teste). */
  desde: z.string().datetime().nullish(),
  campanha: z.string().max(120).nullish(),
});

const PAGINA_VARIANTE: Record<string, "a" | "b"> = { "/adsa": "a", "/adsb": "b" };
// Colunas do Kanban que contam como "avançou no funil".
const AVANCADOS = new Set(["reuniao-agendada", "fechamento", "ganho"]);

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export const Route = createFileRoute("/api/public/crm/ab")({
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

        const { data: primeira } = await supabase
          .from("ab_visitas")
          .select("criado_em")
          .eq("teste", "ads")
          .order("criado_em", { ascending: true })
          .limit(1)
          .maybeSingle();
        const inicio: string | null = primeira?.criado_em ?? null;
        const desde = payload.desde ?? inicio ?? new Date().toISOString();
        const campanha = payload.campanha?.trim() || null;

        const [visitas, campanhas, leadsRes] = await Promise.all([
          supabase.rpc("ab_resumo", { p_teste: "ads", p_desde: desde, p_campanha: campanha }),
          supabase.rpc("ab_campanhas", { p_teste: "ads" }),
          (() => {
            let q = supabase
              .from("leads")
              .select("pagina, faturamento, coluna")
              .in("pagina", Object.keys(PAGINA_VARIANTE))
              .gte("criado_em", desde);
            if (campanha) q = q.eq("utm_campaign", campanha);
            return q;
          })(),
        ]);
        if (visitas.error) return Response.json({ error: visitas.error.message }, { status: 500 });
        if (leadsRes.error) return Response.json({ error: leadsRes.error.message }, { status: 500 });

        const base = () => ({ visitantes: 0, visitas: 0, leads: 0, qualificados: 0, avancados: 0 });
        const variantes = { a: base(), b: base() };
        for (const r of (visitas.data ?? []) as {
          variante: "a" | "b";
          visitantes: number;
          visitas: number;
        }[]) {
          if (!variantes[r.variante]) continue;
          variantes[r.variante].visitantes = Number(r.visitantes);
          variantes[r.variante].visitas = Number(r.visitas);
        }
        for (const l of leadsRes.data ?? []) {
          const v = PAGINA_VARIANTE[l.pagina ?? ""];
          if (!v) continue;
          variantes[v].leads++;
          if ((l.faturamento ?? "").trim().toLowerCase() !== SEM_FATURAMENTO.toLowerCase()) {
            variantes[v].qualificados++;
          }
          if (AVANCADOS.has(l.coluna)) variantes[v].avancados++;
        }

        return Response.json({
          inicio,
          desde,
          campanha,
          campanhas: (campanhas.data ?? []).map((c: { campanha: string }) => c.campanha),
          variantes,
        });
      },
    },
  },
});
