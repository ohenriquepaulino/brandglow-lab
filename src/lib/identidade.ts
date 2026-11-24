// Página /identidade (desde 2026-11-24): continua o anúncio campeão da
// Principal ("Procuro 3 empresários") e qualifica com SPICED num formulário de
// 5 perguntas + contato. As respostas vão para leads.qualificacao (jsonb).
// Público: prestadores de serviço que já faturam. Restaurante, bar, varejo e
// moda entram no CRM, mas sem Lead no pixel e sem mensagem da Lais. O resto
// segue o fluxo padrão da Lais (boas-vindas por faixa e cadência).

export type PerguntaId = "area" | "faturamento" | "perda" | "origem" | "prazo";

export type Pergunta = {
  id: PerguntaId;
  /** Rótulo curto para o CRM e o aviso no grupo. */
  curto: string;
  titulo: string;
  opcoes: string[];
};

export const AREAS_FORA = ["Restaurante, bar ou alimentação", "Loja, varejo ou moda"];

export const SEM_FATURAMENTO = "Ainda não estou faturando";

export const PERGUNTAS: Pergunta[] = [
  {
    id: "area",
    curto: "Área",
    titulo: "Com o que você trabalha?",
    opcoes: [
      "Saúde: clínica, consultório ou estética",
      "Arquitetura ou engenharia",
      "Advocacia, contabilidade ou consultoria",
      "Imobiliária",
      "Mentoria, cursos ou marca pessoal",
      "Outro tipo de serviço",
      ...AREAS_FORA,
    ],
  },
  {
    id: "faturamento",
    curto: "Faturamento",
    titulo: "Quanto a sua empresa fatura por mês?",
    // Mesmas faixas da /busca e do /checkup: lead-signal.ts e crm-auth.ts já conhecem todas.
    opcoes: [
      SEM_FATURAMENTO,
      "Até R$ 4.000",
      "De R$ 4.000 a R$ 10.000",
      "De R$ 10.000 a R$ 30.000",
      "De R$ 30.000 a R$ 60.000",
      "Acima de R$ 60.000",
    ],
  },
  {
    id: "perda",
    curto: "Cliente novo",
    titulo: "Quando um cliente novo te procura, o que mais acontece?",
    opcoes: [
      "Pergunta o preço e some",
      "Pede desconto",
      "Diz que vai pensar e não volta",
      "Quase nenhum cliente novo me procura",
    ],
  },
  {
    id: "origem",
    curto: "Como chegam",
    titulo: "Hoje, como a maioria dos seus clientes chega até você?",
    opcoes: ["Indicação", "Instagram", "Google", "Anúncios"],
  },
  {
    id: "prazo",
    curto: "Quando quer começar",
    titulo: "Quando você quer começar o projeto da sua marca?",
    opcoes: [
      "Ainda este mês",
      "No mês que vem",
      "Daqui a 2 ou 3 meses",
      "Ainda não sei, estou pesquisando",
    ],
  },
];

export type Respostas = Partial<Record<PerguntaId, string>>;

/** Evento crítico como a pessoa declarou, sem dedução. */
export type Urgencia = "confirmada" | "so_prazo" | "sem_urgencia";

export type QualificacaoDados = {
  versao: 1;
  respostas: Respostas;
  urgencia: Urgencia;
  fora_do_recorte: boolean;
};

export function foraDoRecorte(area: string | null | undefined): boolean {
  return AREAS_FORA.includes((area ?? "").trim());
}

export function urgenciaDe(prazo: string | null | undefined): Urgencia {
  if (prazo === "Ainda este mês" || prazo === "No mês que vem") return "confirmada";
  if (prazo === "Daqui a 2 ou 3 meses") return "so_prazo";
  return "sem_urgencia";
}

export const ROTULO_URGENCIA: Record<Urgencia, string> = {
  confirmada: "confirmada",
  so_prazo: "só prazo",
  sem_urgencia: "não identificada",
};

export function montarQualificacao(respostas: Respostas): QualificacaoDados {
  return {
    versao: 1,
    respostas,
    urgencia: urgenciaDe(respostas.prazo),
    fora_do_recorte: foraDoRecorte(respostas.area),
  };
}

/** Linhas do aviso no grupo. */
export function resumoQualificacao(q: QualificacaoDados): string {
  const r = q.respostas;
  const linhas: string[] = [];
  if (q.fora_do_recorte) linhas.push("⚠️ Fora do recorte (sem mensagem da Lais)");
  if (r.perda) linhas.push(`Cliente novo: ${r.perda}`);
  if (r.origem) linhas.push(`Como chegam: ${r.origem}`);
  if (r.prazo) linhas.push(`Quer começar: ${r.prazo} (urgência ${ROTULO_URGENCIA[q.urgencia]})`);
  return linhas.join("\n");
}
