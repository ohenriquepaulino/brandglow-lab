import {
  CAMADAS,
  CICLO,
  CONSCIENCIA,
  CRITERIOS,
  CUSTO_URGENCIA,
  EM_ABERTO,
  EVIDENCIAS,
  ICP_DESTINO,
  ICP_FRASE,
  MANIFESTO,
  MOVIMENTOS,
  NARRATIVA,
  OFERTA,
  PERFIL,
  PERSONA,
  SOFISTICACAO,
} from "@/lib/central-icp";

export const SECOES_ICP = [
  ["icp-oferta", "Negócio e oferta"],
  ["icp-perfil", "Perfil"],
  ["icp-dor", "A dor"],
  ["icp-consciencia", "Consciência"],
  ["icp-persona", "Persona"],
  ["icp-criterios", "Como falar"],
  ["icp-narrativa", "Narrativa"],
  ["icp-movimentos", "7 movimentos"],
  ["icp-manifesto", "Manifesto"],
  ["icp-evidencias", "Evidências"],
  ["icp-aberto", "Em aberto"],
] as const;

const n2 = (i: number) => String(i + 1).padStart(2, "0");

function Tabela({ itens }: { itens: { titulo: string; texto: string; nota?: string }[] }) {
  return (
    <div className="ctl-tabela">
      {itens.map((it) => (
        <div key={it.titulo} className="ctl-linha">
          <p className="ctl-oque">{it.titulo}</p>
          <p className="ctl-resolve">{it.texto}</p>
          {it.nota && <p className="ctl-exemplo">{it.nota}</p>}
        </div>
      ))}
    </div>
  );
}

