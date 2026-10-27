// Conteúdo da /central: o método da Legacy e a linha editorial.
// É a página de referência de tudo o que a gente produz. Para registrar um
// conteúdo novo, basta acrescentar um item em CONTEUDOS.

export const CENTRAL_ATUALIZADA = "27 de outubro de 2026";

export const BIG_IDEA = "Ninguém compra o que não entende.";

export const ETAPAS = [
  {
    nome: "Território",
    pergunta: "Onde você está?",
    texto:
      "Mercado, concorrentes e o que o público quer hoje, com dados. A regra: a fraqueza do mercado é a nossa fortaleza. Daqui sai o contraposicionamento, aquilo contra o que a marca se coloca. Na 308, o corretor que entrega panfleto na porta da padaria. Na Joana, o terrorismo financeiro. Na Maite, mais uma mentoria.",
  },
  {
    nome: "Abismo da marca",
    pergunta: "O que o mercado entende de você?",
    texto:
      "A distância entre o que a empresa acha que comunica e o que comunica de verdade. É o diagnóstico do projeto.",
  },
  {
    nome: "Público",
    pergunta: "Para quem você vende?",
    texto:
      "Os clientes viram personagens com nome, idade, objetivos, medos e necessidades: Rodrigo, Mariana e Lucas na 308; Lucas e Raísa, Luísa e Flávia na Joana. Para cada um, como a marca se posiciona.",
  },
  {
    nome: "Os 3 pilares",
    pergunta: "O que você é e o que você diz?",
    texto: "Posicionamento único, mensagem clara e comunidade ou movimento.",
  },
  {
    nome: "Marca como negócio",
    pergunta: "Como isso vira dinheiro?",
    texto:
      "Esteira de produtos, oferta nova, linhas de receita e valor da empresa. É o que separa a Legacy de um estúdio de design.",
  },
  {
    nome: "Plano de execução",
    pergunta: "O que fazer amanhã?",
    texto: "Linha editorial, tráfego para posicionamento e uma lista de tarefas de curto e médio prazo.",
  },
  {
    nome: "Tradução visual",
    pergunta: "Como isso aparece?",
    texto:
      "Tipografia, cores escolhidas contra o mercado, símbolo com significado, direção de foto, aplicações e experiência. Na 308, a Apple do mercado imobiliário, em preto no branco. Na Joana, um asterisco que representa os pilares do método dela.",
  },
] as const;

export const PILARES = [
  {
    nome: "Posicionamento único",
    resumo: "O que só você é.",
    itens: [
      "O que a empresa faz de único",
      "Como quer ser percebida",
      "No que não acredita: o inimigo, o contraposicionamento",
      "Quem é o público",
      "Qual é a proposta de valor",
    ],
    nota: "Aqui nascem as bandeiras, as causas que a marca defende em público, e o superpoder, aquilo que só ela faz pelo cliente. O superpoder da Joana é conectar a pessoa ao próprio futuro. O posicionamento ecoa igual no feed, no story, no atendimento e na proposta.",
  },
  {
    nome: "Mensagem clara",
    resumo: "O que você diz e como diz.",
    itens: [
      "Frase-base ou manifesto: a ideia que tudo repete",
      "Tom de voz, explicado na prática",
      "Palavras-chave: o vocabulário da marca",
      "Diga × não diga, com frases lado a lado",
      "Objeções ressignificadas: para \"é caro\", \"quanto custa continuar perdido?\"",
      "Guias de bio, destaques e linha editorial",
    ],
    nota: "Na 308, em vez de \"temos imóveis exclusivos esperando por você\", a marca diz \"o imóvel não é só um espaço, é um ativo que deve crescer com você\".",
  },
  {
    nome: "Comunidade ou movimento",
    resumo: "Quem espalha a mensagem.",
    itens: [
      "Comunidade, quando a marca reúne pessoas com o mesmo estilo de vida: o clube de corrida da Joana",
      "Movimento, quando levanta uma causa: \"Geri Sim\" na GeriAcademy, a carta queimada na imersão da Maite",
      "Top of mind, quando a base ainda é pequena: marca pessoal do dono e clube de clientes, como na 308",
    ],
    nota: "É o único pilar que muda de forma conforme o cliente.",
  },
] as const;

