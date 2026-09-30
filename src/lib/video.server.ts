// Avisos das apresentações em vídeo (/v/:slug). Só roda no servidor.
//   - "Abriu a apresentação": na hora em que a visita começa;
//   - resumo: 2 min depois da última atividade (pg_cron 'video-resumo').
// Cada aviso vai para o grupo do WhatsApp (mesma fila das boas-vindas, tipo
// 'aviso') e para o e-mail (template 'video-aviso').
import type { SupabaseClient } from "@supabase/supabase-js";
import { grupoDoAviso, normalizarTelefone } from "@/lib/whatsapp.server";
import { formatTempo, percentual } from "@/lib/video";

type Contexto = {
  destinatario: string;
  video: string;
  leadId: string | null;
  leadWhatsapp: string | null;
};

const ordinal = (n: number) => `${n}ª visita`;
const noDispositivo = (d: string) => (d === "celular" ? "No celular" : "No computador");

async function avisar(
  supabase: SupabaseClient,
  origin: string,
  ctx: Contexto,
  aviso: { titulo: string; selo: string; assunto: string; linhas: string[] },
) {
  const telefone = ctx.leadWhatsapp ? normalizarTelefone(ctx.leadWhatsapp) : null;

  // WhatsApp: segue a chave "Aviso no grupo" da tela WhatsApp do CRM.
  try {
    const { data: config } = await supabase
      .from("whatsapp_config")
      .select("aviso_ativo")
      .eq("id", 1)
      .maybeSingle();
    if (config?.aviso_ativo) {
      const grupo = await grupoDoAviso(supabase);
      const texto = [
        aviso.titulo,
        ctx.destinatario,
        `Vídeo: ${ctx.video}`,
        ...aviso.linhas,
        ...(telefone ? [`https://wa.me/${telefone}`] : []),
      ].join("\n");
      const { error } = await supabase.from("whatsapp_envios").insert({
        lead_id: ctx.leadId,
        tipo: "aviso",
        telefone: grupo,
        mensagem: texto,
        status: "pendente",
        enviar_em: new Date().toISOString(),
      });
      if (error) console.error("[video] aviso whatsapp", error.message);
    }
  } catch (e) {
    console.error("[video] aviso whatsapp", e);
  }

  // E-mail
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return;
    const res = await fetch(`${origin}/lovable/email/transactional/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({
        templateName: "video-aviso",
        templateData: {
          selo: aviso.selo,
          assunto: aviso.assunto,
          destinatario: ctx.destinatario,
          video: ctx.video,
          linhas: [...aviso.linhas, ...(telefone ? [`WhatsApp: https://wa.me/${telefone}`] : [])],
          quando: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
        },
      }),
    });
    if (!res.ok) console.error("[video] aviso e-mail", res.status, await res.text());
  } catch (e) {
    console.error("[video] aviso e-mail", e);
  }
}

type LinkComVideo = {
  destinatario: string;
  lead_id: string | null;
  videos: { titulo: string; duracao_seg: number | null } | null;
  leads: { whatsapp: string | null } | null;
};

function contexto(link: LinkComVideo): Contexto {
  return {
    destinatario: link.destinatario,
    video: link.videos?.titulo ?? "Apresentação",
    leadId: link.lead_id,
    leadWhatsapp: link.leads?.whatsapp ?? null,
  };
}

/** Aviso "abriu a apresentação". Nunca lança. */
export async function avisarAbertura(
  supabase: SupabaseClient,
  origin: string,
  linkId: string,
  dispositivo: string,
) {
  try {
    const [{ data: link }, { count }] = await Promise.all([
      supabase
        .from("video_links")
        .select("destinatario, lead_id, videos(titulo, duracao_seg), leads(whatsapp)")
        .eq("id", linkId)
        .maybeSingle(),
      supabase
        .from("video_sessoes")
        .select("id", { count: "exact", head: true })
        .eq("link_id", linkId),
    ]);
    if (!link) return;
    await avisar(supabase, origin, contexto(link as unknown as LinkComVideo), {
      titulo: "👀 *ABRIU A APRESENTAÇÃO*",
      selo: "ABRIU A APRESENTAÇÃO",
      assunto: "Abriu a apresentação",
      linhas: [`${noDispositivo(dispositivo)} · ${ordinal(count ?? 1)}`],
    });
  } catch (e) {
    console.error("[video] abertura", e);
  }
}

