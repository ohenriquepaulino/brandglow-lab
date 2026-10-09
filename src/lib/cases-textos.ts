// Textos dos cases, num lugar só: o site (/cases) e as propostas leem daqui.
// Mesmo padrão em todos: resumo de uma frase e quatro blocos curtos
// (Contexto, Desafio, O que fizemos, Resultado). Resultado é opcional.

export type CaseTexto = {
  name: string;
  segment: string;
  /** Uma frase: aparece no card do site e no topo do case na proposta. */
  short: string;
  context: string;
  challenge: string;
  delivery: string;
  result?: string;
};

export const CASE_TEXTOS: Record<string, CaseTexto> = {
  geriacademy: {
    name: "Geriacademy",
    segment: "Educação médica",
    short:
      "Marca e ecossistema educacional para uma escola médica que quer qualificar o cuidado com o idoso no Brasil.",
    context:
      "A Geriacademy capacita médicos e profissionais de saúde em Geriatria e lidera um movimento de valorização da saúde do idoso.",
    challenge:
      "Ser vista como mais do que uma escola: uma plataforma de referência, com comunidade viva e produtos prontos para escalar.",
    delivery:
      "Posicionamento, narrativa de marca, a comunidade Geri Sim! e uma esteira de produtos: cursos, certificações, mentorias, encontros presenciais e uma IA própria, a GerIA.",
  },
  medcopilot: {
    name: "MedCopilot",
    segment: "Tecnologia para a saúde",
    short:
      "Arquitetura de marca para um hub de soluções com inteligência artificial para médicos: uma marca mãe e várias marcas filhas.",
    context:
      "A MedCopilot reúne soluções de tecnologia e inteligência artificial para médicos e lança novos produtos com frequência.",
    challenge:
      "Criar uma hierarquia de marca para que cada novo produto não deixasse a empresa parecendo um amontoado de ferramentas soltas.",
    delivery:
      "A marca mãe MedCopilot, que assina tudo e passa confiança, e um sistema de marcas filhas para cada solução (Data, Anest, APA e EDU Copilot), com espaço já reservado para os próximos lançamentos.",
  },
  "nutri-yuri-gomes": {
    name: "Nutri Yuri Gomes",
    segment: "Nutrição · Marca pessoal",
    short:
      "Clareza de comunicação e identidade premium para um nutricionista que queria aumentar o ticket e levar o atendimento de Santos para São Paulo.",
    context: "Yuri atendia só em Santos, com um ticket abaixo do que o trabalho dele valia.",
    challenge:
      "Ganhar clareza de comunicação e uma imagem premium para cobrar mais e conquistar pacientes em São Paulo.",
    delivery:
      "Estratégia de comunicação e uma identidade visual premium, com uma marca pessoal que transmite autoridade, cuidado e proximidade.",
    result:
      "Aumentou o valor das consultas, fechou a agenda do ano e hoje atende em Santos, em Alphaville e em São Paulo, na região da Vila Olímpia e da Faria Lima.",
  },
  "mariana-brumatti": {
    name: "Mariana Brumatti",
    segment: "Estética · Minas Gerais",
    short:
      "Marca estratégica para uma biomédica esteta que queria profissionalizar o atendimento e se posicionar no alto padrão.",
    context:
      "Mariana é biomédica esteta em Minas Gerais e oferece tratamentos de rejuvenescimento e bem-estar. O trabalho tinha qualidade, mas a marca não mostrava isso.",
    challenge:
      "Profissionalizar a imagem e apresentar o serviço de forma high ticket, à altura do que ela entrega.",
    delivery:
      "Uma marca estratégica, com posicionamento e identidade visual pensados para comunicar valor e sofisticação em todos os pontos de contato.",
  },
  moewa: {
    name: "MOEWA",
    segment: "Estética, nutrição e lifestyle",
    short:
      "Marca criada do zero, do nome à estratégia, para uma clínica 360 premium no universo wellness.",
    context:
      "Samanta e Camila juntaram a amizade, a história como atletas e o background em lifestyle fitness para abrir um negócio juntas, já com uma identidade premium.",
    challenge:
      "Posicionar uma clínica que reúne estética, saúde, nutrição e lifestyle num só lugar, com percepção de alto valor desde o primeiro dia.",
    delivery:
      "Nome, identidade visual e estratégia de comunicação. E o Clube MOEWA: um clube de assinatura em que o cliente vira sócio, ganha cartão de membro e aproveita todos os serviços.",
    result:
      "Um espaço premium onde a cliente resolve tudo o que precisa, se conecta com outras pessoas e se sente em casa.",
  },
  "joana-co": {
    name: "Joana Ulmer Co*",
    segment: "Marca pessoal · Educação financeira",
    short:
      "Marca pessoal premium para se destacar num mercado tradicional e “quadrado” como o de finanças.",
    context: "Joana atua em finanças, um mercado conservador onde todo mundo comunica igual.",
    challenge:
      "Construir uma marca pessoal forte, que fugisse do padrão do setor e falasse com um público de alta renda.",
    delivery:
      "Um posicionamento premium voltado ao público de alta renda, com estratégia de comunicação e identidade visual pensadas juntas.",
    result:
      "A Joana passou a vender produtos a partir de R$ 19 mil e hoje é uma das referências do segmento.",
  },
  "308-network": {
    name: "308NETWORK",
    segment: "Mercado imobiliário · Patrimônio",
    short:
      "Posicionamento premium e “preto no branco” para que o cliente não tenha dúvida de quem procurar quando o assunto é imóvel.",
    context: "A 308, do Leandro, já tinha reputação construída no atendimento e na confiança.",
    challenge:
      "Fazer a marca ser lembrada sempre que o cliente pensa em imóveis e deixar claro que a 308 resolve qualquer questão imobiliária.",
    delivery:
      "Um posicionamento premium com uma identidade marcante e extremamente simples, literalmente preto no branco, e uma comunicação estratégica que reforça autoridade e clareza.",
    result:
      "Uma marca que vira referência imediata: quando o assunto é imóvel, o cliente lembra do Leandro e da 308.",
  },
  "o-de-casa": {
    name: "Ô de Casa",
    segment: "Mercado imobiliário · Belo Horizonte",
    short:
      "Marca estratégica para uma imobiliária mineira que subiu de patamar para atender clientes de médio e alto padrão.",
    context:
      "A Ô de Casa estava mudando de posição no mercado de Belo Horizonte para atender clientes de médio e alto padrão.",
    challenge:
      "Deixar de ser mais uma imobiliária e criar uma conexão forte com o cliente ideal, sem perder a proximidade do jeito mineiro.",
    delivery:
      "Posicionamento e identidade visual. A marca aproveita a expressão mineira do nome para criar proximidade, com uma identidade moderna, criativa e confiável, que coloca o cliente no centro.",
    result:
      "Clareza na comunicação, marca consistente em todos os pontos de contato, mais facilidade para produzir conteúdo e maior percepção de valor por parte dos clientes.",
  },
};
