/**
 * Esconde o selo "Edit with Lovable" (<aside id="lovable-badge">, injetado na publicação).
 * Vale só enquanto o componente está na tela, igual ao /ads.
 */
export function HideLovableBadge() {
  return <style>{`#lovable-badge { display: none !important; }`}</style>;
}
