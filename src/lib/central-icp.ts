// Aba "ICP e Narrativa" da /central (/central?aba=icp).
// Quem é o cliente da Legacy, a dor que ele sente, como falar com ele e a
// narrativa (ideia central, ciclo, 7 movimentos e manifesto). Feito em
// 16–17/11/2026 a partir das 4 apresentações de entrega, da /central, do curso,
// da base do Conselheiro, do CRM e das decisões do Henrique. Itens marcados
// "a validar" ainda esperam confirmação.

export const ICP_ATUALIZADO = "17 de novembro de 2026";

export const ICP_TITULO = "O melhor que ninguém conhece.";

export const ICP_FRASE =
  "Ele abriu o negócio pra trabalhar com o que gosta, e hoje passa boa parte do dia tentando convencer cliente.";

export const ICP_DESTINO = "A sua marca vende. Você faz o que ama.";

export const OFERTA: { titulo: string; texto: string; nota?: string }[] = [
  {
    titulo: "Oferta",
    texto:
      "Projeto de estratégia e identidade visual de marca. Uma consultoria de marca, não um estúdio de logo.",
  },
  {
    titulo: "Entrega",
    texto:
      "Mercado e concorrência, o que a marca comunica hoje, o cliente em narrativa, posicionamento, mensagem, comunidade ou movimento, marca como negócio, plano de execução e, por último, a identidade visual. Tudo sai numa apresentação-guia de 70 a 80 páginas.",
    nota: "Cerca de 6 semanas pelo site; a base do Conselheiro fala em 40 dias. A partir de R$ 4.500 nas boas-vindas e R$ 5.000 na proposta genérica (a validar).",
  },
  {
    titulo: "Resultado",
    texto:
      'A empresa passa a ter uma resposta pronta para "quem é você, o que você faz e por que você". Perfil, site, proposta, recepção, social media e tráfego dizem a mesma coisa, sem depender do dono.',
  },
  {
    titulo: "Mudança na vida",
    texto:
      "O cliente passa a chegar já sabendo por que ele. Ele gasta menos tempo convencendo e mais tempo fazendo o trabalho que o fez abrir o negócio.",
  },
  {
    titulo: "Limites",
    texto:
      'A Legacy decide e traduz. A empresa executa. O projeto não faz gestão de redes, tráfego nem vendas. "Voltar a fazer o que gosta" é a aspiração: não garante agenda cheia, fim do desconto nem que o dono nunca mais precise vender.',
  },
];

export const PERFIL: { titulo: string; texto: string }[] = [
  {
    titulo: "Quem é",
    texto:
      "Profissional que abriu o próprio negócio para fazer aquilo em que é bom, ficou bom, já fatura, e hoje passa boa parte do dia tentando provar isso. Clínicas, consultórios, escritórios de arquitetura, consultorias, especialistas com marca pessoal, imobiliárias de nicho. Vende o próprio conhecimento ou serviço, não um produto de prateleira.",
  },
  {
    titulo: "Adequação",
    texto:
      "O decisor é o dono ou sócio. Fatura a partir de R$ 10 mil por mês, com foco em quem está perto de R$ 30 mil. Consegue investir no projeto, reservar tempo para as calls e aplicar o que for decidido.",
  },
  {
    titulo: "Fora do recorte",
    texto:
      "Quem ainda não fatura ou fatura até R$ 6 mil (vai para o curso e a apresentação gravada). Quem quer só um logo. Quem espera que a Legacy execute redes e tráfego. Moda, varejo e alimentação de balcão. Não é proibição de venda, só delimita o público prioritário.",
  },
  {
    titulo: "Base",
    texto:
      "Os quatro clientes das apresentações de entrega (308Network, Maite, Joana Ulmer, GeriAcademy) são especialistas ou empresas de serviço com produto rodando e clientes satisfeitos. O anúncio traz um público mais cedo: dos 203 leads de 03/07 a 16/11, 54% não faturam ou faturam até R$ 6 mil. O ICP sai de quem comprou, não do lead médio do anúncio.",
  },
];

