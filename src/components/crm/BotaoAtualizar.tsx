import { RefreshCw } from "lucide-react";

/** Recarrega os dados da tela sem recarregar a página do navegador. */
export function BotaoAtualizar({
  onClick,
  carregando,
}: {
  onClick: () => void;
  carregando: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={carregando}
      className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-60"
      style={{ borderColor: "#E0DED9" }}
    >
      <RefreshCw size={13} strokeWidth={2.2} className={carregando ? "animate-spin" : undefined} />
      {carregando ? "Atualizando..." : "Atualizar"}
    </button>
  );
}
