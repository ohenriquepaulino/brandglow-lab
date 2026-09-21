import { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileText, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/crm-auth";
import type { Task } from "@/lib/tasks-api";

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
  const tituloRef = useRef<HTMLInputElement | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !sortable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderColor: "#E0DED9" }}
      className="group rounded-md border bg-white transition-all duration-200"
    >
      <div
        className="flex items-start gap-2 px-2.5 py-2"
        {...(sortable ? { ...attributes, ...listeners } : {})}
      >
        <input
          type="checkbox"
          checked={task.concluida}
          onChange={(e) => {
            e.stopPropagation();
            onToggle(task);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-neutral-900"
        />

        <div
          className="min-w-0 flex-1 cursor-pointer"
          onClick={() => !editingTitulo && setExpanded((v) => !v)}
        >
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
                setEditingTitulo(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className={
                task.concluida
                  ? "truncate text-sm text-neutral-400 line-through"
                  : "truncate text-sm text-neutral-900"
              }
            >
              {task.titulo}
              {task.descricao?.trim() && (
                <FileText
                  size={12}
                  className="ml-1.5 inline-block shrink-0 align-middle text-neutral-400"
                />
              )}
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
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Excluir a tarefa "${task.titulo}"?`)) onDelete(task);
          }}
          aria-label="Excluir tarefa"
          className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-red-600 group-hover:flex"
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
            placeholder="Adicionar descrição..."
            rows={2}
            className="w-full resize-none rounded border px-2 py-1.5 text-xs text-neutral-700 outline-none"
            style={{ borderColor: "#E0DED9" }}
          />
        </div>
      )}
    </div>
  );
}
