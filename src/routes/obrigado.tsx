import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { captureUtmsFromUrl } from "@/lib/utm";


export const Route = createFileRoute("/obrigado")({
  head: () => ({
    meta: [
      { title: "Obrigado — Legacy BrandCo." },
      {
        name: "description",
        content:
          "Informações recebidas com sucesso. Em breve entraremos em contato.",
      },
      { property: "og:title", content: "Obrigado — Legacy BrandCo." },
      {
        property: "og:description",
        content:
          "Informações recebidas com sucesso. Em breve entraremos em contato.",
      },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: ObrigadoPage,
});

function ObrigadoPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <div className="fade-up max-w-xl">
        <h1 className="text-[32px] leading-[1.1] tracking-[-0.04em] text-ink sm:text-[44px] md:text-[52px]">
          Informações recebidas com sucesso.
        </h1>

        <p className="mt-6 text-[16px] leading-[1.6] text-ink/70 md:text-[17px]">
          Aguarde nosso contato para entender como podemos criar a identidade
          visual da sua marca.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <a
            href="https://www.instagram.com/legacybc.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-orange-brand px-7 py-3.5 text-[15px] font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            Acompanhe nosso Instagram — @legacybc.com.br
          </a>

          <Link
            to="/"
            className="text-[14px] font-medium text-ink/60 underline-offset-4 transition-colors hover:text-ink"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </main>
  );
}