export function AbaIcp() {
  return (
    <>
      <section className="ctl-sec">
        <h2 className="ctl-h2">O melhor que ninguém conhece.</h2>
        <p className="ctl-lead">{ICP_FRASE}</p>
        <p>
          Quem é o cliente da Legacy, a dor que ele sente de verdade, como falar com ele e a
          narrativa que usamos em anúncio, vídeo, aula e apresentação. O destino é sempre o mesmo: a
          marca vende por ele, e ele volta a fazer o que gosta.
        </p>
      </section>

      <section id="icp-oferta" className="ctl-sec">
        <h2 className="ctl-h2">Negócio e oferta</h2>
        <Tabela itens={OFERTA} />
      </section>

      <section id="icp-perfil" className="ctl-sec">
        <h2 className="ctl-h2">Perfil principal</h2>
        <Tabela itens={PERFIL} />
      </section>

      <section id="icp-dor" className="ctl-sec">
        <h2 className="ctl-h2">A dor, em três camadas</h2>
        <p>
          Quando alguém pergunta, ele diz que precisa vender mais e parar de dar desconto. Mas o que
          pesa no dia a dia é outra coisa. As três camadas se somam com o tempo e pesam mais num ou
          noutro tipo de cliente. A comunicação principal abre pela camada 1; as outras duas viram
          ângulos de anúncio.
        </p>
        <div className="ctl-pilares">
          {CAMADAS.map((c) => (
            <article key={c.titulo}>
              <span className="ctl-num">{c.nome}</span>
              <h3>{c.titulo}</h3>
              <p className="ctl-pensa">“{c.fala}”</p>
              <p className="ctl-icp-texto">{c.texto}</p>
              <dl className="ctl-icp-dl">
                <dt>Quem sente mais</dt>
                <dd>{c.quem}</dd>
                <dt>Gancho</dt>
                <dd>{c.gancho}</dd>
              </dl>
            </article>
          ))}
        </div>
        <Tabela itens={CUSTO_URGENCIA} />
      </section>

      <section id="icp-consciencia" className="ctl-sec">
        <h2 className="ctl-h2">Consciência e sofisticação</h2>
        <div className="ctl-pilares">
          {[CONSCIENCIA, SOFISTICACAO].map((b) => (
            <article key={b.nivel}>
              <span className="ctl-num">{b.nivel}</span>
              <h3>{b.resumo}</h3>
              <dl className="ctl-icp-dl">
                <dt>Leitura</dt>
                <dd>{b.leitura}</dd>
                <dt>Na comunicação</dt>
                <dd>{b.comunicacao}</dd>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section id="icp-persona" className="ctl-sec">
        <h2 className="ctl-h2">Persona: {PERSONA.nome}</h2>
        <div className="ctl-tabela">
          {PERSONA.dados.map(([k, v]) => (
            <div key={k} className="ctl-linha">
              <p className="ctl-oque">{k}</p>
              <p className="ctl-resolve">{v}</p>
            </div>
          ))}
        </div>
        <p>{PERSONA.intro}</p>
        <h3 className="ctl-h3">Dores</h3>
        <ul className="ctl-lista">
          {PERSONA.dores.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <h3 className="ctl-h3">Desejos</h3>
        <ul className="ctl-lista">
          {PERSONA.desejos.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <h3 className="ctl-h3">Medos</h3>
        <ul className="ctl-lista">
          {PERSONA.medos.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="ctl-abismo">
          <div>
            <span>Hoje</span>
            <strong className="ctl-icp-cena">{PERSONA.hoje}</strong>
          </div>
          <div>
            <span>Onde ela quer chegar</span>
            <strong className="ctl-icp-cena">{PERSONA.topo}</strong>
          </div>
        </div>
        <p className="ctl-nota">
          Cenas ilustrativas. Não garantem agenda cheia, faturamento nem que ela nunca mais precise
          vender.
        </p>
      </section>

      <section id="icp-criterios" className="ctl-sec">
        <h2 className="ctl-h2">Como falar com ele</h2>
        <ol className="ctl-regras">
          {CRITERIOS.map((t, i) => (
            <li key={t}>
              <span className="ctl-num">{n2(i)}</span>
              <p>{t}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="icp-narrativa" className="ctl-sec">
        <h2 className="ctl-h2">A narrativa</h2>
        <div className="ctl-tabela">
          {NARRATIVA.map((b) => (
            <div key={b.titulo} className="ctl-linha">
              <p className="ctl-oque">{b.titulo}</p>
              <div className="ctl-resolve ctl-icp-paras">
                {b.texto.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
        <h3 className="ctl-h3">O ciclo</h3>
        <ol className="ctl-etapas">
          {CICLO.map((t, i) => (
            <li key={t}>
              <span className="ctl-num">{n2(i)}</span>
              <p>{t}</p>
            </li>
          ))}
        </ol>
        <p className="ctl-nota">
          E o ciclo recomeça: quanto mais ele conversa, menos tempo tem para mudar o que o cliente
          vê antes.
        </p>
      </section>

      <section id="icp-movimentos" className="ctl-sec">
        <h2 className="ctl-h2">Os 7 movimentos</h2>
        <p>Roteiro para vídeo de vendas, apresentação ou aula.</p>
        <ol className="ctl-etapas">
          {MOVIMENTOS.map(([nome, texto], i) => (
            <li key={nome}>
              <span className="ctl-num">{n2(i)}</span>
              <div>
                <p className="ctl-etapa-nome">{nome}</p>
                <p>{texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="icp-manifesto" className="ctl-sec">
        <h2 className="ctl-h2">Manifesto</h2>
        <p className="ctl-nota">
          Escrito para ser falado, num vídeo ou no começo de uma apresentação.
        </p>
        <div className="ctl-icp-manifesto">
          {MANIFESTO.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
        <div className="ctl-bigidea">
          <span>Assinatura</span>
          <p>{ICP_DESTINO}</p>
        </div>
      </section>

      <section id="icp-evidencias" className="ctl-sec">
        <h2 className="ctl-h2">Evidências</h2>
        <div className="ctl-tabela">
          {EVIDENCIAS.map(([titulo, texto, fonte]) => (
            <div key={titulo} className="ctl-linha">
              <p className="ctl-oque">{titulo}</p>
              <p className="ctl-resolve">{texto}</p>
              <p className="ctl-exemplo">{fonte}</p>
            </div>
          ))}
        </div>
        <p className="ctl-nota">
          O que não temos: fala direta de cliente (as apresentações são monólogos), preço e
          faturamento dos cases, pesquisa de concorrentes e entrevista com quem comprou.
        </p>
      </section>

      <section id="icp-aberto" className="ctl-sec">
        <h2 className="ctl-h2">Em aberto</h2>
        <div className="ctl-tabela">
          {EM_ABERTO.map(([titulo, texto]) => (
            <div key={titulo} className="ctl-linha">
              <p className="ctl-oque">{titulo}</p>
              <p className="ctl-resolve">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="ctl-rodape">
        Fontes: apresentações de entrega (308Network, Maite, Joana Ulmer, GeriAcademy), o método
        desta central, o curso, a base do Conselheiro, o CRM em 16/11/2026 e as decisões do
        Henrique.
      </footer>
    </>
  );
}
