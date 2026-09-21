import { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, FileText, StickyNote, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/crm-auth";
import type { Task } from "@/lib/tasks-api";

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
  const [editingTitulo, setEditingTitulo] = useState(false);
  const [tituloDraft, setTituloDraft] = useState(task.titulo);
  const [expanded, setExpanded] = useState(false);
  const [descDraft, setDescDraft] = useState(task.descricao ?? "");
  const [settling, setSettling] = useState(false);
  const tituloRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    if (editingTitulo) tituloRef.current?.focus();
  }, [editingTitulo]);

  function saveTitulo() {
    const trimmed = tituloDraft.trim();
    setEditingTitulo(false);
    if (!trimmed) {
      setTituloDraft(task.titulo);
      return;
    }
    if (trimmed !== task.titulo) onUpdateTitulo(task, trimmed);
  }

  function saveDescricao() {
    if (descDraft !== (task.descricao ?? "")) onUpdateDescricao(task, descDraft);
  }

  function handleToggle() {
    if (pending) return;
    // pequena animação de saída antes da tarefa trocar de seção
    setSettling(true);
    window.setTimeout(() => setSettling(false), 180);
    onToggle(task);
  }

  const temTexto = !!task.descricao?.trim();

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderColor: "#E0DED9" }}
      className={
        "group rounded-lg border bg-white transition-all duration-200 " +
        (settling ? "scale-[0.98] opacity-60" : "scale-100 opacity-100")
      }
    >
      <div
        className="flex items-start gap-2 px-2.5 py-2"
        {...(sortable && !pending ? { ...attributes, ...listeners } : {})}
      >
        <RoundCheckbox checked={task.concluida} disabled={pending} onToggle={handleToggle} />

        <div className="min-w-0 flex-1">
          {editingTitulo ? (
            <input
              ref={tituloRef}
              value={tituloDraft}
              onChange={(e) => setTituloDraft(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onBlur={saveTitulo}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveTitulo();
                if (e.key === "Escape") {
                  setTituloDraft(task.titulo);
                  setEditingTitulo(false);
                }
              }}
              className="w-full rounded border px-1.5 py-0.5 text-sm outline-none"
              style={{ borderColor: "#E0DED9" }}
            />
          ) : (
            <p
              onClick={(e) => {
                e.stopPropagation();
                if (!pending) setEditingTitulo(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className={
                (task.concluida
                  ? "truncate text-sm text-neutral-400 line-through"
                  : "truncate text-sm text-neutral-900") + (pending ? "" : " cursor-text")
              }
            >
              {task.titulo}
            </p>
          )}

          {task.concluida && task.data_conclusao && (
            <p className="mt-0.5 text-[11px] text-neutral-400">
              Concluída em: {formatDateTime(task.data_conclusao)}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={pending}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          aria-label={temTexto ? "Ver nota" : "Adicionar nota"}
          aria-pressed={expanded}
          className={
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 disabled:pointer-events-none " +
            (temTexto || expanded ? "flex" : "hidden group-hover:flex")
          }
        >
          {temTexto ? <FileText size={14} /> : <StickyNote size={14} />}
        </button>

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

      {expanded && (
        <div
          className="border-t px-2.5 py-2"
          style={{ borderColor: "#E0DED9" }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <textarea
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={saveDescricao}
            placeholder="Adicionar nota..."
            rows={2}
            autoFocus
            className="w-full resize-none rounded border px-2 py-1.5 text-xs text-neutral-700 outline-none"
            style={{ borderColor: "#E0DED9" }}
          />
        </div>
      )}
    </div>
  );
}
