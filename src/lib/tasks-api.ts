import { CRM_PASS } from "./crm-auth";

export type TaskList = {
  id: string;
  nome: string;
  ordem: number;
  created_at: string;
};

export type Task = {
  id: string;
  list_id: string;
  titulo: string;
  descricao: string | null;
  concluida: boolean;
  data_conclusao: string | null;
  ordem: number;
  created_at: string;
  /** Preenchido nas tarefas criadas automaticamente para um lead novo. */
  lead_id?: string | null;
  leads?: { whatsapp: string } | null;
};

async function call<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/public/crm/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-crm-token": CRM_PASS,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Tasks API error ${res.status}`);
  return (await res.json()) as T;
}

export async function apiListTasksData(): Promise<{ lists: TaskList[]; tasks: Task[] }> {
  const { data } = await call<{ data: { lists: TaskList[]; tasks: Task[] } }>({
    action: "list_data",
  });
  return data ?? { lists: [], tasks: [] };
}

export async function apiCreateList(nome: string): Promise<TaskList> {
  const { data } = await call<{ data: TaskList }>({ action: "create_list", nome });
  return data;
}

export async function apiRenameList(id: string, nome: string): Promise<TaskList> {
  const { data } = await call<{ data: TaskList }>({ action: "rename_list", id, nome });
  return data;
}

export async function apiDeleteList(id: string): Promise<void> {
  await call({ action: "delete_list", id });
}

export async function apiCreateTask(list_id: string, titulo: string): Promise<Task> {
  const { data } = await call<{ data: Task }>({ action: "create_task", list_id, titulo });
  return data;
}

export async function apiUpdateTask(
  id: string,
  patch: { titulo?: string; descricao?: string | null; concluida?: boolean },
): Promise<Task> {
  const { data } = await call<{ data: Task }>({ action: "update_task", id, ...patch });
  return data;
}

export async function apiDeleteTask(id: string): Promise<void> {
  await call({ action: "delete_task", id });
}

export async function apiReorderTasks(list_id: string, ordered_ids: string[]): Promise<void> {
  await call({ action: "reorder_tasks", list_id, ordered_ids });
}
