import { useEffect, useState } from "react";
import { apiListHistorico, apiUpdateAnotacoes } from "@/lib/crm-api";
import { apiWhatsAppEnviosDoLead, type WhatsAppEnvio } from "@/lib/whatsapp-api";
import {
  TODAS_COLUNAS,
  formatDateTime,
  instagramHandle,
  instagramHref,
  isSemFaturamento,
  whatsappHref,
  type Lead,
  type Movimentacao,
} from "@/lib/crm-auth";

export function LeadPanel({
  lead,
  onClose,
  onUpdated,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdated: (lead: Lead) => void;
}) {
  const [anotacoes, setAnotacoes] = useState(lead.anotacoes ?? "");
  const [historico, setHistorico] = useState<Movimentacao[]>([]);
  const [envios, setEnvios] = useState<WhatsAppEnvio[]>([]);

  useEffect(() => {
    setAnotacoes(lead.anotacoes ?? "");
    apiListHistorico(lead.id)
      .then((data) => setHistorico(data))
      .catch((err) => console.error(err));
  }, [lead.id, lead.anotacoes]);

  useEffect(() => {
    apiWhatsAppEnviosDoLead(lead.id)
      .then((data) => setEnvios(data))
      .catch((err) => console.error(err));
  }, [lead.id]);

  async function saveAnotacoes() {
    if ((lead.anotacoes ?? "") === anotacoes) return;
    try {
      const data = await apiUpdateAnotacoes(lead.id, anotacoes);
      if (data) onUpdated(data);
    } catch (err) {
      console.error(err);
    }
  }

  const colunaLabel = (id: string) => TODAS_COLUNAS.find((c) => c.id === id)?.label ?? id;

  const utms = [
    ["utm_source", lead.utm_source],
    ["utm_medium", lead.utm_medium],
    ["utm_campaign", lead.utm_campaign],
    ["utm_content", lead.utm_content],
    ["utm_term", lead.utm_term],
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <button type="button" aria-label="Fechar" onClick={onClose} className="flex-1 bg-black/30" />
      <aside className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Lead
            </p>
            <h2 className="mt-1 text-xl font-semibold text-neutral-900">{lead.nome}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-neutral-500 hover:bg-neutral-100"
            aria-label="Fechar painel"
          >
            ✕
          </button>
        </div>

        <dl className="mt-6 space-y-4 text-sm">
          <Row label="WhatsApp">
            <div className="flex items-center gap-2">
              <span>{lead.whatsapp}</span>
              <a
                href={whatsappHref(lead.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-[#25D366] hover:bg-neutral-50"
                style={{ borderColor: "#E0DED9" }}
              >
                Abrir
              </a>
            </div>
            {envios.map((e) => (
              <p
                key={e.id}
                className={`mt-1 text-[11px] ${ENVIO_LABEL[e.status].cor}`}
                title={e.erro ?? undefined}
              >
                {ENVIO_LABEL[e.status].texto} · {formatDateTime(e.enviar_em)}
              </p>
            ))}
          </Row>
          {lead.instagram?.trim() && (
            <Row label="Instagram">
              <a
                href={instagramHref(lead.instagram)}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-900 hover:underline"
              >
                @{instagramHandle(lead.instagram)}
              </a>
            </Row>
          )}
          <Row label="Faturamento">
            {isSemFaturamento(lead) ? (
              <span className="inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                {lead.faturamento}
              </span>
            ) : (
              lead.faturamento
            )}
          </Row>
          {lead.profissao?.trim() && <Row label="Área de atuação">{lead.profissao}</Row>}

          <Row label="Entrada">{formatDateTime(lead.criado_em)}</Row>
        </dl>

        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            UTMs
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {utms.map(([k, v]) => (
              <div key={k} className="rounded-md border p-2" style={{ borderColor: "#E0DED9" }}>
                <p className="text-[10px] uppercase tracking-wide text-neutral-500">{k}</p>
                <p className="mt-0.5 text-neutral-800">{v || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Anotações
          </label>
          <textarea
            value={anotacoes}
            onChange={(e) => setAnotacoes(e.target.value)}
            onBlur={saveAnotacoes}
            rows={5}
            className="mt-2 w-full rounded-md border bg-white p-3 text-sm outline-none focus:border-neutral-900"
            style={{ borderColor: "#E0DED9" }}
            placeholder="Adicione observações sobre este lead..."
          />
          <p className="mt-1 text-[11px] text-neutral-500">
            Salva automaticamente ao sair do campo.
          </p>
        </div>

        <div className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Histórico de movimentações
          </p>
          {historico.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">Sem movimentações.</p>
          ) : (
            <ul className="mt-2 space-y-2 text-sm">
              {historico.map((h) => (
                <li key={h.id} className="rounded-md border p-3" style={{ borderColor: "#E0DED9" }}>
                  <p className="text-neutral-800">
                    {colunaLabel(h.coluna_origem)} → {colunaLabel(h.coluna_destino)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-500">
                    {formatDateTime(h.movido_em)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

const ENVIO_LABEL: Record<WhatsAppEnvio["status"], { texto: string; cor: string }> = {
  pendente: { texto: "⏱ Mensagem automática agendada", cor: "text-amber-600" },
  enviando: { texto: "⏱ Mensagem automática enviando", cor: "text-amber-600" },
  enviado: { texto: "✓ Mensagem automática enviada", cor: "text-green-700" },
  erro: { texto: "✕ Mensagem automática falhou", cor: "text-red-600" },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</dt>
      <dd className="text-neutral-900">{children}</dd>
    </div>
  );
}
