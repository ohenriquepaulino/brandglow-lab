import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { avisarAbertura } from "@/lib/video.server";

// Página /v/:slug. Pública, sem token:
//   - dados: o vídeo do link (a página chama junto com "abrir", sem esperar);
//   - abrir: abre (ou retoma) a visita e avisa a equipe;
//   - progresso: segundos assistidos + eventos (play, pause, fim, voltou, pulou).
// Nunca devolve dados de outros links nem das visitas.
const MAX_SEG = 6 * 60 * 60;

const Evento = z.object({
  tipo: z.enum(["play", "pause", "fim", "voltou", "pulou"]),
  posicao: z.number().int().min(0).max(MAX_SEG),
  de: z.number().int().min(0).max(MAX_SEG).nullish(),
});

const Slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/i).max(100);

const ActionSchema = z.discriminatedUnion("action", [
  /** Só o vídeo do link: uma leitura, para a página aparecer logo. */
  z.object({ action: z.literal("dados"), slug: Slug }),
  z.object({
    action: z.literal("abrir"),
    slug: Slug,
    visitante: z.string().trim().min(8).max(64),
    dispositivo: z.enum(["celular", "computador"]),
    /** Navegador da equipe (abriu o CRM): mostra o vídeo sem registrar. */
    equipe: z.boolean().optional(),
  }),
  z.object({
    action: z.literal("progresso"),
    sessao_id: z.string().uuid(),
    visitante: z.string().trim().min(8).max(64),
    segundos: z.array(z.number().int().min(0).max(MAX_SEG)).max(4000),
    posicao: z.number().int().min(0).max(MAX_SEG),
    duracao: z.number().int().min(1).max(MAX_SEG).nullish(),
    play: z.boolean().optional(),
    fim: z.boolean().optional(),
    eventos: z.array(Evento).max(50).optional(),
  }),
]);

// Robôs que abrem links (antivírus de e-mail, verificadores...) não contam
// como visita. A prévia do WhatsApp nem chega aqui: não roda JavaScript.
const ROBO =
  /bot|crawl|spider|slurp|facebookexternalhit|headless|lighthouse|google-inspectiontool/i;

const VISITA_MIN = 30;

export const Route = createFileRoute("/api/public/video/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        let p;
        try {
          p = ActionSchema.parse(await request.json());
        } catch {
          return Response.json({ error: "Invalid payload" }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        if (p.action === "dados") {
          const { data: link, error } = await supabase
            .from("video_links")
            .select("destinatario, videos(titulo, youtube_id, duracao_seg)")
            .eq("slug", p.slug.toLowerCase())
            .maybeSingle();
          if (error) return Response.json({ error: error.message }, { status: 500 });
          const video = (link as unknown as { videos: Record<string, unknown> | null } | null)
            ?.videos;
          if (!link || !video) return Response.json({ data: null });
          return Response.json({
            data: {
              titulo: video.titulo,
              youtube_id: video.youtube_id,
              duracao_seg: video.duracao_seg,
              destinatario: link.destinatario,
            },
          });
        }

        if (p.action === "abrir") {
          const { data: link, error } = await supabase
            .from("video_links")
            .select("id, destinatario, videos(titulo, youtube_id, duracao_seg)")
            .eq("slug", p.slug.toLowerCase())
            .maybeSingle();
          if (error) return Response.json({ error: error.message }, { status: 500 });
          const video = (link as unknown as { videos: Record<string, unknown> | null } | null)
            ?.videos;
          if (!link || !video) return Response.json({ data: null });

          const data = {
            titulo: video.titulo,
            youtube_id: video.youtube_id,
            duracao_seg: video.duracao_seg,
            destinatario: link.destinatario,
          };

          const ua = request.headers.get("user-agent") ?? "";
          if (p.equipe || !ua || ROBO.test(ua)) {
            return Response.json({ data, sessao_id: null });
          }

          // Recarregou a página ou voltou em menos de 30 min: é a mesma visita.
          const { data: recente } = await supabase
            .from("video_sessoes")
            .select("id")
            .eq("link_id", link.id)
            .eq("visitante", p.visitante)
            .gte("ultimo_evento_em", new Date(Date.now() - VISITA_MIN * 60_000).toISOString())
            .order("ultimo_evento_em", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (recente) return Response.json({ data, sessao_id: recente.id });

          const { data: sessao, error: insErr } = await supabase
            .from("video_sessoes")
            .insert({ link_id: link.id, visitante: p.visitante, dispositivo: p.dispositivo })
            .select("id")
            .single();
          if (insErr) {
            console.error("[video] abrir", insErr.message);
            return Response.json({ data, sessao_id: null });
          }

          await avisarAbertura(supabase, new URL(request.url).origin, link.id, p.dispositivo);
          return Response.json({ data, sessao_id: sessao.id });
        }

        // progresso
        const { data: sessao } = await supabase
          .from("video_sessoes")
          .select("id, link_id, visitante, video_links(video_id, videos(duracao_seg))")
          .eq("id", p.sessao_id)
          .maybeSingle();
        if (!sessao || sessao.visitante !== p.visitante) {
          return Response.json({ error: "Not found" }, { status: 404 });
        }

        const { error: rpcErr } = await supabase.rpc("video_registrar", {
          p_sessao: p.sessao_id,
          p_segundos: [...new Set(p.segundos)],
          p_posicao: p.posicao,
          p_play: !!p.play,
          p_fim: !!p.fim,
        });
        if (rpcErr) {
          console.error("[video] progresso", rpcErr.message);
          return Response.json({ error: "Failed" }, { status: 500 });
        }

        if (p.eventos?.length) {
          await supabase.from("video_eventos").insert(
            p.eventos.map((e) => ({
              sessao_id: p.sessao_id,
              tipo: e.tipo,
              posicao_seg: e.posicao,
              de_seg: e.de ?? null,
            })),
          );
        }

        // Duração vem do player do YouTube na primeira reprodução.
        const vl = sessao.video_links as unknown as {
          video_id: string;
          videos: { duracao_seg: number | null } | null;
        } | null;
        if (p.duracao && vl && vl.videos?.duracao_seg !== p.duracao) {
          await supabase.from("videos").update({ duracao_seg: p.duracao }).eq("id", vl.video_id);
        }

        return Response.json({ success: true });
      },
    },
  },
});
