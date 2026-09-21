import { useEffect, useRef, useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { ChevronDown, ClipboardList, ListPlus, MoreVertical, Plus } from "lucide-react";
import { TaskItem } from "./TaskItem";
import type { Task, TaskList } from "@/lib/tasks-api";

export function TaskColumn({
  list,
  tasks,
  onAddTask,
  onRename,
  onDeleteList,
  onToggle,
  onDeleteTask,
  onUpdateTitulo,
  onUpdateDescricao,
  onReorder,
}: {
  list: TaskList;
  tasks: Task[];
  onAddTask: (list: TaskList, titulo: string) => void;
  onRename: (list: TaskList, nome: string) => void;
  onDeleteList: (list: TaskList) => void;
  onToggle: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onUpdateTitulo: (task: Task, titulo: string) => void;
  onUpdateDescricao: (task: Task, descricao: string) => void;
  onReorder: (listId: string, orderedIds: string[]) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [nomeDraft, setNomeDraft] = useState(list.nome);
  const [novaTarefa, setNovaTarefa] = useState("");
  const [concluidasAbertas, setConcluidasAbertas] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const nomeRef = useRef<HTMLInputElement | null>(null);
  const novaTarefaRef = useRef<HTMLInputElement | null>(null);

  const pendentes = tasks.filter((t) => !t.concluida).sort((a, b) => a.ordem - b.ordem);
  const concluidas = tasks.filter((t) => t.concluida);
  const pending = list.id.startsWith("temp-");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    if (!menuOpen) return;
    function onDocDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocDown);
    return () => document.removeEventListener("mousedown", onDocDown);
  }, [menuOpen]);

  useEffect(() => {
    if (renaming) nomeRef.current?.focus();
  }, [renaming]);

  function saveNome() {
    const trimmed = nomeDraft.trim();
    setRenaming(false);
    if (trimmed && trimmed !== list.nome) onRename(list, trimmed);
    else setNomeDraft(list.nome);
  }

  function submitNovaTarefa(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const trimmed = novaTarefa.trim();
    if (!trimmed) return;
    onAddTask(list, trimmed);
    setNovaTarefa("");
    novaTarefaRef.current?.focus();
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = pendentes.findIndex((t) => t.id === active.id);
    const newIndex = pendentes.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(pendentes, oldIndex, newIndex);
    onReorder(
      list.id,
      reordered.map((t) => t.id),
    );
  }

  const isEmpty = tasks.length === 0;

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div
        className="rounded-t-md bg-white px-3 pt-2.5 pb-2"
        style={{ borderTop: "3px solid #D75631" }}
      >
        <div className="flex items-center justify-between gap-2">
          {renaming ? (
            <input
              ref={nomeRef}
              value={nomeDraft}
              onChange={(e) => setNomeDraft(e.target.value)}
              onBlur={saveNome}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveNome();
                if (e.key === "Escape") {
                  setNomeDraft(list.nome);
                  setRenaming(false);
                }
              }}
              className="w-full rounded border px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide outline-none"
              style={{ borderColor: "#E0DED9" }}
            />
          ) : (
            <p
              onClick={() => {
                if (!pending) setRenaming(true);
              }}
              className={
                "truncate text-xs font-semibold uppercase tracking-wide text-neutral-800" +
                (pending ? "" : " cursor-pointer")
              }
            >
              {list.nome}
            </p>
          )}

          <div ref={menuRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Opções da lista"
              className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-800"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-7 z-20 w-44 rounded-md border bg-white py-1 shadow-lg"
                style={{ borderColor: "#E0DED9" }}
              >
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setMenuOpen(false);
                    setRenaming(true);
                  }}
                  className="block w-full px-3 py-1.5 text-left text-xs text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  Renomear lista
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    setMenuOpen(false);
                    const pendentesN = tasks.length;
                    const msg =
                      pendentesN > 0
                        ? `Excluir "${list.nome}"? ${pendentesN} tarefa(s) serão perdidas.`
                        : `Excluir a lista "${list.nome}"?`;
                    if (confirm(msg)) onDeleteList(list);
                  }}
                  className="block w-full px-3 py-1.5 text-left text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  Excluir lista
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="flex min-h-[60vh] flex-col gap-2 rounded-b-md border border-t-0 p-2"
        style={{ borderColor: "#E0DED9", background: "#FAFAF8" }}
      >
        <form
          onSubmit={submitNovaTarefa}
          className="flex items-center gap-1.5 rounded-md border bg-white px-2 py-1.5 disabled:opacity-50"
          style={{ borderColor: "#E0DED9" }}
        >
          <Plus size={16} className="shrink-0 text-neutral-400" />
          <input
            ref={novaTarefaRef}
            value={novaTarefa}
            onChange={(e) => setNovaTarefa(e.target.value)}
            disabled={pending}
            placeholder={pending ? "Salvando lista..." : "Adicionar uma tarefa"}
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed"
          />
        </form>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
            <ClipboardList size={28} className="text-neutral-300" />
            <p className="text-sm font-medium text-neutral-600">Não há tarefas</p>
            <p className="px-4 text-xs text-neutral-400">
              Adicione suas tarefas para acompanhar seu progresso
            </p>
          </div>
        ) : (
          <>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext
                items={pendentes.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-1.5">
                  {pendentes.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      sortable
                      onToggle={onToggle}
                      onDelete={onDeleteTask}
                      onUpdateTitulo={onUpdateTitulo}
                      onUpdateDescricao={onUpdateDescricao}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {concluidas.length > 0 && (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setConcluidasAbertas((v) => !v)}
                  className="flex w-full items-center gap-1.5 px-1 py-1 text-xs font-medium text-neutral-500 hover:text-neutral-800"
                >
                  <ChevronDown
                    size={14}
                    className="transition-transform"
                    style={{ transform: concluidasAbertas ? "rotate(0deg)" : "rotate(-90deg)" }}
                  />
                  Concluídas ({concluidas.length})
                </button>
                {concluidasAbertas && (
                  <div className="mt-1 flex flex-col gap-1.5">
                    {concluidas.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={onToggle}
                        onDelete={onDeleteTask}
                        onUpdateTitulo={onUpdateTitulo}
                        onUpdateDescricao={onUpdateDescricao}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function CriarNovaListaButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-56 shrink-0 items-center gap-2 self-start rounded-md border border-dashed px-3 text-sm font-medium text-neutral-500 hover:bg-white hover:text-neutral-800"
      style={{ borderColor: "#E0DED9" }}
    >
      <ListPlus size={16} />
      Criar nova lista
    </button>
  );
}
