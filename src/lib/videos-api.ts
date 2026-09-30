import { CRM_PASS } from "./crm-auth";

export type VideoLink = {
  id: string;
  video_id: string;
  slug: string;
  destinatario: string;
  lead_id: string | null;
  criado_em: string;
  visitas: number;
  ultimo_acesso: string | null;
  deu_play: boolean;
  chegou_ao_fim: boolean;
  segundos_assistidos: number;
  percentual: number | null;
};

export type Video = {
  id: string;
  titulo: string;
  youtube_id: string;
  duracao_seg: number | null;
  criado_em: string;
  links: VideoLink[];
};

export type VideoEvento = {
  tipo: "play" | "pause" | "fim" | "voltou" | "pulou";
  posicao_seg: number;
  de_seg: number | null;
  criado_em: string;
};

export type VideoSessao = {
  id: string;
  dispositivo: "celular" | "computador";
  iniciado_em: string;
  ultimo_evento_em: string;
  deu_play: boolean;
  assistidos: number[];
  maximo_seg: number;
  posicao_seg: number;
  chegou_ao_fim: boolean;
  eventos: VideoEvento[];
};

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/public/crm/videos", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-crm-token": CRM_PASS },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(json.error || `Videos API error ${res.status}`);
  return json;
}

export async function apiListVideos(): Promise<Video[]> {
  return (await call<{ data: Video[] }>({ action: "list" })).data ?? [];
}

export async function apiCreateVideo(titulo: string, youtube_id: string) {
  return (await call<{ data: Video }>({ action: "create_video", titulo, youtube_id })).data;
}

export async function apiUpdateVideo(id: string, titulo: string) {
  await call({ action: "update_video", id, titulo });
}

export async function apiDeleteVideo(id: string) {
  await call({ action: "delete_video", id });
}

export async function apiCreateLink(video_id: string, destinatario: string, lead_id: string | null) {
  return (
    await call<{ data: VideoLink }>({ action: "create_link", video_id, destinatario, lead_id })
  ).data;
}

export async function apiDeleteLink(id: string) {
  await call({ action: "delete_link", id });
}

export async function apiSessoes(link_id: string): Promise<VideoSessao[]> {
  return (await call<{ data: VideoSessao[] }>({ action: "sessoes", link_id })).data ?? [];
}