export const CAMADAS: {
  nome: string;
  titulo: string;
  fala: string;
  texto: string;
  quem: string;
  gancho: string;
}[] = [
  {
    nome: "Camada 1 · O dia a dia",
    titulo: "Ter que se vender",
    fala: "Eu queria só atender. Não aguento mais ter que me vender.",
    texto:
      "Ele é bom no que faz, mas não gosta de vender. Falar de preço deixa ele desconfortável, postar sobre si parece exagero, e explicar de novo por que custa isso cansa. Sobra menos tempo e energia para o trabalho em si.",
    quem: "O técnico: profissional de saúde, arquiteto, consultor. Bom no ofício e desconfortável na vitrine.",
    gancho: "Você não abriu uma clínica para passar a noite explicando o seu preço no WhatsApp.",
  },
  {
    nome: "Camada 2 · A injustiça",
    titulo: "Ser bom não bastou",
    fala: "Eu sei que sou melhor. Por que ela tem fila e eu tenho que dar desconto?",
    texto:
      "Ele sempre achou que, sendo bom, os clientes viriam. Ficou bom e, mesmo assim, vê concorrentes que entregam menos cobrando o dobro e aparecendo em todo lugar. Isso incomoda mais pela injustiça do que pelo dinheiro, e com o tempo ele começa a se perguntar se o problema é ele.",
    quem: "Quem tem anos de mercado e vê concorrentes mais novos, ou piores, passando na frente.",
    gancho: "A sua colega de turma cobra o dobro. Você sabe quem atende melhor.",
  },
  {
    nome: "Camada 3 · O cansaço",
    titulo: "Trabalhar mais e não sair do lugar",
    fala: "Faz três anos que eu digo que esse vai ser o ano.",
    texto:
      "Já fatura bem, mas toda venda, resposta e orçamento passa por ele. Trabalha mais a cada ano e o faturamento fica parecido, até o trabalho que ele gostava virar obrigação. Às vezes pensa em largar tudo.",
    quem: "Quem já fatura R$ 30 mil ou mais, com equipe pequena e o dono no centro de tudo.",
    gancho:
      "Faz três anos que o seu faturamento é o mesmo, e você está trabalhando mais do que antes.",
  },
];

export const CUSTO_URGENCIA: { titulo: string; texto: string }[] = [
  {
    titulo: "Por que é caro",
    texto:
      "Custa dinheiro, com desconto, orçamento que não fecha e social media ou tráfego sem direção. E custa tempo: as horas que iriam para o trabalho vão para explicar e negociar, e o prazer de trabalhar diminui.",
  },
  {
    titulo: "Por que é urgente",
    texto:
      "Fica urgente quando o trabalho que ele gostava vira obrigação e ele começa a pensar se vale a pena continuar assim. Costuma vir junto de um momento prático: expandir, lançar um produto, contratar quem vai comunicar ou ver um concorrente com mais estrutura.",
  },
];

export const CONSCIENCIA = {
  nivel: "Consciência 2",
  resumo: "Consciente do problema, sem saber a saída.",
  leitura:
    "Ele sente o cansaço de se vender e a injustiça de não ser visto. Mas acha que a saída depende dele: postar mais, aprender a vender, baixar o preço, trocar o logo. Não percebe que pessoalmente já convence bem, e que o que falha é o que o cliente vê antes de falar com ele.",
  comunicacao:
    "Começar pelo que ele sente, com as palavras dele. Depois mostrar que ele convence quando conversa, e que o Instagram, o site e o orçamento não fazem isso. Só então apresentar a Legacy.",
};

export const SOFISTICACAO = {
  nivel: "Sofisticação 3",
  resumo: "Mecanismo, com cansaço de promessa (a validar).",
  leitura:
    '"Marca forte", "autoridade" e "posicionamento premium" viraram promessa de todo designer e de toda agência. Ele já ouviu tudo isso e já pagou por logo que não mudou nada.',
  comunicacao:
    "Explicar como funciona e provar com casos reais: o que foi decidido em cada projeto e por quê. Premissas, não promessas.",
};

