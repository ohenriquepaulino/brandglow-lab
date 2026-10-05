import type { CaseStudy } from "./types";
import { ASSET } from "./defaults";
import { CASE_TEXTOS } from "@/lib/cases-textos";

/**
 * Cases usados na proposta. Os textos vêm de @/lib/cases-textos, os mesmos do
 * site; aqui ficam só as imagens, o @ e o link para o case completo.
 */
const SITE = "https://legacybc.com.br";

function texto(slug: string) {
  const t = CASE_TEXTOS[slug];
  return {
    name: t.name,
    segment: t.segment,
    summary: t.short,
    context: t.context,
    challenge: t.challenge,
    solution: t.delivery,
    result: t.result,
  };
}

export const CASES: CaseStudy[] = [
  {
    slug: "geriacademy",
    ...texto("geriacademy"),
    siteUrl: `${SITE}/cases/geriacademy`,
    images: [ASSET("cases/geriacademy.jpg")],
  },
  {
    slug: "medcopilot",
    ...texto("medcopilot"),
    siteUrl: `${SITE}/cases/medcopilot`,
    images: [ASSET("cases/medcopilot.jpg")],
  },
  {
    slug: "nutri-yuri-gomes",
    ...texto("nutri-yuri-gomes"),
    handle: "@nutriyurigomes",
    images: [ASSET("cases/nutri-yuri-gomes.jpg")],
  },
  {
    slug: "mariana-brumatti",
    ...texto("mariana-brumatti"),
    handle: "@dramarianabrumatti",
    images: [ASSET("cases/mariana-brumatti.jpg")],
  },
  {
    slug: "moewa",
    ...texto("moewa"),
    handle: "@clinicamoewa",
    siteUrl: `${SITE}/cases/moewa`,
    images: [
      ASSET("cases/moewa/moewa-clube-card.jpg"),
      ASSET("cases/moewa/moewa-poster-manifesto.jpg"),
      ASSET("cases/moewa/moewa-uniform.jpg"),
      ASSET("cases/moewa/moewa-wellness-shot.jpg"),
      ASSET("cases/moewa/moewa-cartao.jpg"),
      ASSET("cases/moewa/moewa-sacola.jpg"),
      ASSET("cases/moewa/moewa-home-spray.jpg"),
      ASSET("cases/moewa/moewa-palette.jpg"),
    ],
  },
  {
    slug: "joana-co",
    ...texto("joana-co"),
    siteUrl: `${SITE}/cases/joana-co`,
    images: [ASSET("cases/joana-co-1.jpg"), ASSET("cases/joana-co-2.jpg")],
  },
  {
    slug: "308-network",
    ...texto("308-network"),
    siteUrl: `${SITE}/cases/308-network`,
    images: [
      ASSET("cases/308-network/308-network-out-banner.jpg"),
      ASSET("cases/308-network/308-network-308-foto-correndo.jpg"),
      ASSET("cases/308-network/308-network-308-variacoes-logo.jpg"),
      ASSET("cases/308-network/308-network-banner-metro-moema.jpg"),
      ASSET("cases/308-network/308-network-site-tela-pc.jpg"),
      ASSET("cases/308-network/308-network-bone-e-moletom-juntos.jpg"),
      ASSET("cases/308-network/308-network-cartao-de-visitas.jpg"),
      ASSET("cases/308-network/308-network-iphone-app-patrimonio.jpg"),
    ],
  },
];

/** Imagens locais extraídas da apresentação, caso as do site mudem de endereço. */
export const LOCAL_BACKUP_IMAGES: Record<string, string[]> = {
  moewa: [ASSET("cases/moewa-1.jpg"), ASSET("cases/moewa-2.jpg"), ASSET("cases/moewa-3.jpg")],
  "308-network": [1, 2, 3, 4].map((n) => ASSET(`cases/308-network-${n}.jpg`)),
};

export const CASES_BY_SLUG: Record<string, CaseStudy> = Object.fromEntries(
  CASES.map((c) => [c.slug, c]),
);

export function resolveCases(slugs: string[] | null | undefined): CaseStudy[] {
  const list = (slugs && slugs.length ? slugs : CASES.map((c) => c.slug))
    .map((s) => CASES_BY_SLUG[s])
    .filter(Boolean) as CaseStudy[];
  return list;
}
