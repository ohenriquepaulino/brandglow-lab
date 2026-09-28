// Texto da política de privacidade. Usado na página /privacidade e na janela
// que abre nas landing pages (lá não há links que tirem a pessoa da página).
export const PRIVACIDADE_ATUALIZADA = "Atualizada em setembro de 2026.";

export const PRIVACIDADE_SECOES: { titulo: string; texto: string[] }[] = [
  {
    titulo: "Quais dados coletamos",
    texto: [
      "Quando você preenche um formulário do site, recebemos o que você informa: nome, WhatsApp, @ do Instagram, faixa de faturamento, área de atuação e, quando for o caso, o momento do seu negócio.",
      "Também registramos de qual página e de qual campanha você chegou (parâmetros UTM), para sabermos quais anúncios funcionam.",
    ],
  },
  {
    titulo: "Para que usamos",
    texto: [
      "Para entrar em contato com você pelo WhatsApp, entender o seu negócio e apresentar nossos serviços de estratégia de marca e identidade visual.",
      "Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing.",
    ],
  },
  {
    titulo: "Ferramentas que usamos",
    texto: [
      "Meta Pixel e API de Conversões (Facebook e Instagram): medem o resultado dos nossos anúncios. Os dados de contato vão criptografados.",
      "Microsoft Clarity: mostra, de forma agregada, como as pessoas navegam no site, para melhorarmos a experiência.",
      "Os dados ficam guardados em servidores seguros, com acesso restrito à nossa equipe.",
    ],
  },
  {
    titulo: "Por quanto tempo guardamos",
    texto: [
      "Enquanto existir uma conversa ou relação comercial com você, ou até você pedir a exclusão.",
    ],
  },
  {
    titulo: "Seus direitos",
    texto: [
      "Pela Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode pedir a qualquer momento para ver, corrigir ou excluir os seus dados, ou deixar de receber nossas mensagens.",
      "Basta responder a nossa mensagem no WhatsApp ou falar com a gente pelo Instagram @legacybc.com.br.",
    ],
  },
];