export const NEGOCIO = [
  {
    oque: "Esteira de produtos",
    resolve: "Empresa com um produto só, ou presa a vender o próprio tempo",
    exemplo: "GeriAcademy: o concorrente tinha esteira, ela não. O projeto desenhou do curso de entrada à plataforma completa.",
  },
  {
    oque: "Oferta nova com projeção",
    resolve: "Saber o que lançar e quanto pode render",
    exemplo: "Joana: imersão de 3 dias a cerca de R$ 1.997, 8 turmas no ano, perto de R$ 480 mil, como entrada para a consultoria.",
  },
  {
    oque: "Linhas de receita",
    resolve: "Depender de uma fonte só",
    exemplo: "Joanaverso: eventos, ferramenta de IA, cursos, conteúdo, mídia, palestras, mentoria e clube.",
  },
  {
    oque: "Separar a pessoa da empresa",
    resolve: "Negócio que só existe enquanto o dono aparece",
    exemplo: "Joana Ulmer Co: o \"Co\" desvincula a empresa da pessoa física e ajuda em investimento e venda.",
  },
  {
    oque: "Valor da empresa",
    resolve: "Saber quanto a marca vale no futuro",
    exemplo: "GeriAcademy: projeção de receita e de valor em 3 anos.",
  },
  {
    oque: "IA treinada com o conteúdo do cliente",
    resolve: "Escalar o conhecimento do especialista",
    exemplo: "Geria, alimentada com as lives e a estratégia da GeriAcademy.",
  },
] as const;

export const ENTREGAVEIS = [
  "Apresentação-guia de 70 a 80 páginas, com todas as decisões e o motivo de cada uma",
  "Relatório de marca: as decisões num documento para consultar, imprimir ou virar livro",
  "Identidade visual completa: logotipo e versões, cores, tipografia, padrões e direção de foto",
  "Guias práticos: bio, foto e destaques do Instagram, e linha editorial",
  "Plano de execução com tarefas de curto e médio prazo",
  "Aplicações: site, Instagram, eventos, papelaria, ambiente e itens do dia a dia",
  "Experiência do cliente, quando faz sentido: kit de boas-vindas, carta para abrir em um ano",
  "Vídeo de lançamento da marca nova",
] as const;

export type Elemento = "Abismo" | "Pilar" | "Tradução";

export const ELEMENTOS = [
  {
    nome: "O Abismo" as const,
    pensa: "Isso acontece comigo.",
    origem: "Abismo da marca e território",
    fala: "Uma cena da semana em que a falta de clareza custou uma venda.",
    formato: "Cena + premissas, sem citar marca.",
    legacy: "Só na legenda ou no último slide.",
    temas: [
      "\"O que você faz?\", num evento",
      "A social media pergunta qual é o diferencial",
      "O gestor de tráfego pergunta para quem é o anúncio",
      "O vendedor novo começa segunda e ninguém escreveu o que ele diz",
      "O cliente pergunta \"qual a diferença de vocês?\"",
      "Cada proposta sai diferente porque o pacote é montado na hora",
      "O site fica pronto e ninguém sabe o que escrever na primeira frase",
    ],
  },
  {
    nome: "O Pilar" as const,
    pensa: "Então o problema não era o que eu achava.",
    origem: "Os 3 pilares e marca como negócio",
    fala: "Uma peça do método, explicada com um exemplo.",
    formato: "Diga × não diga, antes × depois de uma frase, um teste.",
    legacy: "No meio, como quem explica.",
    temas: [
      "Contraposicionamento: no que a sua empresa não acredita",
      "Público em narrativa: o cliente com nome, medo e objetivo",
      "Mensagem: diga × não diga no seu mercado",
      "Objeção ressignificada: \"quanto custa continuar perdido?\"",
      "Marca como negócio: esteira, oferta e o que a empresa vale",
    ],
  },
  {
    nome: "A Tradução" as const,
    pensa: "Eles sabem fazer isso, e não é gosto.",
    origem: "Os cases, da estratégia ao visual",
    fala: "A decisão por trás de um projeto real.",
    formato: "Do contraposicionamento ao visual, em sequência.",
    legacy: "No centro: é o trabalho dela.",
    temas: [
      "308Network: contra o corretor de panfleto, a Apple do mercado imobiliário, em preto no branco",
      "Joana Ulmer Co: contra o terrorismo financeiro, o asterisco dos pilares e o \"Co\"",
      "GeriAcademy: de um curso solto a uma esteira, com o movimento Geri Sim",
      "Maite: contra mais uma mentoria, o ritual da carta queimada",
    ],
  },
] as const;

