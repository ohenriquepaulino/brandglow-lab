import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  apiCreateList,
  apiCreateTask,
  apiDeleteList,
  apiDeleteTask,
  apiListTasksData,
  apiRenameList,
  apiReorderTasks,
  apiUpdateTask,
  type Task,
  type TaskList,
} from "@/lib/tasks-api";
import { crmLogout, isCrmAuthed } from "@/lib/crm-auth";
import { CrmSidebar } from "@/components/crm/Sidebar";
import { CriarNovaListaButton, TaskColumn } from "@/components/crm/tasks/TaskColumn";

export const Route = createFileRoute("/crm/tarefas")({
  ssr: false,
  component: TarefasPage,
});

function TarefasPage() {
  const navigate = useNavigate();
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [criandoLista, setCriandoLista] = useState(false);
  const [novaListaNome, setNovaListaNome] = useState("");
  const novaListaRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isCrmAuthed()) {
      navigate({ to: "/crm" });
      return;
    }
    void load();
  }, [navigate]);

  useEffect(() => {
    if (criandoLista) novaListaRef.current?.focus();
  }, [criandoLista]);

  async function load() {
    setLoading(true);
    try {
      const data = await apiListTasksData();
      setLists(data.lists);
      setTasks(data.tasks);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function handleLogout() {
    crmLogout();
    navigate({ to: "/crm" });
  }

  // ---- listas ----

  function submitNovaLista(e: React.FormEvent) {
    e.preventDefault();
    const nome = novaListaNome.trim();
    if (!nome) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic: TaskList = {
      id: tempId,
      nome,
      ordem: lists.length,
      created_at: new Date().toISOString(),
    };
    setLists((prev) => [...prev, optimistic]);
    setNovaListaNome("");
    setCriandoLista(false);

    apiCreateList(nome)
      .then((created) => {
        setLists((prev) => prev.map((l) => (l.id === tempId ? created : l)));
      })
      .catch((err) => {
        console.error(err);
        setLists((prev) => prev.filter((l) => l.id !== tempId));
        alert("Não foi possível criar a lista. Tente novamente.");
      });
  }

  function renameList(list: TaskList, nome: string) {
    const prev = lists;
    setLists((p) => p.map((l) => (l.id === list.id ? { ...l, nome } : l)));
    apiRenameList(list.id, nome).catch((err) => {
      console.error(err);
      setLists(prev);
      alert("Não foi possível renomear a lista.");
    });
  }

  function deleteList(list: TaskList) {
    const prevLists = lists;
    const prevTasks = tasks;
    setLists((p) => p.filter((l) => l.id !== list.id));
    setTasks((p) => p.filter((t) => t.list_id !== list.id));
    apiDeleteList(list.id).catch((err) => {
      console.error(err);
      setLists(prevLists);
      setTasks(prevTasks);
      alert("Não foi possível excluir a lista.");
    });
  }

  // ---- tarefas ----

  function addTask(list: TaskList, titulo: string) {
    const tempId = `temp-${Date.now()}`;
    const maxOrdem = Math.max(
      -1,
      ...tasks.filter((t) => t.list_id === list.id && !t.concluida).map((t) => t.ordem),
    );
    const optimistic: Task = {
      id: tempId,
      list_id: list.id,
      titulo,
      descricao: null,
      concluida: false,
      data_conclusao: null,
      ordem: maxOrdem + 1,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, optimistic]);

    apiCreateTask(list.id, titulo)
      .then((created) => {
        setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
      })
      .catch((err) => {
        console.error(err);
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
        alert("Não foi possível criar a tarefa.");
      });
  }

  function toggleTask(task: Task) {
    const prev = tasks;
    const concluida = !task.concluida;
    setTasks((p) =>
      p.map((t) =>
        t.id === task.id
          ? { ...t, concluida, data_conclusao: concluida ? new Date().toISOString() : null }
          : t,
      ),
    );
    apiUpdateTask(task.id, { concluida }).catch((err) => {
      console.error(err);
      setTasks(prev);
    });
  }

  function deleteTask(task: Task) {
    const prev = tasks;
    setTasks((p) => p.filter((t) => t.id !== task.id));
    apiDeleteTask(task.id).catch((err) => {
      console.error(err);
      setTasks(prev);
      alert("Não foi possível excluir a tarefa.");
    });
  }

  function updateTitulo(task: Task, titulo: string) {
    const prev = tasks;
    setTasks((p) => p.map((t) => (t.id === task.id ? { ...t, titulo } : t)));
    apiUpdateTask(task.id, { titulo }).catch((err) => {
      console.error(err);
      setTasks(prev);
    });
  }

  function updateDescricao(task: Task, descricao: string) {
    const prev = tasks;
    setTasks((p) => p.map((t) => (t.id === task.id ? { ...t, descricao } : t)));
    apiUpdateTask(task.id, { descricao: descricao || null }).catch((err) => {
      console.error(err);
      setTasks(prev);
    });
  }

  function reorderTasks(listId: string, orderedIds: string[]) {
    const prev = tasks;
    setTasks((p) => {
      const byId = new Map(orderedIds.map((id, index) => [id, index]));
      return p.map((t) =>
        t.list_id === listId && byId.has(t.id) ? { ...t, ordem: byId.get(t.id)! } : t,
      );
    });
    apiReorderTasks(listId, orderedIds).catch((err) => {
      console.error(err);
      setTasks(prev);
    });
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#F4F2EF", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <CrmSidebar />

      <div className="flex-1">
        <header
          className="flex items-center justify-between border-b bg-white px-6 py-3"
          style={{ borderColor: "#E0DED9" }}
        >
          <p className="text-sm font-semibold text-neutral-900">Tarefas</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void load()}
              className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              style={{ borderColor: "#E0DED9" }}
            >
              Atualizar
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md border px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              style={{ borderColor: "#E0DED9" }}
            >
              Sair
            </button>
          </div>
        </header>

        <main className="px-6 py-6">
          {loading ? (
            <div className="scrollbar-kanban flex gap-4 overflow-x-auto pb-6">
              {[0, 1].map((i) => (
                <div key={i} className="flex w-72 shrink-0 flex-col gap-2">
                  <div className="h-9 animate-pulse rounded-t-md bg-neutral-200" />
                  <div
                    className="flex min-h-[40vh] flex-col gap-2 rounded-b-md border border-t-0 p-2"
                    style={{ borderColor: "#E0DED9" }}
                  >
                    <div className="h-9 animate-pulse rounded-md bg-neutral-100" />
                    <div className="h-8 animate-pulse rounded-md bg-neutral-100" />
                    <div className="h-8 animate-pulse rounded-md bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="scrollbar-kanban flex items-start gap-4 overflow-x-auto pb-6">
              {lists.map((list) => (
                <TaskColumn
                  key={list.id}
                  list={list}
                  tasks={tasks.filter((t) => t.list_id === list.id)}
                  onAddTask={addTask}
                  onRename={renameList}
                  onDeleteList={deleteList}
                  onToggle={toggleTask}
                  onDeleteTask={deleteTask}
                  onUpdateTitulo={updateTitulo}
                  onUpdateDescricao={updateDescricao}
                  onReorder={reorderTasks}
                />
              ))}

              {criandoLista ? (
                <form
                  onSubmit={submitNovaLista}
                  className="flex h-10 w-56 shrink-0 items-center gap-2 rounded-md border bg-white px-3"
                  style={{ borderColor: "#E0DED9" }}
                >
                  <input
                    ref={novaListaRef}
                    value={novaListaNome}
                    onChange={(e) => setNovaListaNome(e.target.value)}
                    onBlur={() => {
                      if (!novaListaNome.trim()) setCriandoLista(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setNovaListaNome("");
                        setCriandoLista(false);
                      }
                    }}
                    placeholder="Nome da lista"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </form>
              ) : (
                <CriarNovaListaButton onClick={() => setCriandoLista(true)} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
