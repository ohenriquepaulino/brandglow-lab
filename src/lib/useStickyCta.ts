import { useEffect, useState } from "react";

/**
 * Botão fixo do celular nas landing pages: aparece só quando nenhum dos
 * elementos de `seletor` (primeira dobra, formulário final, rodapé) está na tela.
 */
export function useStickyCta(seletor: string) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const alvos = document.querySelectorAll(seletor);
    const visiveis = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? visiveis.add(e.target) : visiveis.delete(e.target)));
      setShow(visiveis.size === 0);
    });
    alvos.forEach((a) => io.observe(a));
    return () => io.disconnect();
  }, [seletor]);
  return show;
}
