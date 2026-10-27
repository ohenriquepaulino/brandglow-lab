import { createFileRoute } from "@tanstack/react-router";
import {
  BIG_IDEA,
  CENTRAL_ATUALIZADA,
  CONTEUDOS,
  ELEMENTOS,
  ENTREGAVEIS,
  ETAPAS,
  EXEMPLOS,
  NEGOCIO,
  PILARES,
  REGRAS,
} from "@/lib/central";

// Central interna da Legacy: o método e a linha editorial. Fora do Google
// (noindex) e sem link no site; quem tem o endereço acessa.
export const Route = createFileRoute("/central")({
  head: () => ({
    meta: [
      { title: "Central — Legacy BrandCo." },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: CentralPage,
});

const SECOES = [
  ["entrega", "O que entregamos"],
  ["metodo", "O método"],
  ["pilares", "Os 3 pilares"],
  ["negocio", "Marca como negócio"],
  ["entregaveis", "O que o cliente leva"],
  ["linha", "Linha editorial"],
  ["escrever", "Como escrever"],
  ["conteudos", "Conteúdos"],
] as const;

function CentralPage() {
  return (
    <div className="ctl">
      <EstiloCentral />
      <header className="ctl-wrap ctl-topo">
        <p className="ctl-marca">Legacy BrandCo. · Central</p>
        <h1 className="ctl-h1">Método Legacy</h1>
        <p className="ctl-sub">Atualizado em {CENTRAL_ATUALIZADA}</p>
      </header>

      <div className="ctl-wrap ctl-grade">
        <nav className="ctl-nav" aria-label="Seções">
          {SECOES.map(([id, nome]) => (
            <a key={id} href={`#${id}`}>
              {nome}
            </a>
          ))}
        </nav>

        <main className="ctl-corpo">
          <section id="entrega" className="ctl-sec">
            <h2 className="ctl-h2">O que entregamos</h2>
            <p className="ctl-lead">
              A Legacy pega uma empresa boa que o mercado não entende e devolve clareza: o que ela
              é, contra o que ela é, para quem vende, o que diz, como ganha mais dinheiro e, por
              último, a cara que traduz tudo isso.
            </p>
            <p>
              O cliente chega achando que vai comprar uma marca nova. Sai com o mapa do próprio
              negócio. A identidade visual é a última camada desse mapa, não a primeira.
            </p>
            <h3 className="ctl-h3">O problema: o abismo da marca</h3>
            <div className="ctl-abismo">
              <div>
                <span>O que a empresa acha que comunica</span>
                <strong>Qualidade, experiência, atendimento, resultado</strong>
              </div>
              <div>
                <span>O que o mercado entende</span>
                <strong>Mais uma no meio de várias</strong>
              </div>
            </div>
            <p>
              Branding é o que as pessoas acreditam sobre você, não o que você acredita sobre si
              mesmo. A 308Network entregava um serviço à frente do mercado imobiliário, mas São
              Paulo não reconhecia isso. O projeto existe para fechar essa distância.
            </p>
            <div className="ctl-bigidea">
              <span>A ideia por trás de tudo</span>
              <p>{BIG_IDEA}</p>
            </div>
          </section>

          <section id="metodo" className="ctl-sec">
            <h2 className="ctl-h2">O método em 7 etapas</h2>
            <p>
              O projeto vai do mercado para dentro da empresa e só no fim chega ao visual. Cada
              etapa responde uma pergunta do empresário.
            </p>
            <ol className="ctl-etapas">
              {ETAPAS.map((e, i) => (
                <li key={e.nome}>
                  <span className="ctl-num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="ctl-etapa-nome">
                      {e.nome} <em>{e.pergunta}</em>
                    </p>
                    <p>{e.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="ctl-nota">
              A apresentação de entrega tem de 70 a 80 páginas e é também o guia da marca. Sempre
              que o cliente for lançar algo, dar uma entrevista ou treinar a equipe, volta a ela.
            </p>
          </section>

          <section id="pilares" className="ctl-sec">
            <h2 className="ctl-h2">Os 3 pilares</h2>
            <p>Os dois primeiros são fixos. O terceiro muda de forma conforme o cliente.</p>
            <div className="ctl-pilares">
              {PILARES.map((p, i) => (
                <article key={p.nome}>
                  <span className="ctl-num">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{p.nome}</h3>
                  <p className="ctl-resumo">{p.resumo}</p>
                  <ul>
                    {p.itens.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                  <p className="ctl-nota">{p.nota}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="negocio" className="ctl-sec">
            <h2 className="ctl-h2">Marca como negócio</h2>
            <p>
              A marca não é um logo nem uma cor: é o que traz valor para a empresa. O projeto
              mostra como a estratégia vira faturamento e patrimônio.
            </p>
            <div className="ctl-tabela">
              {NEGOCIO.map((n) => (
                <div key={n.oque} className="ctl-linha">
                  <p className="ctl-oque">{n.oque}</p>
                  <p className="ctl-resolve">{n.resolve}</p>
                  <p className="ctl-exemplo">{n.exemplo}</p>
                </div>
              ))}
            </div>
            <p className="ctl-frase">
              Uma empresa tem três destinos: ser vendida, ser herdada ou quebrar. A marca define o
              valor dela nos dois primeiros.
            </p>
          </section>

          <section id="entregaveis" className="ctl-sec">
            <h2 className="ctl-h2">O que o cliente leva</h2>
            <ul className="ctl-lista">
              {ENTREGAVEIS.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <p className="ctl-nota">
              O site entra em alguns projetos como etapa seguinte. Em aberto: o que desta lista
              entra no projeto a partir de R$ 4.500.
            </p>
          </section>

          <section id="linha" className="ctl-sec">
            <h2 className="ctl-h2">Linha editorial: 3 elementos</h2>
            <p className="ctl-lead">
              Três tipos de post, cada um tirado de uma parte do método, na ordem em que o
              empresário ganha consciência: ele percebe o problema, entende a causa e confia em
              quem resolve.
            </p>
            <div className="ctl-elementos">
              {ELEMENTOS.map((el, i) => (
                <article key={el.nome}>
                  <span className="ctl-num">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{el.nome}</h3>
                  <p className="ctl-pensa">“{el.pensa}”</p>
                  <dl>
                    <dt>Vem de</dt>
                    <dd>{el.origem}</dd>
                    <dt>Fala de</dt>
                    <dd>{el.fala}</dd>
                    <dt>Formato</dt>
                    <dd>{el.formato}</dd>
                    <dt>A Legacy aparece</dt>
                    <dd>{el.legacy}</dd>
                    <dt>Ritmo</dt>
                    <dd>1 por semana</dd>
                  </dl>
                  <p className="ctl-temas-t">Temas</p>
                  <ul>
                    {el.temas.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section id="escrever" className="ctl-sec">
            <h2 className="ctl-h2">Como escrever</h2>
            <p>
              As regras vêm do marketing de premissas do Leandro Ladeira, aplicado ao método e ao
              jeito da Legacy.
            </p>
            <ol className="ctl-regras">
              {REGRAS.map(([titulo, texto], i) => (
                <li key={titulo}>
                  <span className="ctl-num">{String(i + 1).padStart(2, "0")}</span>
                  <p>
                    <strong>{titulo}</strong> {texto}
                  </p>
                </li>
              ))}
            </ol>
            <h3 className="ctl-h3">Um exemplo de cada</h3>
            <div className="ctl-exemplos">
              {EXEMPLOS.map((ex) => (
                <article key={ex.titulo}>
                  <p className="ctl-ex-tag">{ex.elemento}</p>
                  <h4>{ex.titulo}</h4>
                  {ex.linhas.map((bloco) => (
                    <p key={bloco[0]}>
                      {bloco.map((l, j) => (
                        <span key={l}>
                          {j > 0 && <br />}
                          {l}
                        </span>
                      ))}
                    </p>
                  ))}
                </article>
              ))}
            </div>
          </section>

          <section id="conteudos" className="ctl-sec">
            <h2 className="ctl-h2">Conteúdos</h2>
            {CONTEUDOS.length === 0 ? (
              <p className="ctl-vazio">
                Nenhum conteúdo registrado ainda. Tudo o que for produzido a partir desta linha
                editorial entra aqui.
              </p>
            ) : (
              <div className="ctl-tabela">
                {CONTEUDOS.map((c) => (
                  <div key={`${c.data}-${c.titulo}`} className="ctl-linha ctl-conteudo">
                    <p className="ctl-oque">
                      {c.link ? (
                        <a href={c.link} target="_blank" rel="noreferrer">
                          {c.titulo}
                        </a>
                      ) : (
                        c.titulo
                      )}
                    </p>
                    <p className="ctl-resolve">
                      {c.elemento} · {c.formato}
                    </p>
                    <p className="ctl-exemplo">
                      {c.status} · {c.data}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <footer className="ctl-rodape">
            Fontes: entregas da Legacy (308Network, Maite, Joana Ulmer, GeriAcademy) e o marketing
            de premissas, a big idea e a urgência oculta de Leandro Ladeira.
          </footer>
        </main>
      </div>
    </div>
  );
}

function EstiloCentral() {
  return (
    <style>{`
      @font-face { font-family: "LBC Inter"; font-weight: 400; font-display: swap; src: url("/proposta/fonts/inter-400.woff2") format("woff2"); }
      @font-face { font-family: "LBC Inter"; font-weight: 500; font-display: swap; src: url("/proposta/fonts/inter-500.woff2") format("woff2"); }
      @font-face { font-family: "LBC Inter"; font-weight: 600; font-display: swap; src: url("/proposta/fonts/inter-600.woff2") format("woff2"); }
      html:has(.ctl) { scroll-behavior: smooth; }
      #lovable-badge { display: none !important; }

      .ctl {
        --lime: #b8ff80; --ink: #111111; --paper: #f2f2f2; --surface: #ffffff;
        --muted: #6e6e6e; --line: rgba(17,17,17,0.12);
        font-family: "LBC Inter", Inter, system-ui, sans-serif;
        color: var(--ink); background: var(--paper); min-height: 100vh;
        font-size: 16px; line-height: 1.6; -webkit-font-smoothing: antialiased;
        padding-bottom: 96px;
      }
      :where(.ctl) :where(h1, h2, h3, h4, p, ol, ul, dl, dd) { margin: 0; padding: 0; }
      .ctl h1, .ctl h2, .ctl h3, .ctl h4 { text-wrap: balance; font-weight: 600; }
      .ctl p { text-wrap: pretty; }
      .ctl strong { font-weight: 600; }
      .ctl ol, .ctl ul { list-style: none; }

      .ctl-wrap { max-width: 1120px; margin-inline: auto; padding-inline: 20px; }
      .ctl-topo { padding-block: 56px 40px; border-bottom: 1px solid var(--line); }
      .ctl-marca { font-size: 13px; font-weight: 500; color: var(--muted); }
      .ctl-h1 { margin-top: 20px !important; font-size: 44px; line-height: 1; letter-spacing: -0.045em; }
      .ctl-sub { margin-top: 14px !important; font-size: 14px; color: var(--muted); }

      .ctl-grade { display: block; }
      .ctl-nav { display: none; }
      .ctl-corpo { max-width: 720px; }

      .ctl-sec { padding-block: 56px; border-bottom: 1px solid var(--line); scroll-margin-top: 24px; }
      .ctl-sec > * + * { margin-top: 18px; }
      .ctl-h2 { font-size: 30px; line-height: 1.08; letter-spacing: -0.04em; }
      .ctl-h3 { font-size: 19px; letter-spacing: -0.02em; margin-top: 36px !important; }
      .ctl-lead { font-size: 19px; line-height: 1.5; letter-spacing: -0.01em; font-weight: 500; }
      .ctl-nota { font-size: 14px; color: var(--muted); }
      .ctl-num { font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }

      .ctl-abismo { display: grid; gap: 1px; background: var(--line); border: 1px solid var(--line); }
      .ctl-abismo div { background: var(--surface); padding: 20px; display: grid; gap: 6px; }
      .ctl-abismo span { font-size: 13px; color: var(--muted); }
      .ctl-abismo strong { font-size: 18px; letter-spacing: -0.02em; line-height: 1.3; }

      .ctl-bigidea { background: var(--ink); color: var(--paper); padding: 28px 24px; margin-top: 32px !important; }
      .ctl-bigidea span { font-size: 13px; color: #9a9a9a; }
      .ctl-bigidea p { margin-top: 10px; font-size: 30px; line-height: 1.1; letter-spacing: -0.045em; font-weight: 600; color: var(--lime); }

      .ctl-etapas li, .ctl-regras li { display: grid; grid-template-columns: 36px 1fr; gap: 8px; padding-block: 18px; border-top: 1px solid var(--line); }
      .ctl-etapas li:last-child, .ctl-regras li:last-child { border-bottom: 1px solid var(--line); }
      .ctl-etapas .ctl-num, .ctl-regras .ctl-num { padding-top: 3px; }
      .ctl-etapa-nome { font-weight: 600; font-size: 17px; letter-spacing: -0.02em; margin-bottom: 4px !important; }
      .ctl-etapa-nome em { font-style: normal; font-weight: 400; color: var(--muted); margin-left: 6px; }
      .ctl-etapas li p:not(.ctl-etapa-nome) { color: rgba(17,17,17,0.78); }

      .ctl-pilares, .ctl-elementos, .ctl-exemplos { display: grid; gap: 16px; }
      .ctl-pilares article, .ctl-elementos article, .ctl-exemplos article {
        background: var(--surface); border: 1px solid var(--line); padding: 24px;
      }
      .ctl-pilares h3, .ctl-elementos h3 { margin-top: 10px; font-size: 22px; letter-spacing: -0.035em; }
      .ctl-resumo { color: var(--muted); margin-top: 2px; }
      .ctl-pilares ul, .ctl-elementos ul, .ctl-lista { margin-top: 16px; }
      .ctl-pilares li, .ctl-elementos li, .ctl-lista li { padding-block: 9px; border-top: 1px solid var(--line); font-size: 15px; }
      .ctl-pilares .ctl-nota { margin-top: 16px; }

      .ctl-tabela { border-top: 1px solid var(--line); }
      .ctl-linha { display: grid; gap: 4px; padding-block: 16px; border-bottom: 1px solid var(--line); }
      .ctl-oque { font-weight: 600; letter-spacing: -0.01em; }
      .ctl-oque a { color: inherit; text-decoration: underline; text-decoration-color: var(--line); text-underline-offset: 3px; }
      .ctl-resolve { color: rgba(17,17,17,0.78); font-size: 15px; }
      .ctl-exemplo { color: var(--muted); font-size: 14px; }
      .ctl-frase { font-size: 19px; line-height: 1.4; letter-spacing: -0.02em; font-weight: 500; text-decoration: underline; text-decoration-color: var(--lime); text-decoration-thickness: 3px; text-underline-offset: 5px; }

      .ctl-pensa { margin-top: 6px !important; font-size: 17px; font-weight: 500; letter-spacing: -0.01em; }
      .ctl-elementos dl { margin-top: 18px; display: grid; grid-template-columns: 120px 1fr; border-top: 1px solid var(--line); }
      .ctl-elementos dt, .ctl-elementos dd { padding-block: 8px; border-bottom: 1px solid var(--line); font-size: 14px; }
      .ctl-elementos dt { color: var(--muted); }
      .ctl-temas-t { margin-top: 20px; font-size: 13px; color: var(--muted); }
      .ctl-elementos ul { margin-top: 6px; }

      .ctl-exemplos article > * + * { margin-top: 14px; }
      .ctl-ex-tag { font-size: 13px; color: var(--muted); }
      .ctl-exemplos h4 { margin-top: 4px !important; font-size: 19px; letter-spacing: -0.03em; }
      .ctl-exemplos article p:not(.ctl-ex-tag) { font-size: 16px; line-height: 1.55; }

      .ctl-vazio { color: var(--muted); padding: 24px; border: 1px dashed var(--line); background: var(--surface); }
      .ctl-rodape { padding-top: 32px; font-size: 13px; color: var(--muted); }

      @media (min-width: 900px) {
        .ctl-topo { padding-block: 80px 48px; }
        .ctl-h1 { font-size: 72px; }
        .ctl-grade { display: grid; grid-template-columns: 200px 1fr; gap: 64px; }
        .ctl-nav { display: flex; flex-direction: column; gap: 2px; position: sticky; top: 24px; align-self: start; padding-top: 56px; }
        .ctl-nav a { font-size: 14px; color: var(--muted); text-decoration: none; padding-block: 5px; }
        .ctl-nav a:hover { color: var(--ink); }
        .ctl-h2 { font-size: 38px; }
        .ctl-abismo { grid-template-columns: 1fr 1fr; }
        .ctl-bigidea { padding: 40px 36px; }
        .ctl-bigidea p { font-size: 44px; }
        .ctl-linha { grid-template-columns: 200px 1fr; column-gap: 24px; }
        .ctl-linha .ctl-exemplo { grid-column: 2; }
      }
    `}</style>
  );
}