type SessaoPendente = {
  id: string;
  link_id: string;
  dispositivo: string;
  iniciado_em: string;
  deu_play: boolean;
  assistidos: number[];
  maximo_seg: number;
  posicao_seg: number;
  chegou_ao_fim: boolean;
  resumos_enviados: number;
  video_links: LinkComVideo | null;
};

function linhasDoResumo(
  s: SessaoPendente,
  eventos: { tipo: string; posicao_seg: number; de_seg: number | null }[],
  visita: number,
): { linhas: string[]; assunto: string } {
  const duracao = s.video_links?.videos?.duracao_seg ?? null;
  const onde = `${noDispositivo(s.dispositivo)} · ${ordinal(visita)}`;
  if (!s.deu_play) {
    return { linhas: ["Abriu a página, mas não deu play.", onde], assunto: "Abriu e não deu play" };
  }

  const vistos = s.assistidos.length;
  const pct = percentual(vistos, duracao);
  const linhas: string[] = [];
  linhas.push(
    pct !== null && duracao
      ? `Assistiu ${pct}% (${formatTempo(vistos)} de ${formatTempo(duracao)})`
      : `Assistiu ${formatTempo(vistos)}`,
  );
  linhas.push(s.chegou_ao_fim ? "✅ Chegou ao fim do vídeo" : `Parou em ${formatTempo(s.posicao_seg)}`);

  const revistos = [
    ...new Set(eventos.filter((e) => e.tipo === "voltou").map((e) => formatTempo(e.posicao_seg))),
  ];
  if (revistos.length) linhas.push(`Voltou para rever: ${revistos.slice(0, 5).join(", ")}`);
  const pulos = eventos
    .filter((e) => e.tipo === "pulou" && e.de_seg !== null)
    .map((e) => `${formatTempo(e.de_seg!)} → ${formatTempo(e.posicao_seg)}`);
  if (pulos.length) linhas.push(`Pulou: ${pulos.slice(0, 5).join(", ")}`);
  linhas.push(onde);

  return {
    linhas,
    assunto: s.chegou_ao_fim ? "Assistiu até o fim" : pct !== null ? `Assistiu ${pct}%` : "Assistiu",
  };
}

/** Manda o resumo das visitas paradas há 2 min. Chamada pelo cron. */
export async function processarResumos(supabase: SupabaseClient, origin: string) {
  const { data: pendentes } = await supabase
    .from("video_sessoes")
    .select(
      "id, link_id, dispositivo, iniciado_em, deu_play, assistidos, maximo_seg, posicao_seg, chegou_ao_fim, resumos_enviados, video_links(destinatario, lead_id, videos(titulo, duracao_seg), leads(whatsapp))",
    )
    .eq("resumo_pendente", true)
    .lte("ultimo_evento_em", new Date(Date.now() - 2 * 60_000).toISOString())
    .limit(20);

  let enviados = 0;
  for (const s of (pendentes ?? []) as unknown as SessaoPendente[]) {
    // Trava otimista: se duas chamadas do cron se sobrepõem, só uma manda.
    const { data: travada } = await supabase
      .from("video_sessoes")
      .update({ resumo_pendente: false, resumos_enviados: s.resumos_enviados + 1 })
      .eq("id", s.id)
      .eq("resumo_pendente", true)
      .select("id")
      .maybeSingle();
    if (!travada || !s.video_links) continue;

    const [{ data: eventos }, { count }] = await Promise.all([
      supabase
        .from("video_eventos")
        .select("tipo, posicao_seg, de_seg")
        .eq("sessao_id", s.id)
        .order("criado_em", { ascending: true })
        .limit(200),
      supabase
        .from("video_sessoes")
        .select("id", { count: "exact", head: true })
        .eq("link_id", s.link_id)
        .lte("iniciado_em", s.iniciado_em),
    ]);

    const { linhas, assunto } = linhasDoResumo(s, eventos ?? [], count ?? 1);
    const continuou = s.resumos_enviados > 0;
    await avisar(supabase, origin, contexto(s.video_links), {
      titulo: continuou ? "📊 *RESUMO DO VÍDEO* (continuou assistindo)" : "📊 *RESUMO DO VÍDEO*",
      selo: continuou ? "CONTINUOU ASSISTINDO" : "RESUMO DO VÍDEO",
      assunto,
      linhas,
    });
    enviados++;
  }
  return { pendentes: pendentes?.length ?? 0, enviados };
}
