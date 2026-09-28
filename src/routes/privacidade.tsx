import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — Legacy BrandCo." },
      {
        name: "description",
        content: "Como a Legacy BrandCo. coleta, usa e protege os dados enviados pelo site.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: PrivacidadePage,
});

const SECOES: { titulo: string; texto: string[] }[] = [
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

function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 md:py-24">
      <article className="mx-auto max-w-2xl text-ink">
        <Link to="/" className="text-[14px] font-medium text-ink/60 hover:text-ink">
          ← Legacy BrandCo.
        </Link>
        <h1 className="mt-8 text-[32px] leading-[1.1] tracking-[-0.04em] md:text-[44px]">
          Política de privacidade
        </h1>
        <p className="mt-4 text-[15px] text-ink/60">Atualizada em setembro de 2026.</p>
        {SECOES.map((s) => (
          <section key={s.titulo} className="mt-10">
            <h2 className="text-[20px] font-semibold tracking-[-0.02em]">{s.titulo}</h2>
            {s.texto.map((t) => (
              <p key={t} className="mt-3 text-[16px] leading-[1.65] text-ink/75">
                {t}
              </p>
            ))}
          </section>
        ))}
      </article>
    </main>
  );
}
