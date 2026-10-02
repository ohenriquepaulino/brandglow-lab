// Estilo do site institucional (home e cases), no visual da página B do teste
// A/B. É uma cópia do CSS de src/routes/adsb.tsx (raiz .lbc em vez de .adsb):
// a /adsb fica intocada enquanto o teste roda.
export const FONTE_PRELOAD = {
  rel: "preload",
  href: "/proposta/fonts/anton-400.woff2",
  as: "font",
  type: "font/woff2",
  crossOrigin: "anonymous",
} as const;

export function EstiloSite() {
  return (
    <style>{`
        @font-face { font-family: "LBC Anton"; font-weight: 400; font-display: swap; src: url("/proposta/fonts/anton-400.woff2") format("woff2"); }
        @font-face { font-family: "LBC Inter"; font-weight: 400; font-display: swap; src: url("/proposta/fonts/inter-400.woff2") format("woff2"); }
        @font-face { font-family: "LBC Inter"; font-weight: 500; font-display: swap; src: url("/proposta/fonts/inter-500.woff2") format("woff2"); }
        @font-face { font-family: "LBC Inter"; font-weight: 600; font-display: swap; src: url("/proposta/fonts/inter-600.woff2") format("woff2"); }

        html:has(.lbc) { scroll-behavior: smooth; }
        /* Selo do Lovable escondido, como nas landing pages. */
        #lovable-badge { display: none !important; }

        .lbc {
          --lime: #b8ff80; --ink: #111111; --paper: #f2f2f2; --surface: #ffffff;
          --muted: #6e6e6e; --line: rgba(17,17,17,0.12);
          --deep-ink: #f2f2f2; --deep-muted: #9a9a9a; --deep-line: rgba(242,242,242,0.14);
          --display: "LBC Anton", "Anton", Impact, "Arial Narrow Bold", sans-serif;
          font-family: "LBC Inter", Inter, system-ui, sans-serif;
          color: var(--ink); background: var(--paper);
          font-size: 16px; line-height: 1.5; -webkit-font-smoothing: antialiased;
        }
        /* :where zera a especificidade: o reset não pode vencer as margens das classes. */
        :where(.lbc) :where(h1, h2, h3, p, ol, ul, figure) { margin: 0; }
        .lbc h1, .lbc h2, .lbc h3 { text-wrap: balance; }
        .lbc p { text-wrap: pretty; }
        .lbc strong { font-weight: 600; }
        .tone-lime { background: var(--lime); color: var(--ink); }
        .tone-paper { background: var(--paper); color: var(--ink); }
        .tone-surface { background: var(--surface); color: var(--ink); }
        .tone-deep { background: var(--ink); color: var(--deep-ink); }

        .b-wrap { max-width: 1200px; margin-inline: auto; padding-inline: 20px; }
        .b-sec { padding-block: 72px; }
        .b-d { font-family: var(--display); font-weight: 400; line-height: 1.02; letter-spacing: 0.002em; }
        .b-h1 { font-size: 42px; }
        .b-h1 span { display: block; }
        .b-h1 span + span { margin-top: 4px; }
        .b-h2 { font-size: 36px; margin-bottom: 28px; }
        .b-kicker {
          font-size: 13px; font-weight: 500; color: var(--muted); margin-bottom: 16px;
          display: flex; gap: 12px; align-items: center;
        }
        .b-kicker::before { content: ""; width: 28px; height: 2px; background: currentColor; opacity: 0.5; }
        .tone-lime .b-kicker { color: rgba(17,17,17,0.65); }
        .tone-deep .b-kicker { color: var(--deep-muted); }

        /* primeira dobra */
        .b-hero { padding-block: 28px 56px; }
        .b-logo { height: 34px; width: auto; margin-bottom: 36px; display: block; }
        .b-lead { font-size: 17px; line-height: 1.45; margin-top: 20px; max-width: 46ch; }
        .b-facts { list-style: none; padding: 0; margin-top: 28px !important; display: grid; gap: 0; border-top: 1.5px solid var(--ink); }
        .b-facts li { padding: 12px 0; border-bottom: 1px solid var(--line); font-size: 15px; }
        .b-facts b { font-family: var(--display); font-weight: 400; font-size: 22px; margin-right: 6px; }
        .b-hero-grid { display: grid; gap: 36px; }

        /* formulário (reaproveita o ContactSection sem o bloco de texto dele) */
        .b-form {
          background: var(--surface); color: var(--ink); border-radius: 16px;
          padding: 24px 20px; box-shadow: 0 18px 48px rgba(17,17,17,0.10);
          scroll-margin-top: 16px;
        }
        .b-form-title { font-family: var(--display); font-size: 28px; line-height: 1.05; }
        .b-form-sub { font-size: 14px; color: var(--muted); margin: 6px 0 20px !important; }
        .b-form > section { border: 0 !important; background: transparent !important; }
        .b-form > section > div { padding: 0 !important; max-width: none !important; width: 100% !important; }
        .b-form > section > div > div { display: block !important; gap: 0 !important; }
        .b-form > section > div > div > *:first-child { display: none !important; }
        .b-form > section > div > div > * + * { border: 0 !important; padding: 0 !important; }
        .b-form form { gap: 18px !important; }
        .b-form form > div { gap: 18px !important; grid-template-columns: 1fr !important; }
        .b-form button[type="submit"] {
          width: 100% !important; background: var(--ink) !important; color: var(--lime) !important;
          border-radius: 10px !important; font-size: 16px !important; padding: 17px 24px !important;
        }

        /* passos */
        .b-steps { list-style: none; padding: 0; display: grid; gap: 0; border-top: 1.5px solid var(--ink); }
        .b-steps li { padding: 22px 0; border-bottom: 1px solid var(--line); display: grid; grid-template-columns: 44px 1fr; column-gap: 12px; }
        .b-steps small { grid-row: span 2; font-family: var(--display); font-size: 26px; line-height: 1; }
        .b-steps b { font-size: 18px; font-weight: 600; }
        .b-steps p { color: var(--muted); font-size: 15px; margin-top: 4px !important; }

        /* o que fazemos */
        .b-promise { font-size: 20px; line-height: 1.35; font-weight: 400; max-width: 38ch; color: var(--deep-ink); }
        .b-promise strong { color: var(--lime); }
        .b-flow { display: grid; grid-template-columns: 1fr 1fr; margin-top: 40px; border-top: 1px solid var(--deep-line); }
        .b-flow div { padding: 18px 16px 18px 0; border-bottom: 1px solid var(--deep-line); }
        .b-flow div:nth-child(even) { padding-left: 16px; border-left: 1px solid var(--deep-line); }
        .b-flow small { display: block; color: var(--deep-muted); font-size: 12px; margin-bottom: 6px; }
        .b-flow b { font-family: var(--display); font-weight: 400; font-size: 24px; line-height: 1.05; }
        .b-flow div:last-child b { color: var(--lime); }

        /* cases */
        .b-cases { display: grid; gap: 20px; }
        .b-case { background: var(--surface); border-radius: 16px; overflow: hidden; }
        .b-carousel { position: relative; aspect-ratio: 16/10; background: #e6e6e6; overflow: hidden; }
        .b-carousel img {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block;
          transition: opacity 350ms ease;
        }
        .b-dots { position: absolute; left: 12px; bottom: 10px; display: flex; gap: 5px; }
        .b-dots i { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.55); box-shadow: 0 0 0 1px rgba(0,0,0,0.12); transition: background .2s, width .2s; }
        .b-dots i.on { background: #fff; width: 16px; border-radius: 3px; }
        .b-case-txt { padding: 20px; }
        .b-case-seg { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
        .b-case h3 { font-size: 30px; margin: 6px 0 12px; }
        .b-case-antes { font-size: 14px; color: var(--muted); text-decoration: line-through; text-decoration-color: rgba(17,17,17,0.35); }
        .b-case-depois { font-size: 16px; margin-top: 4px !important; }
        .b-cta-row { margin-top: 32px; display: flex; justify-content: center; }
        .b-cta {
          display: inline-flex; align-items: center; justify-content: center; width: 100%;
          background: var(--ink); color: var(--lime); font-weight: 600; font-size: 16px;
          padding: 17px 28px; border-radius: 10px; text-decoration: none;
        }
        .tone-deep .b-cta { background: var(--lime); color: var(--ink); }

        /* depoimentos */
        .b-shots { columns: 1; column-gap: 16px; }
        .b-shot { break-inside: avoid; margin-bottom: 16px !important; background: #1c1b1a; border: 1px solid var(--deep-line); border-radius: 12px; overflow: hidden; }
        .b-shot img { display: block; width: 100%; height: auto; }

        /* linha do tempo */
        .b-timeline { list-style: none; padding: 0; display: grid; gap: 10px; }
        .b-timeline li { background: var(--surface); border-radius: 12px; padding: 18px 20px; border-left: 6px solid var(--line); }
        .b-timeline li.hot { border-left-color: var(--lime); }
        .b-timeline small { font-size: 12px; color: var(--muted); }
        .b-timeline b { display: block; font-family: var(--display); font-weight: 400; font-size: 26px; margin: 2px 0 4px; }
        .b-timeline p { font-size: 15px; color: var(--muted); }

        /* entregas */
        .b-dl { list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; border-top: 1.5px solid var(--ink); }
        .b-dl li { padding: 16px 12px 16px 0; border-bottom: 1px solid var(--line); }
        .b-dl small { display: block; font-size: 12px; color: var(--muted); }
        .b-dl b { font-size: 16px; font-weight: 600; line-height: 1.25; }

        /* faq */
        .b-faq-wrap { display: grid; gap: 8px; }
        .b-faq { border-top: 1.5px solid var(--ink); }
        .b-faq details { border-bottom: 1px solid var(--line); }
        .b-faq summary {
          cursor: pointer; list-style: none; padding: 18px 36px 18px 0; position: relative;
          font-size: 17px; font-weight: 600;
        }
        .b-faq summary::-webkit-details-marker { display: none; }
        .b-faq summary::after {
          content: "+"; position: absolute; right: 4px; top: 50%; transform: translateY(-50%);
          font-size: 24px; font-weight: 400; transition: transform .2s;
        }
        .b-faq details[open] summary::after { transform: translateY(-50%) rotate(45deg); }
        .b-faq details p { padding: 0 0 20px; color: var(--muted); font-size: 16px; max-width: 60ch; }

        .b-last { padding-bottom: 88px; }
        .b-footer { padding-block: 28px 96px; font-size: 13px; color: var(--deep-muted); }
        .b-footer-row { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
        .b-footer img { height: 26px; width: auto; max-width: 140px; object-fit: contain; }

        /* botão fixo no celular */
        .b-sticky {
          position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 50;
          display: flex; justify-content: center; padding: 16px; border-radius: 12px;
          background: var(--ink); color: var(--lime); font-weight: 600; font-size: 16px;
          text-decoration: none; box-shadow: 0 10px 30px rgba(17,17,17,0.25);
          transform: translateY(140%); transition: transform .25s ease;
        }
        .b-sticky.on { transform: none; }
        .lbc a:focus-visible, .lbc summary:focus-visible, .lbc button:focus-visible {
          outline: 3px solid var(--ink); outline-offset: 3px; border-radius: 6px;
        }
        .tone-deep a:focus-visible { outline-color: var(--lime); }
        @media (prefers-reduced-motion: reduce) {
          .b-sticky, .b-carousel img { transition: none; }
          html:has(.lbc) { scroll-behavior: auto; }
        }

        @media (min-width: 768px) {
          .b-wrap { padding-inline: 40px; }
          .b-h1 { font-size: 68px; }
          .b-h2 { font-size: 54px; }
          .b-sec { padding-block: 104px; }
          .b-steps { grid-template-columns: repeat(3, 1fr); column-gap: 32px; }
          .b-steps li { display: block; }
          .b-steps small { display: block; margin-bottom: 14px; }
          .b-flow { grid-template-columns: repeat(4, 1fr); }
          .b-flow div, .b-flow div:nth-child(even) { padding: 22px 24px; border-left: 1px solid var(--deep-line); border-bottom: 0; }
          .b-flow div:first-child { border-left: 0; padding-left: 0; }
          .b-cases { grid-template-columns: 1fr 1fr; gap: 24px; }
          .b-shots { columns: 2; column-gap: 20px; }
          .b-timeline { grid-template-columns: 1fr 1fr 1.6fr 1fr; }
          .b-dl { grid-template-columns: repeat(4, 1fr); column-gap: 24px; }
          .b-cta { width: auto; }
          .b-form { padding: 32px; }
          .b-footer { padding-bottom: 28px; }
          .b-footer-row { flex-direction: row; justify-content: space-between; align-items: center; }
          .b-h1 span + span { margin-top: 0; }
          .b-sticky { display: none; }
        }
        @media (min-width: 1024px) {
          .b-wrap { padding-inline: 64px; }
          .b-hero { padding-block: 36px 96px; }
          .b-logo { margin-bottom: 64px; }
          .b-h1 { font-size: 84px; }
          .b-h2 { font-size: 64px; }
          .b-lead { font-size: 19px; }
          .b-hero-grid { grid-template-columns: 1.1fr 0.9fr; gap: 72px; align-items: start; }
          .b-hero .b-form { margin-top: 70px; }
          .b-promise { font-size: 26px; }
          .b-flow b { font-size: 34px; }
          .b-shots { columns: 3; }
          .b-faq-wrap { grid-template-columns: 0.8fr 1.2fr; gap: 64px; }
        }

        /* ---- só do site (não existe na /adsb) ---- */
        .b-header { padding-block: 18px; }
        .b-header-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .b-header-logo img { height: 30px; width: auto; display: block; }
        .b-nav { display: none; align-items: center; gap: 28px; }
        .b-nav a { color: inherit; text-decoration: none; font-size: 15px; font-weight: 500; }
        .b-nav a:hover { text-decoration: underline; text-underline-offset: 4px; }
        .b-nav a.b-nav-cta { background: var(--ink); color: var(--lime); padding: 11px 18px; border-radius: 8px; }
        .b-nav a.b-nav-cta:hover { text-decoration: none; opacity: .9; }
        .b-menu-btn { background: none; border: 0; padding: 8px 0 8px 8px; cursor: pointer; color: inherit; font: inherit; font-weight: 600; font-size: 15px; }
        .b-menu { list-style: none; padding: 8px 0 4px; margin: 0; display: grid; }
        .b-menu a { display: block; padding: 12px 0; border-bottom: 1px solid var(--line); color: inherit; text-decoration: none; font-weight: 600; }

        .b-hero-site { padding-top: 0; }
        .b-hero-site .b-hero-grid { padding-top: 28px; }

        .b-about { display: grid; gap: 20px; font-size: 18px; line-height: 1.55; max-width: 980px; }
        .b-about strong { font-weight: 600; }

        .b-big { font-family: var(--display); font-weight: 400; font-size: 40px; line-height: 1.02; margin-bottom: 20px; }
        .b-big em { font-style: normal; color: var(--muted); }
        .b-method-txt { font-size: 17px; color: var(--muted); max-width: 60ch; margin-bottom: 40px !important; }
        .b-method-txt strong { color: var(--ink); }
        .b-method-sub { font-size: 13px; font-weight: 500; color: var(--muted); margin: 56px 0 16px !important; }

        .b-case { color: var(--ink); }
        a.b-case { display: block; text-decoration: none; transition: transform .2s ease, box-shadow .2s ease; }
        a.b-case:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(17,17,17,0.10); }
        .b-case-mais { display: inline-block; margin-top: 14px; font-size: 14px; font-weight: 600; text-decoration: underline; text-underline-offset: 4px; }
        .b-link { color: inherit; font-weight: 600; text-decoration: underline; text-underline-offset: 4px; }
        .b-cta-row { gap: 16px 28px; flex-wrap: wrap; align-items: center; }
        .b-static { position: relative; aspect-ratio: 16/10; background: #e6e6e6; overflow: hidden; }
        .b-static img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }

        /* página de case */
        .b-back { display: inline-block; font-size: 14px; font-weight: 500; color: var(--muted); text-decoration: none; margin-bottom: 40px; }
        .b-back:hover { color: var(--ink); }
        .b-case-h1 { font-size: 52px; margin-bottom: 20px; }
        .b-case-cover { margin-top: 40px; border-radius: 16px; overflow: hidden; background: #e6e6e6; aspect-ratio: 16/9; }
        .b-case-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .b-blocks { display: grid; gap: 36px; }
        .b-block p { font-size: 18px; line-height: 1.6; max-width: 62ch; }
        .b-gallery { display: grid; gap: 16px; max-width: 980px; margin-inline: auto; }
        .b-gallery img { display: block; width: 100%; height: auto; border-radius: 12px; background: #e6e6e6; }

        .b-footer-nav { display: flex; flex-wrap: wrap; gap: 8px 20px; }
        .b-footer-nav a { color: inherit; text-decoration: none; }
        .b-footer-nav a:hover { color: var(--deep-ink); }

        @media (min-width: 768px) {
          .b-nav { display: flex; }
          .b-menu-btn, .b-menu { display: none; }
          .b-about { grid-template-columns: 1fr 1fr; gap: 40px; }
          .b-big { font-size: 64px; }
          .b-case-h1 { font-size: 80px; }
          .b-gallery { gap: 24px; }
        }
        @media (min-width: 1024px) {
          .b-header { padding-block: 24px; }
          .b-hero-site .b-hero-grid { padding-top: 48px; }
          .b-hero-site .b-form { margin-top: 0; }
          .b-big { font-size: 80px; }
          .b-case-h1 { font-size: 104px; }
          .b-blocks { grid-template-columns: repeat(3, 1fr); gap: 48px; }
        }
      `}</style>
  );
}
