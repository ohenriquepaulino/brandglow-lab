import { useEffect, useState } from "react";

/**
 * Botão fixo do celular nas landing pages: aparece só quando nenhum dos
 * elementos de `seletor` (primeira dobra com o formulário, formulário final,
 * rodapé) está na tela, e some enquanto a pessoa preenche qualquer campo.
 *
 * Recalcula a cada rolagem, mudança de tamanho e abertura/fechamento do
 * teclado (visualViewport). Antes era um IntersectionObserver, que só avisa
 * quando algo cruza a borda: no celular, com o teclado abrindo e fechando,
 * o botão chegou a aparecer por cima do formulário do topo, a pessoa tocou
 * nele achando que era um campo e foi parar no formulário do fim (Clarity).
 */
export function useStickyCta(seletor: string) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;

    const editando = () => {
      const el = document.activeElement;
      return !!el && el.matches("input, select, textarea, [contenteditable='true']");
    };

    const calcular = () => {
      raf = 0;
      if (editando()) {
        setShow(false);
        return;
      }
      // Área que a pessoa vê de fato (sem o teclado, no celular).
      const vv = window.visualViewport;
      const topo = vv ? vv.offsetTop : 0;
      const base = topo + (vv ? vv.height : window.innerHeight);
      const algumVisivel = Array.from(document.querySelectorAll(seletor)).some((el) => {
        const r = el.getBoundingClientRect();
        return r.height > 0 && r.bottom > topo && r.top < base;
      });
      setShow(!algumVisivel);
    };

    const agendar = () => {
      if (!raf) raf = requestAnimationFrame(calcular);
    };
    // Ao sair de um campo, o foco passa pelo body antes do próximo campo:
    // espera um instante para não piscar o botão entre um campo e outro.
    const aoSairDoCampo = () => window.setTimeout(agendar, 150);

    calcular();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    window.visualViewport?.addEventListener("resize", agendar);
    window.visualViewport?.addEventListener("scroll", agendar);
    document.addEventListener("focusin", agendar);
    document.addEventListener("focusout", aoSairDoCampo);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      window.visualViewport?.removeEventListener("resize", agendar);
      window.visualViewport?.removeEventListener("scroll", agendar);
      document.removeEventListener("focusin", agendar);
      document.removeEventListener("focusout", aoSairDoCampo);
    };
  }, [seletor]);

  return show;
}
