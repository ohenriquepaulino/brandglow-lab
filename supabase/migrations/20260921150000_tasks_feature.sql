-- Feature: gestão de tarefas do CRM (listas + tarefas), inspirada no Google Tasks.
-- Segue o mesmo padrão de segurança já usado em `leads`/`historico_movimentacoes`:
-- RLS habilitada, sem policies, acesso só via service_role (usado pelo server route).

CREATE TABLE public.task_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.task_lists(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  concluida boolean NOT NULL DEFAULT false,
  data_conclusao timestamptz,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_list ON public.tasks(list_id);
CREATE INDEX idx_tasks_concluida ON public.tasks(list_id, concluida);

ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Sem policies: anon/authenticated não têm acesso. Só o service_role
-- (usado pelo server route /api/public/crm/tasks, protegido pelo CRM_API_TOKEN).
REVOKE ALL ON public.task_lists FROM anon, authenticated, PUBLIC;
REVOKE ALL ON public.tasks FROM anon, authenticated, PUBLIC;

GRANT ALL ON public.task_lists TO service_role;
GRANT ALL ON public.tasks TO service_role;
