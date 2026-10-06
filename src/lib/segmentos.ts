// Segmento é texto livre no formulário ("moda", "Moda fitness", "roupas"...).
// Para o dashboard, agrupa por palavra-chave. A primeira regra que casa vence;
// o que não casa com nenhuma fica em "Outros".

const GRUPOS: { grupo: string; termos: string[] }[] = [
  {
    grupo: "Moda e acessórios",
    termos: ["moda", "roupa", "confec", "brech", "ateli", "acessór", "acessor", "óculos", "oculos", "bolsa", "costura"],
  },
  {
    grupo: "Beleza e estética",
    termos: ["estétic", "estetic", "beleza", "cabele", "barbear", "manicure", "unha", "tatua", "perfum", "maquia", "sobrancelha"],
  },
  {
    grupo: "Alimentação",
    termos: ["aliment", "confeit", "bar", "açaí", "acai", "hamburg", "lanch", "salg", "café", "cafe", "comida", "panifica", "chef", "restaurante", "doce", "pizz"],
  },
  {
    grupo: "Saúde e bem-estar",
    termos: ["saúde", "saude", "nutri", "fisio", "fitness", "crossfit", "academia", "jiu", "psico", "terap", "odonto", "médic", "medic", "esporte"],
  },
  {
    grupo: "Construção e casa",
    termos: ["constru", "engenh", "arquitet", "marcenar", "móve", "move", "esquadri", "vidra", "elétric", "eletric", "pintor", "decora", "metalúrg", "metalurg", "imobili"],
  },
  { grupo: "Eventos e cultura", termos: ["evento", "teatro", "cultur", "arte", "música", "musica"] },
  {
    grupo: "Serviços profissionais",
    termos: ["advoca", "jurídic", "juridic", "contab", "contador", "financ", "consórcio", "consorcio", "consult", "design", "gráfica", "grafica", "marketing", "educa"],
  },
  { grupo: "Agro", termos: ["agro", "agríc", "agric", "drone"] },
  { grupo: "Pet", termos: ["pet", "banho e tosa", "veterin"] },
];

function semAcento(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function grupoDoSegmento(segmento: string | null | undefined): string {
  const s = semAcento((segmento ?? "").toLowerCase().trim());
  if (!s) return "Não informado";
  for (const { grupo, termos } of GRUPOS) {
    if (termos.some((t) => new RegExp(`\\b${semAcento(t)}`).test(s))) return grupo;
  }
  return "Outros";
}