export const PERSONA = {
  nome: "Fernanda",
  dados: [
    ["Idade", "38 anos"],
    ["Região", "Sul, Sudeste e Centro-Oeste"],
    ["Profissão", "Fisioterapeuta, dona de clínica"],
  ] as [string, string][],
  intro:
    "Fernanda abriu a clínica há sete anos porque amava atender. Nome, idade e profissão são da personagem, não critério de segmentação. A mesma história vale para o arquiteto ou o consultor com escritório próprio.",
  dores: [
    'Passa as noites respondendo "qual a diferença de vocês?" e explicando o preço, quando queria estar descansando para atender no dia seguinte.',
    "Vê a colega de faculdade, que ela sabe que atende pior, com agenda cheia e cobrando o dobro.",
    "Faz três anos que o faturamento é o mesmo, e ela trabalha mais a cada ano.",
  ],
  desejos: [
    "Voltar a passar o dia atendendo, que é o que ela ama.",
    "Que a paciente chegue sabendo por que ela, sem pedir desconto.",
  ],
  medos: [
    "Passar mais dez anos sendo a melhor que ninguém conhece.",
    "Que o trabalho que ela ama vire só obrigação, até ela desistir.",
  ],
  hoje: '22h, depois de atender o dia inteiro, ela está no sofá respondendo mensagem de paciente nova pedindo desconto. Antes de dormir, abre o Instagram da colega de turma: post de "agenda fechada para dezembro".',
  topo: 'Terça de manhã ela está atendendo. No intervalo, a recepção avisa que três pacientes novas agendaram, e uma escreveu "vi o seu perfil e é exatamente o que eu procurava". Ninguém pediu desconto. Ela não precisou explicar nada.',
};

export const CRITERIOS: string[] = [
  'Falar com as palavras dele: "me vender", "dar desconto", "explicar de novo", "a colega que cobra o dobro". Abismo, posicionamento e proposta de valor ficam para dentro do projeto.',
  "Abrir com uma cena que ele viveu esta semana, não com uma dor genérica.",
  'Escolher a camada pelo público: o técnico ouve "ter que se vender", o veterano ouve "ser bom não bastou", quem já fatura alto ouve "trabalhar mais e não sair do lugar". A comunicação principal abre pela camada 1.',
  "Nunca culpar ele. Ele vende bem quando conversa; quem não explica é o Instagram, o site e o orçamento.",
  "O destino é sempre o mesmo: a marca vende por ele, e ele volta a fazer o que ama. Não prometer faturamento.",
  "Desmontar as saídas erradas (trocar o logo, baixar o preço, postar mais, aprender a se vender) antes de apresentar a certa.",
  "Provar com o que foi decidido nos cases reais. Premissas, não promessas.",
  "Conversa leve: frases curtas ligadas por conectivos, sem emoji, sem jargão e sem frase de efeito em cada linha. A Legacy aparece no fim.",
];

export const NARRATIVA: { titulo: string; texto: string[] }[] = [
  {
    titulo: "A ideia central",
    texto: [
      "Você abriu o seu negócio pra trabalhar com o que gosta, e hoje passa boa parte do dia tentando convencer cliente.",
    ],
  },
  {
    titulo: "O conflito",
    texto: [
      "Quem já é cliente sabe que ele é bom. Quem ainda não é olha o Instagram dele e acha que ele é parecido com os outros.",
    ],
  },
  {
    titulo: "O que ele não percebe",
    texto: [
      "Quando o cliente conversa com ele, costuma fechar.",
      "O problema é que muita gente nem chega nessa conversa, porque antes olhou o Instagram e o orçamento dele e achou que ele era igual aos outros.",
    ],
  },
  {
    titulo: "A mudança de olhar",
    texto: [
      "Ele vende bem quando conversa.",
      "O que vende mal é tudo o que o cliente vê antes de falar com ele: o Instagram, o site e o orçamento.",
    ],
  },
  {
    titulo: "A Big Idea",
    texto: [
      "Ninguém compra o que não entende.",
      "E hoje o cliente só entende o que ele faz depois de conversar com ele.",
    ],
  },
  {
    titulo: "A promessa",
    texto: [
      "Fazer o cliente chegar já sabendo por que ele, pra ele gastar o tempo atendendo e não convencendo.",
    ],
  },
  {
    titulo: "A narrativa em uma linha",
    texto: [
      "O profissional que é bom no que faz, mas passa o dia tentando convencer quem ainda não sabe disso.",
    ],
  },
];

export const CICLO: string[] = [
  "O cliente olha o Instagram e acha ele parecido com os concorrentes.",
  "Como parece igual, pergunta o preço e pede desconto.",
  "Ele precisa conversar com cada um pra mostrar a diferença.",
  "Isso toma o tempo dele, e ele nunca arruma o que o cliente vê primeiro.",
];

