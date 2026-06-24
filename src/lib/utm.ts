export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmData = Partial<Record<UtmKey, string>>;

const STORAGE_KEY = "lbc_utms";

export function captureUtmsFromUrl(): UtmData {
  if (typeof window === "undefined") return {};
  try {
    const stored: UtmData = JSON.parse(
      sessionStorage.getItem(STORAGE_KEY) ?? "{}",
    );
    const params = new URLSearchParams(window.location.search);
    const fresh: UtmData = {};
    UTM_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) fresh[k] = v;
    });
    const next = { ...stored, ...fresh };
    if (Object.keys(next).length) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
    return next;
  } catch {
    return {};
  }
}

export function getStoredUtms(): UtmData {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}
