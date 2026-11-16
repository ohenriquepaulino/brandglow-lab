// Diagnóstico de marca (/checkup): 7 perguntas, nome e WhatsApp, e o
// diagnóstico na tela. Tudo vai para leads.checkup e aparece no CRM.
// Quem fatura R$ 10 mil ou mais recebe a mensagem automática da Lais.
//
// Para mudar uma pergunta, mude aqui. Não troque o `id` de uma pergunta que
// já recebeu respostas: o CRM usa o id para mostrar o texto.

export type Ponto = "posicionamento" | "abismo" | "mensagem" | "negocio";

export const PONTOS: Record<
  Ponto,
  { nome: string; comArtigo: string; titulo: string; texto: string; tarefa: string }
> = {
  posicionamento: {
    nome: "Diferencial",
    comArtigo: "o diferencial",
    titulo: "O cliente não sabe por que escolher você.",
    texto:
      "Quando a empresa não decide quem é, o que faz e qual é o diferencial, sobra a resposta que todo mundo dá. O cliente ouve a mesma coisa de três concorrentes e escolhe pelo preço.",
    tarefa:
      "Escreva três coisas que os seus concorrentes fazem e que você não faz de jeito nenhum. É daí que sai o seu diferencial.",
  },
  abismo: {
    nome: "Preço",
    comArtigo: "o preço",
    titulo: "O cliente não enxerga o seu valor antes de ver o preço.",
    texto:
      "Quando o desconto vira parte da venda, o problema raramente é o preço. É a distância entre o que você entrega e o que o cliente entende antes de comprar.",
    tarefa:
      "Na próxima proposta, antes do valor, escreva em três linhas o que o cliente perde se não fechar com você.",
  },
  mensagem: {
    nome: "Atrair clientes",
    comArtigo: "atrair clientes sem indicação",
    titulo: "A sua marca ainda não vende sozinha.",
    texto:
      "Se quase todo cliente chega por indicação, quem vende é quem indica, não a marca. Quem te encontra pelo perfil não entende rápido o que você faz e para quem.",
    tarefa:
      "Peça para alguém que não te conhece olhar o seu Instagram por 10 segundos e dizer o que você vende e para quem.",
  },
  negocio: {
    nome: "Empresa sem você",
    comArtigo: "a empresa depender de você",
    titulo: "A empresa ainda depende de você para existir.",
    texto:
      "Quando a empresa é só o nome do dono, ela para quando ele para. Uma empresa que cresce tem produtos, processo e valor mesmo sem você na sala.",
    tarefa:
      "Liste tudo o que a empresa vende e quanto cada item rende por mês. Se um item só passa de 80% do faturamento, a empresa depende demais dele, e de você.",
  },
};

/** Ordem do método. Em empate, o ponto mais fraco é o que vem primeiro. */
const ORDEM: Ponto[] = ["posicionamento", "abismo", "mensagem", "negocio"];

type Escolha = {
  id: string;
  tipo: "escolha";
  titulo: string;
  sub?: string;
  /** Rótulo curto para o CRM. */
  curto: string;
  /** Pergunta que pontua (nota 1 fraca a 3 forte, na ordem das opções). */
  ponto?: Ponto;
  opcoes: string[];
};

type Aberta = {
  id: string;
  tipo: "aberta";
  titulo: string;
  sub?: string;
  curto: string;
  placeholder: string;
};

export type Pergunta = Escolha | Aberta;

