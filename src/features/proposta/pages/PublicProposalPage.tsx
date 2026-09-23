import { useEffect, useState } from "react";
import ProposalView from "../ProposalView";
import { getPublicProposal } from "../api";
import type { Proposal } from "../types";
import { BRAND } from "../defaults";

/**
 * Página pública: /p/:slug
 * - Lê pelo server route /api/public/proposta (só os campos públicos).
 * - ?pdf=1 abre direto o diálogo de salvar PDF.
 * - Marca a página como noindex.
 */
export default function PublicProposalPage({ slug }: { slug: string }) {
  const [state, setState] = useState<{
    status: "loading" | "ok" | "notfound" | "error";
    data?: Proposal;
  }>({ status: "loading" });
  const autoPrint =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("pdf") === "1";

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let alive = true;
    setState({ status: "loading" });
    getPublicProposal(slug)
      .then((data) => {
        if (!alive) return;
        if (!data) return setState({ status: "notfound" });
        document.title = `${data.client_name || "Proposta"} | Legacy BrandCo.`;
        setState({ status: "ok", data });
      })
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (state.status === "ok" && state.data)
    return <ProposalView proposal={state.data} autoPrint={autoPrint} />;

  return (
    <div
      className="lbc"
      style={{
        minHeight: "100svh",
        display: "grid",
        placeItems: "center",
        background: "#b8ff80",
        padding: 24,
        fontSize: 17,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <img
          src={BRAND.logoDark}
          alt="Legacy BrandCo."
          style={{ width: 220, height: "auto", margin: "0 auto 28px" }}
        />
        {state.status === "loading" && <p>Carregando a proposta...</p>}
        {state.status === "notfound" && (
          <>
            <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              Proposta não encontrada
            </p>
            <p>Confira o link recebido ou fale com a gente para receber uma nova versão.</p>
          </>
        )}
        {state.status === "error" && (
          <>
            <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              Não conseguimos abrir a proposta
            </p>
            <p>Verifique sua conexão e tente de novo em instantes.</p>
          </>
        )}
      </div>
    </div>
  );
}
