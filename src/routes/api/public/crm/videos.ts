import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { percentual } from "@/lib/video";

// Apresentações em vídeo para a tela Vídeos do CRM.
const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({
    action: z.literal("create_video"),
    titulo: z.string().trim().min(1).max(120),
    youtube_id: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
  }),
  z.object({
    action: z.literal("update_video"),
    id: z.string().uuid(),
    titulo: z.string().trim().min(1).max(120),
  }),
  z.object({ action: z.literal("delete_video"), id: z.string().uuid() }),
  z.object({
    action: z.literal("create_link"),
    video_id: z.string().uuid(),
    destinatario: z.string().trim().min(1).max(120),
    lead_id: z.string().uuid().nullish(),
  }),
  z.object({ action: z.literal("delete_link"), id: z.string().uuid() }),
  z.object({ action: z.literal("sessoes"), link_id: z.string().uuid() }),
]);

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

/** "João Silva" -> "joao-silva-k3x9q2". O final aleatório impede adivinhar o link. */
function slugDoLink(nome: string) {
  const base =
    nome
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "video";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const rand = Array.from(bytes, (b) => "abcdefghijkmnpqrstuvwxyz23456789"[b % 32]).join("");
  return `${base}-${rand}`;
}

type SessaoResumo = {
  link_id: string;
  assistidos: number[];
  iniciado_em: string;
  ultimo_evento_em: string;
  deu_play: boolean;
  chegou_ao_fim: boolean;
};

export const Route = createFileRoute("/api/public/crm/videos")({
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
        const fail = (e: { message: string }) =>
          Response.json({ error: e.message }, { status: 500 });

        switch (payload.action) {
          case "list": {
            const [videos, links, sessoes] = await Promise.all([
              supabase.from("videos").select("*").order("criado_em", { ascending: false }),
              supabase
                .from("video_links")
                .select("id, video_id, slug, destinatario, lead_id, criado_em")
                .order("criado_em", { ascending: false }),
              supabase
                .from("video_sessoes")
                .select("link_id, assistidos, iniciado_em, ultimo_evento_em, deu_play, chegou_ao_fim")
                .order("iniciado_em", { ascending: false })
                .limit(5000),
            ]);
            if (videos.error) return fail(videos.error);
            if (links.error) return fail(links.error);
            if (sessoes.error) return fail(sessoes.error);

            const duracao = new Map(
              (videos.data ?? []).map((v) => [v.id as string, v.duracao_seg as number | null]),
            );
            const porLink = new Map<string, SessaoResumo[]>();
            for (const s of (sessoes.data ?? []) as SessaoResumo[]) {
              const arr = porLink.get(s.link_id) ?? [];
              arr.push(s);
              porLink.set(s.link_id, arr);
            }

            // Por link: o total assistido junta todas as visitas.
            const linksOut = (links.data ?? []).map((l) => {
              const ss = porLink.get(l.id) ?? [];
              const vistos = new Set<number>();
              for (const s of ss) for (const x of s.assistidos ?? []) vistos.add(x);
              return {
                ...l,
                visitas: ss.length,
                ultimo_acesso: ss.reduce<string | null>(
                  (m, s) => (!m || s.ultimo_evento_em > m ? s.ultimo_evento_em : m),
                  null,
                ),
                deu_play: ss.some((s) => s.deu_play),
                chegou_ao_fim: ss.some((s) => s.chegou_ao_fim),
                segundos_assistidos: vistos.size,
                percentual: percentual(vistos.size, duracao.get(l.video_id)),
              };
            });

            return Response.json({
              data: (videos.data ?? []).map((v) => ({
                ...v,
                links: linksOut.filter((l) => l.video_id === v.id),
              })),
            });
          }

          case "create_video": {
            const { data, error } = await supabase
              .from("videos")
              .insert({ titulo: payload.titulo, youtube_id: payload.youtube_id })
              .select()
              .single();
            if (error) return fail(error);
            return Response.json({ data });
          }

          case "update_video": {
            const { error } = await supabase
              .from("videos")
              .update({ titulo: payload.titulo })
              .eq("id", payload.id);
            if (error) return fail(error);
            return Response.json({ success: true });
          }

          case "delete_video": {
            const { error } = await supabase.from("videos").delete().eq("id", payload.id);
            if (error) return fail(error);
            return Response.json({ success: true });
          }

          case "create_link": {
            for (let attempt = 0; attempt < 4; attempt++) {
              const { data, error } = await supabase
                .from("video_links")
                .insert({
                  video_id: payload.video_id,
                  destinatario: payload.destinatario,
                  lead_id: payload.lead_id ?? null,
                  slug: slugDoLink(payload.destinatario),
                })
                .select("id, video_id, slug, destinatario, lead_id, criado_em")
                .single();
              if (!error) return Response.json({ data });
              if (error.code !== "23505") return fail(error);
            }
            return Response.json({ error: "Não foi possível gerar um link único." }, { status: 500 });
          }

          case "delete_link": {
            const { error } = await supabase.from("video_links").delete().eq("id", payload.id);
            if (error) return fail(error);
            return Response.json({ success: true });
          }

          case "sessoes": {
            const { data: sessoes, error } = await supabase
              .from("video_sessoes")
              .select(
                "id, dispositivo, iniciado_em, ultimo_evento_em, deu_play, assistidos, maximo_seg, posicao_seg, chegou_ao_fim",
              )
              .eq("link_id", payload.link_id)
              .order("iniciado_em", { ascending: false })
              .limit(100);
            if (error) return fail(error);
            const ids = (sessoes ?? []).map((s) => s.id);
            const { data: eventos, error: evErr } = ids.length
              ? await supabase
                  .from("video_eventos")
                  .select("sessao_id, tipo, posicao_seg, de_seg, criado_em")
                  .in("sessao_id", ids)
                  .order("criado_em", { ascending: true })
                  .limit(3000)
              : { data: [], error: null };
            if (evErr) return fail(evErr);
            return Response.json({
              data: (sessoes ?? []).map((s) => ({
                ...s,
                eventos: (eventos ?? []).filter((e) => e.sessao_id === s.id),
              })),
            });
          }
        }
      },
    },
  },
});
