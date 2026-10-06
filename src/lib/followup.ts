// Regras e textos do follow-up, usados no servidor (leitura e resumo do grupo)
// e no Kanban (tag dos cards). A leitura em si fica em followup.server.ts.

export type FollowupTipo = "responder" | "cobrar" | "puxar";

export type Followup = {
  tipo: FollowupTipo;
  ultima_msg_em: string;
  ultima_de: "lead" | "nos";
};

const HORA = 60 * 60_000;
const DIA = 24 * HORA;

export const PRAZOS = {
  /** Lead falou por último: tag depois de 2h sem resposta nossa. */
  responder: 2 * HORA,
  /** Nós falamos por último: tag depois de 2 dias sem retorno. */
  cobrar: 2 * DIA,
  /** Ninguém fala, seja quem for o último: tag depois de 5 dias. */
  puxar: 5 * DIA,
};

/**
 * Etapas onde o follow-up vale. Oportunidades fica de fora (ainda está nas
 * boas-vindas automáticas); Ganho e Perdido também.
 */
export const COLUNAS_FOLLOWUP = [
  "aguardando-resposta",
  "conversando",
  "reuniao-agendada",
  "fechamento",
  "potencial-futuro",
];

export function classificar(ultimaDe: "lead" | "nos", idadeMs: number): FollowupTipo | null {
  if (idadeMs >= PRAZOS.puxar) return "puxar";
  if (ultimaDe === "lead" && idadeMs >= PRAZOS.responder) return "responder";
  if (ultimaDe === "nos" && idadeMs >= PRAZOS.cobrar) return "cobrar";
  return null;
}

export const FOLLOWUP_INFO: Record<
  FollowupTipo,
  { emoji: string; label: string; titulo: string; dica: string; cor: string; texto: string; ordem: number }
> = {
  responder: {
    emoji: "🔴",
    label: "Responder",
    titulo: "Responder agora",
    dica: "o lead está esperando",
    cor: "#B91C1C",
    texto: "#FFFFFF",
    ordem: 0,
  },
  cobrar: {
    emoji: "🟠",
    label: "Cobrar",
    titulo: "Cobrar resposta",
    dica: "a gente falou por último",
    cor: "#D75631",
    texto: "#FFFFFF",
    ordem: 1,
  },
  puxar: {
    emoji: "⚪",
    label: "Puxar assunto",
    titulo: "Puxar assunto",
    dica: "ninguém fala há 5 dias ou mais",
    cor: "#121110",
    texto: "#CFFF87",
    ordem: 2,
  },
};

function dias(ms: number) {
  return Math.max(1, Math.floor(ms / DIA));
}

/** "há 40 min", "há 5h", "ontem", "há 3 dias". */
export function haQuanto(ms: number): string {
  if (ms < HORA) return `há ${Math.max(1, Math.floor(ms / 60_000))} min`;
  if (ms < DIA) return `há ${Math.floor(ms / HORA)}h`;
  if (ms < 2 * DIA) return "ontem";
  return `há ${dias(ms)} dias`;
}

/** Complemento da tag: "mandou mensagem há 5h", "3 dias sem retorno", "12 dias parado". */
export function detalheFollowup(tipo: FollowupTipo, idadeMs: number): string {
  const n = dias(idadeMs);
  if (tipo === "responder") return `mandou mensagem ${haQuanto(idadeMs)}`;
  if (tipo === "cobrar") return `${n} ${n === 1 ? "dia" : "dias"} sem retorno`;
  return `${n} dias parado`;
}
