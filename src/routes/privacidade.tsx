import { createFileRoute, Link } from "@tanstack/react-router";
import { PRIVACIDADE_ATUALIZADA, PRIVACIDADE_SECOES } from "@/lib/privacidade";

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
        <p className="mt-4 text-[15px] text-ink/60">{PRIVACIDADE_ATUALIZADA}</p>
        {PRIVACIDADE_SECOES.map((s) => (
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
