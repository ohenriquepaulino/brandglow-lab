import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, FileText, MessageCircle, StickyNote, Trash2 } from "lucide-react";
import { formatDateTime, whatsappHref } from "@/lib/crm-auth";
import type { Task } from "@/lib/tasks-api";
import { TaskDialog } from "./TaskDialog";

// Tarefa automática de lead novo: mesmo laranja da coluna "Oportunidades".
const DESTAQUE = { borda: "#D75631", fundo: "#FDF1EC" };

function isPending(id: string) {
  return id.startsWith("temp-");
}

function RoundCheckbox({
  checked,
  disabled,
  onToggle,
}: {
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        borderColor: checked ? "#121110" : "#D6D3CE",
        background: checked ? "#121110" : "transparent",
      }}
    >
      {checked && <Check size={11} strokeWidth={3} className="text-white" />}
    </button>
  );
}

export function TaskItem({
  task,
  sortable = false,
  onToggle,
  onDelete,
  onUpdateTitulo,
  onUpdateDescricao,
}: {
  task: Task;
  sortable?: boolean;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onUpdateTitulo: (task: Task, titulo: string) => void;
  onUpdateDescricao: (task: Task, descricao: string) => void;
}) {
  const [aberta, setAberta] = useState(false);
  const [settling, setSettling] = useState(false);

  const pending = isPending(task.id);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !sortable || pending,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : pending ? 0.6 : 1,
  };

  function handleToggle() {
    if (pending) return;
    // pequena animação de saída antes da tarefa trocar de seção
    setSettling(true);
    window.setTimeout(() => setSettling(false), 180);
    onToggle(task);
  }

  function abrir() {
    if (!pending) setAberta(true);
  }

  const nota = task.descricao?.trim() ?? "";
  const destaque = !!task.lead_id && !task.concluida;
  const whatsappLead = task.leads?.whatsapp;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderColor: destaque ? DESTAQUE.borda : "#E0DED9",
        background: destaque ? DESTAQUE.fundo : "#FFFFFF",
        borderLeftWidth: destaque ? 4 : undefined,
      }}
      className={
        "group rounded-lg border transition-all duration-200 " +
        (settling ? "scale-[0.98] opacity-60" : "scale-100 opacity-100")
      }
    >
      {/* Clique abre a janela da tarefa; arrastar (6px+) continua reordenando. */}
      <div
        role="button"
        tabIndex={pending ? -1 : 0}
        aria-label={`Abrir tarefa ${task.titulo}`}
        onClick={abrir}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrir();
          }
        }}
        className={
          "flex items-start gap-2 rounded-lg px-2.5 py-2 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900" +
          (pending ? "" : " cursor-pointer hover:bg-black/[0.02]")
        }
        {...(sortable && !pending ? { ...attributes, ...listeners } : {})}
      >
        <RoundCheckbox checked={task.concluida} disabled={pending} onToggle={handleToggle} />

        <div className="min-w-0 flex-1">
          <p
            className={
              (task.concluida
                ? "truncate text-sm text-neutral-400 line-through"
                : "truncate text-sm text-neutral-900") + (destaque ? " font-semibold" : "")
            }
          >
            {task.titulo}
          </p>

          {nota && (
            <p className="mt-0.5 line-clamp-2 whitespace-pre-line text-xs leading-snug text-neutral-500">
              {nota}
            </p>
          )}

          {task.concluida && task.data_conclusao && (
            <p className="mt-0.5 text-[11px] text-neutral-400">
              Concluída em: {formatDateTime(task.data_conclusao)}
            </p>
          )}
        </div>

        {destaque && whatsappLead && (
          <a
            href={whatsappHref(whatsappLead)}
            target="_blank"
            rel="noreferrer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            aria-label="Abrir WhatsApp do lead"
            title="Abrir WhatsApp do lead"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[#25D366] hover:bg-white"
          >
            <MessageCircle size={15} />
          </a>
        )}

        <span
          aria-hidden="true"
          className={
            "h-6 w-6 shrink-0 items-center justify-center rounded-md text-neutral-400 " +
            (nota ? "flex" : "hidden group-hover:flex")
          }
        >
          {nota ? <FileText size={14} /> : <StickyNote size={14} />}
        </span>

        <button
          type="button"
          disabled={pending}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Excluir a tarefa "${task.titulo}"?`)) onDelete(task);
          }}
          aria-label="Excluir tarefa"
          className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-red-600 group-hover:flex disabled:pointer-events-none"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {aberta && (
        <TaskDialog
          task={task}
          onClose={() => setAberta(false)}
          onUpdateTitulo={onUpdateTitulo}
          onUpdateDescricao={onUpdateDescricao}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
