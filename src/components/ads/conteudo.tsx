// Conteúdo compartilhado entre a /adsa e a /adsb: cases do portfólio, etapas do
// projeto, entregas e o carrossel dos cases. Cada página aplica o próprio visual.
import { useEffect, useRef, useState } from "react";
import n308Banner from "@/assets/308-network/308-network-out-banner.webp.asset.json";
import n308Correndo from "@/assets/308-network/308-network-308-foto-correndo.webp.asset.json";
import n308Metro from "@/assets/308-network/308-network-banner-metro-moema.webp.asset.json";
import n308Bone from "@/assets/308-network/308-network-bone-e-moletom-juntos.webp.asset.json";
import n308Cartao from "@/assets/308-network/308-network-cartao-de-visitas.webp.asset.json";
import n308Site from "@/assets/308-network/308-network-site-tela-pc.webp.asset.json";
import moewaPoster from "@/assets/ads/moewa-poster-manifesto.webp.asset.json";
import geri60 from "@/assets/geriacademy/geriacademy-page-0060.webp.asset.json";
import geri44 from "@/assets/geriacademy/geriacademy-page-0044.webp.asset.json";
import geri49 from "@/assets/geriacademy/geriacademy-page-0049.webp.asset.json";
import geri53 from "@/assets/geriacademy/geriacademy-page-0053.webp.asset.json";
import geri54 from "@/assets/geriacademy/geriacademy-page-0054.webp.asset.json";
import geri57 from "@/assets/geriacademy/geriacademy-page-0057.webp.asset.json";
import joanaQuote from "@/assets/joana-ulmer/joana-ulmer-billboard-quote.webp.asset.json";
import joanaBag from "@/assets/joana-ulmer/joana-ulmer-bag.webp.asset.json";
import joanaEvent from "@/assets/joana-ulmer/joana-ulmer-billboard-event.webp.asset.json";
import joanaHoodies from "@/assets/joana-ulmer/joana-ulmer-hoodies.webp.asset.json";
import joanaLaptop from "@/assets/joana-ulmer/joana-ulmer-laptop.webp.asset.json";
import joanaPhone from "@/assets/joana-ulmer/joana-ulmer-phone.webp.asset.json";

// MOEWA: os assets originais têm 2 MB cada; as versões da proposta são leves.
const MOEWA = (f: string) => `/proposta/cases/moewa/moewa-${f}.jpg`;

export const CASES = [
  {
    imgs: [n308Banner, n308Correndo, n308Metro, n308Bone, n308Cartao, n308Site].map((a) => a.url),
    nome: "308NETWORK",
    seg: "Decisões patrimoniais",
    antes: "Imobiliária tradicional",
    depois: "Referência em decisões patrimoniais inteligentes, pronta para expandir.",
  },
  {
    imgs: [
      moewaPoster.url,
      MOEWA("clube-card"),
      MOEWA("uniform"),
      MOEWA("wellness-shot"),
      MOEWA("sacola"),
      MOEWA("cartao"),
    ],
    nome: "MOEWA",
    seg: "Estética e longevidade",
    antes: "Mais uma clínica de estética",
    depois: "Um ecossistema de alto valor: a única rosa branca num mar de rosas vermelhas.",
  },
  {
    imgs: [geri60, geri44, geri49, geri53, geri54, geri57].map((a) => a.url),
    nome: "Geriacademy",
    seg: "Educação médica",
    antes: "Cursos de geriatria",
    depois: "Uma instituição que lidera um movimento de valorização da saúde do idoso.",
  },
  {
    imgs: [joanaQuote, joanaBag, joanaEvent, joanaHoodies, joanaLaptop, joanaPhone].map(
      (a) => a.url,
    ),
    nome: "Joana co*",
    seg: "Educação financeira",
    antes: "Marca pessoal sem direção",
    depois: "Um posicionamento que cabe numa pergunta: quanto você investiria na sua paz?",
  },
];

export const FLUXO = [
  ["Estratégia", "Posicionamento"],
  ["Estratégia", "Base de comunicação"],
  ["Estratégia", "Diferencial"],
  ["Resultado", "Identidade de alto padrão"],
] as const;

export const ETAPAS = [
  {
    sem: "Semana 1",
    t: "Pesquisa",
    d: "Você responde o Legacy Brand Canvas e fazemos as calls de alinhamento.",
  },
  { sem: "Semana 2", t: "Moodboard", d: "A direção visual da sua marca." },
  { sem: "Semanas 3 a 5", t: "Criação", d: "Testes, validação e apresentação da identidade." },
  { sem: "Semana 6", t: "Entrega", d: "Todos os arquivos organizados no Google Drive." },
];

export const ENTREGAS = [
  "Narrativa da marca",
  "Logotipo e suas versões",
  "Elementos visuais",
  "Paleta de cores",
  "Tipografia da marca",
  "Aplicações no dia a dia",
  "Identidade do Instagram",
  "Todos os arquivos",
];

const INTERVALO_MS = 1800;

/**
 * Imagens do case trocando sozinhas a cada 1,8 s. Para carregar rápido: só a
 * primeira vem com a página; as outras são baixadas uma a uma, só com o card
 * perto da tela, e a troca só acontece depois que a próxima já decodificou.
 */
export function CaseCarousel({
  imgs,
  nome,
  eager,
  className,
  dotsClassName,
}: {
  imgs: string[];
  nome: string;
  eager: boolean;
  className: string;
  dotsClassName: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [montadas, setMontadas] = useState(1);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting), {
      rootMargin: "200px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visivel || imgs.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const prox = (idx + 1) % imgs.length;
    let cancelado = false;
    const pre = new Image();
    pre.src = imgs[prox]!;
    const pronta = pre.decode().catch(() => undefined);
    const t = window.setTimeout(() => {
      void pronta.then(() => {
        if (cancelado) return;
        setMontadas((m) => Math.max(m, prox + 1));
        setIdx(prox);
      });
    }, INTERVALO_MS);
    return () => {
      cancelado = true;
      window.clearTimeout(t);
    };
  }, [visivel, idx, imgs]);

  return (
    <div className={className} ref={ref}>
      {imgs.slice(0, montadas).map((src, i) => (
        <img
          key={src}
          src={src}
          alt={i === 0 ? `Identidade visual ${nome}` : ""}
          aria-hidden={i === 0 ? undefined : true}
          width={1600}
          height={900}
          loading={eager && i === 0 ? "eager" : "lazy"}
          decoding="async"
          style={{ opacity: i === idx ? 1 : 0 }}
        />
      ))}
      <div className={dotsClassName} aria-hidden="true">
        {imgs.map((src, i) => (
          <i key={src} className={i === idx ? "on" : ""} />
        ))}
      </div>
    </div>
  );
}
