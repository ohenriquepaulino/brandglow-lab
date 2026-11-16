import { leadSignal } from "@/lib/lead-signal";
import { GOOGLE_ADS_LEAD } from "@/lib/google-ads";

/**
 * Conversões do navegador para um lead que fatura: Lead da Meta (com o mesmo
 * event_id da Conversions API, para deduplicar), conversão do Google Ads e
 * registration_completed do ChatGPT Ads. Usado pela /obrigado e pela /checkup.
 */
export function dispararConversoesLead(
  eventId: string | null,
  faturamento: string | null,
  telefoneE164: string | null,
) {
  const sinal = leadSignal(faturamento);

  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === "function") {
    fbq("track", "Lead", sinal ?? {}, eventId ? { eventID: eventId } : undefined);
  }

  // Google Ads: o "ev" vai como transaction_id, e o Google descarta a repetição
  // se a página for recarregada. O valor é o mesmo peso por faixa do Lead da
  // Meta; o telefone alimenta as conversões otimizadas.
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag === "function") {
    if (telefoneE164) gtag("set", "user_data", { phone_number: telefoneE164 });
    gtag("event", "conversion", {
      send_to: GOOGLE_ADS_LEAD,
      value: sinal?.value ?? 1,
      currency: "BRL",
      ...(eventId ? { transaction_id: eventId } : {}),
    });
  }

  // ChatGPT Ads: uma conversão por cadastro. O "ev" identifica o envio, então
  // recarregar a página não conta de novo.
  const oaiq = (window as unknown as { oaiq?: (...args: unknown[]) => void }).oaiq;
  const chave = `oaiq-registration:${eventId ?? "sem-ev"}`;
  let jaContou = false;
  try {
    jaContou = !!eventId && sessionStorage.getItem(chave) === "1";
  } catch {
    // sessionStorage bloqueado: conta mesmo assim
  }
  if (typeof oaiq === "function" && !jaContou) {
    oaiq("measure", "registration_completed", { type: "customer_action" });
    try {
      if (eventId) sessionStorage.setItem(chave, "1");
    } catch {
      // idem
    }
  }
}

/** Evento personalizado da Meta (públicos e funil); não entra na otimização de Lead. */
export function eventoMeta(nome: string, dados?: Record<string, unknown>) {
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === "function") fbq("trackCustom", nome, dados ?? {});
}
