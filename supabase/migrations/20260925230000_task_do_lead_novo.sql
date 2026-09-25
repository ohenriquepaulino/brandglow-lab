-- Todo lead novo gera uma tarefa "Chamar <nome>" no topo da primeira lista.
-- tasks.lead_id marca essas tarefas: o card aparece em destaque (laranja) e
-- ganha o atalho para o WhatsApp do lead. Excluir o lead exclui a tarefa.

ALTER TABLE public.tasks
  ADD COLUMN lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE;

CREATE INDEX idx_tasks_lead ON public.tasks(lead_id) WHERE lead_id IS NOT NULL;
