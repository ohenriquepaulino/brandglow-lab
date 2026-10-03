// Telefone/WhatsApp dos formulários. Usado no navegador (campo do formulário)
// e no servidor (validação do cadastro, WhatsApp, Meta).
//
// Brasil: guardamos "(11) 98888-7777" (sem o 55). Outros países: "+351 912345678".
// O "+" na frente é o que diz que o número não é brasileiro.

export type Pais = { iso: string; nome: string; ddi: string; bandeira: string };

export const BRASIL: Pais = { iso: "BR", nome: "Brasil", ddi: "55", bandeira: "🇧🇷" };

export const PAISES: Pais[] = [
  BRASIL,
  { iso: "PT", nome: "Portugal", ddi: "351", bandeira: "🇵🇹" },
  { iso: "US", nome: "Estados Unidos", ddi: "1", bandeira: "🇺🇸" },
  { iso: "CA", nome: "Canadá", ddi: "1", bandeira: "🇨🇦" },
  { iso: "AR", nome: "Argentina", ddi: "54", bandeira: "🇦🇷" },
  { iso: "UY", nome: "Uruguai", ddi: "598", bandeira: "🇺🇾" },
  { iso: "PY", nome: "Paraguai", ddi: "595", bandeira: "🇵🇾" },
  { iso: "CL", nome: "Chile", ddi: "56", bandeira: "🇨🇱" },
  { iso: "CO", nome: "Colômbia", ddi: "57", bandeira: "🇨🇴" },
  { iso: "PE", nome: "Peru", ddi: "51", bandeira: "🇵🇪" },
  { iso: "MX", nome: "México", ddi: "52", bandeira: "🇲🇽" },
  { iso: "ES", nome: "Espanha", ddi: "34", bandeira: "🇪🇸" },
  { iso: "IT", nome: "Itália", ddi: "39", bandeira: "🇮🇹" },
  { iso: "FR", nome: "França", ddi: "33", bandeira: "🇫🇷" },
  { iso: "DE", nome: "Alemanha", ddi: "49", bandeira: "🇩🇪" },
  { iso: "GB", nome: "Reino Unido", ddi: "44", bandeira: "🇬🇧" },
  { iso: "IE", nome: "Irlanda", ddi: "353", bandeira: "🇮🇪" },
  { iso: "CH", nome: "Suíça", ddi: "41", bandeira: "🇨🇭" },
  { iso: "NL", nome: "Holanda", ddi: "31", bandeira: "🇳🇱" },
  { iso: "AO", nome: "Angola", ddi: "244", bandeira: "🇦🇴" },
  { iso: "MZ", nome: "Moçambique", ddi: "258", bandeira: "🇲🇿" },
  { iso: "JP", nome: "Japão", ddi: "81", bandeira: "🇯🇵" },
  { iso: "AU", nome: "Austrália", ddi: "61", bandeira: "🇦🇺" },
  { iso: "AE", nome: "Emirados Árabes", ddi: "971", bandeira: "🇦🇪" },
];

// DDDs que existem (Anatel).
const DDDS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

const so = (s: string) => s.replace(/\D/g, "");

/**
 * Dígitos de um celular brasileiro a partir do que a pessoa digitou ou colou.
 * Tira o que não é DDD + número: "+55", "55" do país (quando sobra número
 * demais) e o "0" de operadora ("011 ...", "0 21 ...").
 * Aceita até 13 dígitos enquanto a pessoa digita, para dar tempo de
 * reconhecer "55 11 9..." e cortar o 55 sozinho.
 */
export function limparBR(raw: string): string {
  let d = so(raw);
  const comMais = /^\s*\+/.test(raw);
  if (comMais && d.startsWith("55")) d = d.slice(2);
  else if (d.length >= 12 && d.startsWith("55")) d = d.slice(2);
  while (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 13);
}

/** "11988887777" -> "(11) 98888-7777" (vai formatando enquanto digita). */
export function mascaraBR(d: string): string {
  if (d.length > 11) return d; // ainda pode ser 55 + DDD: mostra cru até cortar
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** null = celular válido; senão, a mensagem do que está errado. */
export function erroBR(d: string): string | null {
  if (d.length === 0) return "Informe seu WhatsApp com DDD";
  // O erro mais comum: "55" + DDD + número (o país no lugar do DDD).
  if (d.startsWith("55") && d.length >= 11 && d[2] !== "9") {
    return "Parece que você digitou o 55 do país. Digite só o DDD + número";
  }
  if (d.length > 11) return "Número longo demais. Digite só o DDD + número";
  if (d.length < 2 || !DDDS.has(Number(d.slice(0, 2)))) return "DDD inválido";
  if (d.length === 10) return "Falta o 9 do celular: DDD + 9 + 8 dígitos";
  if (d.length < 11) return "Número incompleto: DDD + 9 + 8 dígitos";
  if (d[2] !== "9") return "Celular começa com 9 depois do DDD";
  return null;
}

/** Número estrangeiro (só os dígitos depois do código do país). */
export function erroExterior(d: string): string | null {
  if (d.length < 6) return "Número incompleto";
  if (d.length > 14) return "Número longo demais";
  return null;
}

/** O que vai para o cadastro: "(11) 98888-7777" ou "+351 912345678". */
export function telefoneParaEnvio(pais: Pais, digitos: string): string {
  return pais.iso === "BR" ? mascaraBR(digitos) : `+${pais.ddi} ${digitos}`;
}

/** Para mostrar na confirmação: "+55 (11) 98888-7777". */
export function telefoneLegivel(pais: Pais, digitos: string): string {
  return pais.iso === "BR" ? `+55 ${mascaraBR(digitos)}` : `+${pais.ddi} ${digitos}`;
}

/** Valida um telefone já no formato do cadastro (lado do servidor). */
export function telefoneValido(valor: string): boolean {
  const v = valor.trim();
  if (v.startsWith("+")) {
    const d = so(v);
    return !d.startsWith("55") && d.length >= 7 && d.length <= 17;
  }
  return erroBR(so(v)) === null;
}

/**
 * Número completo com país, só dígitos ("5511988887777"), para WhatsApp,
 * wa.me e Meta. "+" na frente = estrangeiro, já vem com o código do país.
 * Sem "+": brasileiro; o 55 só não é acrescentado quando o número já tem
 * 12-13 dígitos começando com 55 (cadastros antigos).
 */
export function telefoneInternacional(valor: string): string {
  const d = so(valor);
  if (valor.trim().startsWith("+")) return d;
  if (d.length >= 12 && d.startsWith("55")) return d;
  return `55${d}`;
}