export const PERGUNTAS: Pergunta[] = [
  {
    id: "area",
    tipo: "escolha",
    curto: "Área",
    titulo: "Qual é a sua área de atuação?",
    opcoes: [
      "Saúde",
      "Estética e bem-estar",
      "Arquitetura e interiores",
      "Advocacia",
      "Consultoria e serviços B2B",
      "Educação e mentoria",
      "Outra",
    ],
  },
  {
    id: "qqq",
    tipo: "escolha",
    ponto: "posicionamento",
    curto: "Quem é, o que faz, diferencial",
    titulo: "Você consegue dizer em uma frase quem você é, o que faz e qual é o seu diferencial?",
    opcoes: [
      "Não, travo em pelo menos uma das três",
      "Quem sou e o que faço, sim. O diferencial é difícil",
      "Sim, as três, numa frase curta",
    ],
  },
  {
    id: "desconto",
    tipo: "escolha",
    ponto: "abismo",
    curto: "Desconto para fechar",
    titulo: "Para fechar uma venda, você costuma precisar dar desconto?",
    opcoes: ["Quase sempre", "Às vezes", "Raramente: o cliente fecha pelo valor que eu cobro"],
  },
  {
    id: "origem",
    tipo: "escolha",
    ponto: "mensagem",
    curto: "De onde vêm os clientes",
    titulo: "De onde vem a maioria dos seus clientes?",
    opcoes: [
      "Quase tudo de indicação",
      "Indicação, e um pouco de Instagram ou anúncio",
      "Da marca: chegam já sabendo quem eu sou",
    ],
  },
  {
    id: "dono",
    tipo: "escolha",
    ponto: "negocio",
    curto: "Se o dono parar",
    titulo: "Se você parar de atender por um mês, a empresa…",
    opcoes: ["Para junto", "Segura um pouco, mas cai", "Continua: tem time e processo"],
  },
  {
    id: "porque",
    tipo: "aberta",
    curto: "Por que escolhem",
    titulo: "Por que os seus melhores clientes escolhem você?",
    sub: "Escreva do seu jeito, em uma ou duas frases.",
    placeholder: "Ex.: porque eu…",
  },
  {
    id: "faturamento",
    tipo: "escolha",
    curto: "Faturamento",
    titulo: "Qual é o faturamento mensal da empresa?",
    // Mesmas faixas da /busca: lead-signal.ts e crm-auth.ts já conhecem todas.
    opcoes: [
      "Ainda não estou faturando",
      "Até R$ 4.000",
      "De R$ 4.000 a R$ 10.000",
      "De R$ 10.000 a R$ 30.000",
      "De R$ 30.000 a R$ 60.000",
      "Acima de R$ 60.000",
    ],
  },
];

// Palavras que todo concorrente usa. Achar alguma na resposta aberta é sinal
// de que o diferencial ainda não está claro.
const GENERICAS = [
  "qualidade",
  "atendimento",
  "excelência",
  "compromisso",
  "confiança",
  "experiência",
  "dedicação",
  "humanizado",
  "humanizada",
  "personalizado",
  "personalizada",
  "transparência",
  "pontualidade",
  "profissionalismo",
  "carinho",
  "cuidado",
  "detalhes",
  "preço justo",
];

