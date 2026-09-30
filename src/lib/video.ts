// Apresentações em vídeo (/v/:slug). Funções usadas no navegador e no
// servidor; o que fala com o banco fica em video.server.ts.

export const VIDEO_BASE_URL = "https://legacybc.com.br";
export const videoLinkUrl = (slug: string) => `${VIDEO_BASE_URL}/v/${slug}`;

/**
 * Id do vídeo a partir de qualquer link do YouTube: watch?v=, youtu.be/,
 * shorts/, embed/, live/ — ou o próprio id de 11 caracteres.
 */
export function youtubeId(raw: string): string | null {
  const s = raw.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0] ?? null;
  else if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    id =
      url.searchParams.get("v") ??
      url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/)?.[1] ??
      null;
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

export const youtubeThumb = (id: string, q: "maxres" | "hq" = "maxres") =>
  `https://i.ytimg.com/vi/${id}/${q === "maxres" ? "maxresdefault" : "hqdefault"}.jpg`;

/** 125 -> "2:05"; 3725 -> "1:02:05". */
export function formatTempo(seg: number): string {
  const s = Math.max(0, Math.floor(seg));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
}

/** Segundos assistidos (ordenados) -> trechos contínuos [início, fim]. */
export function trechos(segundos: number[]): Array<[number, number]> {
  const ord = [...new Set(segundos)].sort((a, b) => a - b);
  const out: Array<[number, number]> = [];
  for (const s of ord) {
    const ult = out[out.length - 1];
    // Buraco de até 2 s (amostragem, buffering) conta como o mesmo trecho.
    if (ult && s - ult[1] <= 2) ult[1] = s;
    else out.push([s, s]);
  }
  return out;
}

/** Percentual assistido (0–100), pelos segundos únicos. */
export function percentual(segundos: number[] | number, duracao: number | null | undefined) {
  const n = typeof segundos === "number" ? segundos : new Set(segundos).size;
  if (!duracao || duracao <= 0) return null;
  return Math.min(100, Math.round((n / duracao) * 100));
}
