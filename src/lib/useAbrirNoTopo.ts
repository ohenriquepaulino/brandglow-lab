import { useEffect } from "react";

// Páginas de anúncio sempre abrem no topo. No navegador do Instagram (iOS) a
// página voltava rolada até o formulário, herdando a posição de uma visita
// anterior. Sem #âncora na URL, desliga a restauração de rolagem e volta ao
// topo na montagem e no load, mas só enquanto a pessoa não mexeu na tela.
export function useAbrirNoTopo() {
  useEffect(() => {
    if (window.location.hash) return;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    let mexeu = false;
    const marcar = () => {
      mexeu = true;
    };
    const topo = () => {
      if (!mexeu) window.scrollTo(0, 0);
    };
    const eventos = ["touchstart", "wheel", "keydown", "mousedown"] as const;
    eventos.forEach((e) => window.addEventListener(e, marcar, { passive: true, once: true }));

    topo();
    requestAnimationFrame(topo);
    window.addEventListener("load", topo, { once: true });
    window.addEventListener("pageshow", topo);
    const t = window.setTimeout(topo, 1500);

    return () => {
      eventos.forEach((e) => window.removeEventListener(e, marcar));
      window.removeEventListener("load", topo);
      window.removeEventListener("pageshow", topo);
      window.clearTimeout(t);
    };
  }, []);
}