function semAcento(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function palavrasGenericas(texto: string): string[] {
  const t = ` ${semAcento(texto).replace(/[^a-z0-9]+/g, " ")} `;
  return GENERICAS.filter((p) => t.includes(` ${semAcento(p)} `));
}

export type Respostas = Record<string, string>;

export type Diagnostico = {
  notas: Record<Ponto, 1 | 2 | 3>;
  fraco: Ponto;
  abismo: "pequeno" | "médio" | "grande";
  genericas: string[];
};

export function diagnosticar(r: Respostas): Diagnostico {
  const notas = { posicionamento: 2, abismo: 2, mensagem: 2, negocio: 2 } as Record<
    Ponto,
    1 | 2 | 3
  >;
  for (const p of PERGUNTAS) {
    if (p.tipo !== "escolha" || !p.ponto) continue;
    const i = p.opcoes.indexOf(r[p.id] ?? "");
    if (i >= 0) notas[p.ponto] = (i + 1) as 1 | 2 | 3;
  }
  // A resposta aberta confere a pergunta do QQQ: quem diz que tem diferencial,
  // mas escreve as palavras de todo mundo, perde um degrau no posicionamento.
  const genericas = palavrasGenericas(r.porque ?? "");
  if (genericas.length && notas.posicionamento > 1) {
    notas.posicionamento = (notas.posicionamento - 1) as 1 | 2;
  }
  let fraco = ORDEM[0]!;
  for (const p of ORDEM) if (notas[p] < notas[fraco]) fraco = p;
  const media = ORDEM.reduce((s, p) => s + notas[p], 0) / ORDEM.length;
  const abismo = media <= 1.5 ? "grande" : media <= 2.5 ? "médio" : "pequeno";
  return { notas, fraco, abismo, genericas };
}

/** "a, b e c" */
export function listaComE(itens: string[]): string {
  return itens.length <= 1
    ? (itens[0] ?? "")
    : `${itens.slice(0, -1).join(", ")} e ${itens.at(-1)}`;
}

export const ROTULO_NOTA = { 1: "fraco", 2: "no meio", 3: "forte" } as const;

/** O que vai em leads.checkup. */
export type CheckupDados = {
  versao: 1;
  respostas: Respostas;
  fraco: Ponto;
  abismo: Diagnostico["abismo"];
};

/** Linhas do aviso no grupo. */
export function resumoCheckup(c: CheckupDados): string {
  const linhas = [
    `Diagnóstico: distância ${c.abismo}, ponto cego em ${PONTOS[c.fraco]?.nome ?? c.fraco}`,
  ];
  const porque = c.respostas.porque?.trim();
  if (porque) linhas.push(`Por que escolhem: "${porque.slice(0, 200)}"`);
  return linhas.join("\n");
}

/** Mensagem automática da Lais para quem fez o diagnóstico e é qualificado. */
export function mensagemLaisCheckup(nome: string, fraco: Ponto): string {
  const primeiro = nome.trim().split(/\s+/)[0] ?? "";
  const fmt = primeiro ? primeiro[0]!.toUpperCase() + primeiro.slice(1).toLowerCase() : "";
  return [
    `Oii ${fmt}… Aqui é a Lais, da Legacy`,
    `Vi aqui o seu diagnóstico de marca. O ponto que mais pesou foi ${PONTOS[fraco].comArtigo}, e é bem por aí que a gente começaria no seu caso…`,
    `Queria marcar 25 min por vídeo pra te mostrar o que mudaria na sua marca. Qual dia fica melhor pra você essa semana`,
  ].join("\n\n");
}

// ---------------------------------------------------------------------------
// Validações e textos que mudam conforme a resposta.

const NOMES_FALSOS = [
  "teste",
  "test",
  "testando",
  "asdf",
  "qwerty",
  "fulano",
  "ciclano",
  "beltrano",
  "nome",
  "sobrenome",
  "admin",
  "lead",
  "ninguem",
  "anonimo",
  "xxx",
  "abc",
  "aaa",
  "eu",
  "sei la",
];

/** null = nome aceito; senão, o que dizer. */
export function erroNome(valor: string): string | null {
  const nome = valor.trim().replace(/\s+/g, " ");
  if (!nome) return "Digite o seu nome";
  if (/\d/.test(nome)) return "O nome não pode ter números";
  if (!/^[\p{L}' .-]+$/u.test(nome)) return "Use só letras no nome";
  const letras = nome.replace(/[^\p{L}]/gu, "");
  if (letras.length < 3) return "Digite o seu nome completo";
  const base = semAcento(nome);
  if (NOMES_FALSOS.some((f) => base === f || base.startsWith(`${f} `))) {
    return "Digite o seu nome de verdade, é ele que vai no diagnóstico";
  }
  // "aaaa", "kkkk", "ssss": a mesma letra três vezes seguidas.
  if (/(\p{L})\1\1/u.test(base)) return "Confira o seu nome";
  // Sem nenhuma vogal ("bcdf", "jkl"): digitação aleatória.
  if (!/[aeiouy]/.test(base)) return "Confira o seu nome";
  return null;
}

/** null = resposta aberta aceita; senão, o que dizer. */
export function erroRespostaAberta(valor: string): string | null {
  const t = semAcento(valor.trim());
  const palavras = t.split(/\s+/).filter((p) => /[a-z]/.test(p));
  if (palavras.length < 3 || t.length < 15) return "Escreva pelo menos uma frase completa";
  if (/\b(teste|asdf|qwerty)\b/.test(t) || /(\w)\1\1\1/.test(t)) {
    return "Escreva a sua resposta de verdade: é ela que a gente analisa";
  }
  return null;
}

// Quem é o "cliente" em cada área: o diagnóstico fala a língua de quem responde.
const CLIENTE_POR_AREA: Record<string, [string, string]> = {
  Saúde: ["paciente", "pacientes"],
  "Estética e bem-estar": ["cliente", "clientes"],
  "Educação e mentoria": ["aluno", "alunos"],
};

/** Troca "cliente(s)" pela palavra da área ("paciente", "aluno"), mantendo maiúscula. */
export function falarComArea(texto: string, area: string | undefined): string {
  const par = area ? CLIENTE_POR_AREA[area] : undefined;
  if (!par) return texto;
  return texto.replace(/\b([Cc])liente(s?)\b/g, (_m, c: string, plural: string) => {
    const p = plural ? par[1] : par[0];
    return c === "C" ? p[0]!.toUpperCase() + p.slice(1) : p;
  });
}
