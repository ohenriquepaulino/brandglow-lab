import { useCallback, useState } from "react";

/**
 * Gera o PDF pelo diálogo de impressão do navegador ("Salvar como PDF").
 * Mantém texto nítido e selecionável, sem bibliotecas extras.
 * Antes de imprimir: abre todos os <details>, força o carregamento das imagens lazy
 * e troca o título da aba, que vira o nome sugerido do arquivo.
 */
export function usePrintPdf(getRoot: () => HTMLElement | null, fileName: string) {
  const [preparing, setPreparing] = useState(false);

  const print = useCallback(async () => {
    const root = getRoot();
    if (!root || preparing) return;
    setPreparing(true);

    const details = [...root.querySelectorAll("details")];
    const wasOpen = details.map((d) => d.open);
    details.forEach((d) => (d.open = true));

    const imgs = [...root.querySelectorAll("img")];
    imgs.forEach((img) => (img.loading = "eager"));
    const loaded = Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((res) => {
              img.addEventListener("load", () => res(), { once: true });
              img.addEventListener("error", () => res(), { once: true });
            }),
      ),
    );
    // Não trava para sempre se alguma imagem externa demorar.
    await Promise.race([loaded, new Promise((r) => setTimeout(r, 8000))]);

    const prevTitle = document.title;
    document.title = fileName;
    root.classList.add("lbc-printing");

    const restore = () => {
      document.title = prevTitle;
      root.classList.remove("lbc-printing");
      details.forEach((d, i) => (d.open = wasOpen[i]));
      window.removeEventListener("afterprint", restore);
      setPreparing(false);
    };
    window.addEventListener("afterprint", restore);
    // Alguns navegadores móveis não disparam afterprint.
    setTimeout(() => {
      if (root.classList.contains("lbc-printing")) restore();
    }, 60000);

    requestAnimationFrame(() => window.print());
  }, [getRoot, fileName, preparing]);

  return { print, preparing };
}