export const MOVIMENTOS: [string, string][] = [
  ["O começo", "Ele abriu o negócio pra fazer uma coisa que sabe fazer bem."],
  ["Deu certo", "Quem é cliente gosta, volta e indica."],
  [
    "O dia a dia",
    "Só que quem ainda não conhece não percebe isso, então ele passa o dia explicando e negociando preço.",
  ],
  [
    "A comparação",
    "Enquanto isso, vê gente que entrega menos cobrando mais, e começa a se perguntar se o problema é ele.",
  ],
  [
    "O cansaço",
    "Os anos passam, ele trabalha mais e fatura o mesmo, e o trabalho que ele gostava vira obrigação.",
  ],
  [
    "O que muda tudo",
    "Pessoalmente ele convence bem. Quem não convence é o Instagram, o site e o orçamento, que é por onde o cliente chega.",
  ],
  [
    "A volta",
    "Quando isso muda, o cliente já chega sabendo por que ele, e ele volta a passar o dia trabalhando no que gosta.",
  ],
];

export const MANIFESTO: string[] = [
  "Você abriu o seu negócio porque era bom numa coisa e queria trabalhar com ela. Estudou, se especializou, e quem é seu cliente sabe disso: volta, indica, fala bem de você.",
  "Só que o seu dia foi mudando. Hoje boa parte dele vai pra responder quem pergunta o preço, explicar por que custa isso, mandar orçamento e esperar resposta. Muitas vezes termina com desconto.",
  "E aí você olha pro lado e vê gente que entrega menos com a agenda cheia, cobrando mais que você. É difícil não pensar que o problema é você.",
  "Mas repara numa coisa: quando o cliente senta pra conversar com você, ele entende. O que ele vê antes disso não mostra nada do que você mostra pessoalmente, seja o Instagram, o site ou o orçamento. Por isso você precisa convencer um por um.",
  "A Legacy existe pra resolver essa parte. A gente organiza o que você faz de diferente e coloca isso em tudo o que o cliente vê antes de falar com você. Assim ele já chega sabendo por que você, e você volta a passar o dia fazendo o trabalho que te fez abrir o negócio.",
];

export const EVIDENCIAS: [string, string, string][] = [
  [
    "O cliente chega sem saber como se vender.",
    'A Maite veio "com a queixa de que falava mas não tinha clareza do que falar, de como vender isso".',
    "Maite [05–06min]",
  ],
  [
    "Excelente, e o mercado não vê.",
    '"A gente precisa garantir que o mercado perceba esse valor."',
    "308Network [07min]",
  ],
  [
    "Quem já comprou ama; quem não conhece não entende.",
    'As mentoradas "amam", e os novos "não entendem a proposta de valor logo de imediato".',
    "Maite [06–07min]",
  ],
  [
    "A marca pode vender no lugar do dono.",
    '"A própria plataforma vira um vendedor seu."',
    "GeriAcademy [17min]",
  ],
  [
    "O cliente chega achando que compra visual.",
    '"Você contratou da gente basicamente a solução de uma identidade visual… Na verdade nós somos uma empresa de estratégia e construção de marca."',
    "GeriAcademy [02min]",
  ],
  [
    "O anúncio atrai um público mais cedo que o ICP.",
    "203 leads; 54% não faturam ou faturam até R$ 6 mil; nenhum ganho registrado.",
    "CRM, 16/11/2026",
  ],
];

export const EM_ABERTO: [string, string][] = [
  [
    "Público prioritário",
    "Especialista ou empresa de serviço perto de R$ 30 mil/mês, e não o pequeno negócio local do anúncio.",
  ],
  ["Preço oficial", "R$ 4.500 ou R$ 5.000, e o que dos cases entra no projeto de entrada."],
  ["Profissão da persona", "Fisioterapeuta, dona de clínica. A alternativa é arquiteta."],
  [
    "Sofisticação",
    "3, mecanismo. É a leitura mais frágil, porque não houve pesquisa de concorrentes.",
  ],
  [
    "Assinatura",
    '"A sua marca vende. Você faz o que ama." A alternativa é a Big Idea: "Ninguém compra o que não entende".',
  ],
];
