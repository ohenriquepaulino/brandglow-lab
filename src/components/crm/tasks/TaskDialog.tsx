import { useEffect, useRef, useState } from "react";
import { MessageCircle, Trash2, X } from "lucide-react";
import { formatDateTime, whatsappHref } from "@/lib/crm-auth";
import type { Task } from "@/lib/tasks-api";

const BORDER = "#E0DED9";

/**
 * Janela da tarefa: título e nota editáveis num espaço confortável, em vez da
 * caixinha dentro da coluna. Salva ao fechar (Esc, clique fora, botão ou
 * Ctrl+Enter); o título também salva ao sair do campo.
 */
export function TaskDialog({
  task,
  onClose,
  onUpdateTitulo,
  onUpdateDescricao,
  onDelete,
}: {
  task: Task;
  onClose: () => void;
  onUpdateTitulo: (task: Task, titulo: string) => void;
  onUpdateDescricao: (task: Task, descricao: string) => void;
  onDelete: (task: Task) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const notaRef = useRef<HTMLTextAreaElement>(null);
  const [titulo, setTitulo] = useState(task.titulo);
  const [nota, setNota] = useState(task.descricao ?? "");

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    d.showModal();
    // Cursor no fim da nota, pronto para continuar escrevendo.
    const t = notaRef.current;
    if (t) {
      t.focus();
      t.setSelectionRange(t.value.length, t.value.length);
    }
  }, []);

  // A caixa cresce com o texto até o limite da janela; depois rola por dentro.
  useEffect(() => {
    const t = notaRef.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = `${Math.min(t.scrollHeight, window.innerHeight * 0.55)}px`;
  }, [nota]);

  function salvarTitulo() {
    const limpo = titulo.trim();
    if (!limpo) {
      setTitulo(task.titulo);
      return;
    }
    if (limpo !== task.titulo) onUpdateTitulo(task, limpo);
  }

  function fechar() {
    salvarTitulo();
    if (nota !== (task.descricao ?? "")) onUpdateDescricao(task, nota);
    onClose();
  }

  const whatsapp = task.leads?.whatsapp;

  return (
    <dialog
      ref={ref}
      aria-label={`Tarefa: ${task.titulo}`}
      onCancel={(e) => {
        e.preventDefault();
        fechar();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) fechar();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className="task-dialog w-[min(560px,calc(100vw-32px))] rounded-xl border p-0 text-neutral-900 shadow-2xl"
      style={{ borderColor: BORDER }}
    >
      <div className="flex items-start gap-2 border-b px-5 pb-3 pt-4" style={{ borderColor: BORDER }}>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          onBlur={salvarTitulo}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              notaRef.current?.focus();
            }
          }}
          aria-label="Título da tarefa"
          className={
            "min-w-0 flex-1 rounded-md px-1.5 py-1 text-base font-semibold outline-none hover:bg-neutral-50 focus:bg-neutral-50" +
            (task.concluida ? " text-neutral-400 line-through" : "")
          }
        />
        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-5 py-4">
        <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Nota
        </label>
        <textarea
          ref={notaRef}
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              fechar();
            }
          }}
          placeholder="Escreva aqui o que precisa lembrar sobre esta tarefa..."
          rows={6}
          className="mt-2 w-full resize-none rounded-lg border px-3 py-2.5 text-sm leading-relaxed text-neutral-800 outline-none focus:border-neutral-900"
          style={{ borderColor: BORDER, minHeight: 140 }}
        />
        <p className="mt-1 text-[11px] text-neutral-400">
          Salva ao fechar · Ctrl+Enter salva e fecha
        </p>
      </div>

      <div
        className="flex flex-wrap items-center gap-2 border-t px-5 py-3 text-[11px] text-neutral-500"
        style={{ borderColor: BORDER }}
      >
        <span>Criada em {formatDateTime(task.created_at)}</span>
        {task.concluida && task.data_conclusao && (
          <span>· Concluída em {formatDateTime(task.data_conclusao)}</span>
        )}
        <span className="ml-auto flex items-center gap-2">
          {whatsapp && (
            <a
              href={whatsappHref(whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-[#25D366] hover:bg-neutral-50"
              style={{ borderColor: BORDER }}
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              if (confirm(`Excluir a tarefa "${task.titulo}"?`)) {
                onDelete(task);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 hover:text-red-600"
            style={{ borderColor: BORDER }}
          >
            <Trash2 size={14} /> Excluir
          </button>
        </span>
      </div>

      <style>{`.task-dialog::backdrop { background: rgba(18,17,16,0.45); }`}</style>
    </dialog>
  );
}