export const REGRAS = [
  ["Premissas, não promessas.", "Uma sequência de fatos que o empresário aceita na hora, até ele chegar sozinho à conclusão. Nada de \"sua empresa vai vender mais\"."],
  ["Abrir sem pergunta e sem ordem.", "A primeira frase afirma uma cena ou um fato. \"Você já passou por isso?\" e \"Descubra como\" ficam de fora."],
  ["Uma ideia por post.", "E toda ideia sustenta a mesma big idea: ninguém compra o que não entende."],
  ["Cena concreta, desta semana.", "A urgência oculta é um momento em que alguém espera uma resposta, não uma dor genérica."],
  ["Usar os nomes do método.", "Abismo da marca, contraposicionamento, bandeira, pilar, marca como negócio. Repetir até o público usar."],
  ["Falar de clareza e negócio, não de design.", "O visual entra como tradução de uma decisão, nunca como assunto principal."],
  ["Conversa leve.", "Frases curtas, texto corrido com conectivos, sem emoji e sem jargão (\"autoridade\", \"percepção de valor\", \"DNA da marca\")."],
  ["A Legacy e o convite aparecem só no fim.", ""],
  ["Só fatos reais dos cases.", "E nenhuma menção à Ciena."],
] as const;

export const EXEMPLOS = [
  {
    elemento: "O Abismo",
    titulo: "A primeira pergunta da social media",
    linhas: [
      ["Você contratou alguém para cuidar do Instagram.", "Na primeira reunião, ela perguntou qual é o seu diferencial.", "Você respondeu: qualidade e atendimento."],
      ["É a mesma resposta que os seus três concorrentes deram para as social medias deles.", "Ela vai postar exatamente o que você disse.", "E o seu perfil vai continuar parecido com o deles."],
      ["O problema nunca foi quem posta. É o que ninguém decidiu antes."],
    ],
  },
  {
    elemento: "O Pilar",
    titulo: "O contraposicionamento",
    linhas: [
      ["Toda empresa sabe dizer no que acredita.", "Quase nenhuma sabe dizer no que não acredita."],
      ["A 308Network não acredita no corretor que vende o imóvel e some depois da assinatura.", "Essa frase diz mais sobre ela do que qualquer lista de qualidades."],
      ["Quando a empresa escolhe contra o que está, o cliente entende de que lado ela está."],
    ],
  },
  {
    elemento: "A Tradução",
    titulo: "A 308Network",
    linhas: [
      ["O mercado imobiliário inteiro se parece.", "A 308 decidiu se colocar contra o corretor de panfleto e ao lado do investidor que quer estratégia."],
      ["Estratégia pede clareza. Clareza é preto no branco.", "Por isso a marca é preta e branca, com um símbolo que se expande: base sólida e crescimento."],
      ["Ninguém precisa explicar isso ao cliente. Ele sente antes de ler."],
    ],
  },
] as const;

// Tudo o que for produzido entra aqui, do mais novo para o mais antigo.
export const CONTEUDOS: {
  data: string;
  elemento: Elemento;
  titulo: string;
  formato: string;
  status: "Ideia" | "Roteiro" | "Produzindo" | "Publicado";
  link?: string;
}[] = [];
