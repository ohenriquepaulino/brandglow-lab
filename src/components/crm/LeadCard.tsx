import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  formatDate,
  instagramHandle,
  instagramHref,
  isSemFaturamento,
  whatsappHref,
  type Lead,
} from "@/lib/crm-auth";

export function LeadCard({
  lead,
  onOpen,
  onDelete,
}: {
  lead: Lead;
  onOpen: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id });

  const semFaturamento = isSemFaturamento(lead);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderColor: "#E0DED9" }}
      className="group relative cursor-grab overflow-hidden rounded-lg border bg-white p-3.5 shadow-sm active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      {semFaturamento && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-1.5 bg-red-600"
        />
      )}
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          if (confirm(`Excluir o lead "${lead.nome}"? Esta ação não pode ser desfeita.`)) {
            onDelete(lead);
          }
        }}
        aria-label="Excluir lead"
        className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-red-600 group-hover:flex"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => onOpen(lead)}
        className="w-full pr-6 text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-neutral-900">{lead.nome}</p>
        </div>
        {lead.profissao?.trim() && (
          <p className="mt-1 text-xs text-neutral-500">{lead.profissao}</p>
        )}

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span
            className={
              semFaturamento
                ? "inline-flex items-center rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white"
                : "inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700"
            }
          >
            {lead.faturamento}
          </span>
          {lead.utm_source && (
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500"
              style={{ borderColor: "#E0DED9" }}>
              {lead.utm_source}
            </span>
          )}
        </div>
      </button>

      {lead.instagram?.trim() && (
        <div className="mt-3 flex items-center gap-2 text-xs text-neutral-700">
          <a
            href={instagramHref(lead.instagram)}
            target="_blank"
            rel="noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-neutral-900 hover:underline"
          >
            @{instagramHandle(lead.instagram)}
          </a>
        </div>
      )}

      <div className="mt-1.5 flex items-center justify-between text-xs text-neutral-600">
        <span>{lead.whatsapp}</span>
        <a
          href={whatsappHref(lead.whatsapp)}
          target="_blank"
          rel="noreferrer"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          aria-label="Abrir WhatsApp"
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#25D366] hover:bg-neutral-100"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.27-1.38a9.9 9.9 0 0 0 4.72 1.2h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.91-7.01ZM12.05 20.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.13.82.83-3.05-.2-.31a8.21 8.21 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 5.83 2.42 8.2 8.2 0 0 1 2.42 5.83c0 4.55-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.46-.72-1.69-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.79.97-.15.17-.29.18-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.22-1.46-1.37-1.7-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.57.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.23-.17-.48-.29Z" />
          </svg>
        </a>
      </div>

      <p className="mt-2 text-[10px] uppercase tracking-wide text-neutral-400">
        {formatDate(lead.criado_em)}
      </p>
    </div>
  );
}
