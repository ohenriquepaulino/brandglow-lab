import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list_data") }),
  z.object({ action: z.literal("create_list"), nome: z.string().min(1).max(120) }),
  z.object({
    action: z.literal("rename_list"),
    id: z.string().uuid(),
    nome: z.string().min(1).max(120),
  }),
  z.object({ action: z.literal("delete_list"), id: z.string().uuid() }),
  z.object({
    action: z.literal("create_task"),
    list_id: z.string().uuid(),
    titulo: z.string().min(1).max(500),
  }),
  z.object({
    action: z.literal("update_task"),
    id: z.string().uuid(),
    titulo: z.string().min(1).max(500).optional(),
    descricao: z.string().max(5000).nullable().optional(),
    concluida: z.boolean().optional(),
  }),
  z.object({ action: z.literal("delete_task"), id: z.string().uuid() }),
  z.object({
    action: z.literal("reorder_tasks"),
    list_id: z.string().uuid(),
    ordered_ids: z.array(z.string().uuid()).max(500),
  }),
]);

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export const Route = createFileRoute("/api/public/crm/tasks")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("x-crm-token");
        const expected = process.env.CRM_API_TOKEN;
        if (!expected || !token || token !== expected) return unauthorized();

        const supabaseUrl = process.env.SUPABASE_URL ?? import.meta.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        let payload;
        try {
          payload = ActionSchema.parse(await request.json());
        } catch (err) {
          return Response.json({ error: "Invalid payload", details: String(err) }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        switch (payload.action) {
          case "list_data": {
            const { data: listsData, error: listsErr } = await supabase
              .from("task_lists")
              .select("*")
              .order("ordem", { ascending: true });
            if (listsErr) return Response.json({ error: listsErr.message }, { status: 500 });
            let lists = listsData;

            if (!lists || lists.length === 0) {
              const { data: created, error: createErr } = await supabase
                .from("task_lists")
                .insert({ nome: "Minhas tarefas", ordem: 0 })
                .select()
                .single();
              if (createErr) return Response.json({ error: createErr.message }, { status: 500 });
              lists = created ? [created] : [];
            }

            const { data: tasks, error: tasksErr } = await supabase
              .from("tasks")
              .select("*, leads(whatsapp)")
              .order("ordem", { ascending: true });
            if (tasksErr) return Response.json({ error: tasksErr.message }, { status: 500 });

            return Response.json({ data: { lists: lists ?? [], tasks: tasks ?? [] } });
          }

          case "create_list": {
            const { data: existing } = await supabase
              .from("task_lists")
              .select("ordem")
              .order("ordem", { ascending: false })
              .limit(1);
            const nextOrdem = existing && existing.length > 0 ? existing[0].ordem + 1 : 0;

            const { data, error } = await supabase
              .from("task_lists")
              .insert({ nome: payload.nome, ordem: nextOrdem })
              .select()
              .single();
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ data });
          }

          case "rename_list": {
            const { data, error } = await supabase
              .from("task_lists")
              .update({ nome: payload.nome })
              .eq("id", payload.id)
              .select()
              .single();
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ data });
          }

          case "delete_list": {
            const { error } = await supabase.from("task_lists").delete().eq("id", payload.id);
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ success: true });
          }

          case "create_task": {
            const { data: existing } = await supabase
              .from("tasks")
              .select("ordem")
              .eq("list_id", payload.list_id)
              .order("ordem", { ascending: false })
              .limit(1);
            const nextOrdem = existing && existing.length > 0 ? existing[0].ordem + 1 : 0;

            const { data, error } = await supabase
              .from("tasks")
              .insert({ list_id: payload.list_id, titulo: payload.titulo, ordem: nextOrdem })
              .select()
              .single();
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ data });
          }

          case "update_task": {
            const patch: Record<string, unknown> = {};
            if (payload.titulo !== undefined) patch.titulo = payload.titulo;
            if (payload.descricao !== undefined) patch.descricao = payload.descricao;
            if (payload.concluida !== undefined) {
              patch.concluida = payload.concluida;
              patch.data_conclusao = payload.concluida ? new Date().toISOString() : null;
            }

            const { data, error } = await supabase
              .from("tasks")
              .update(patch)
              .eq("id", payload.id)
              .select()
              .single();
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ data });
          }

          case "delete_task": {
            const { error } = await supabase.from("tasks").delete().eq("id", payload.id);
            if (error) return Response.json({ error: error.message }, { status: 500 });
            return Response.json({ success: true });
          }

          case "reorder_tasks": {
            const updates = payload.ordered_ids.map((id, index) =>
              supabase
                .from("tasks")
                .update({ ordem: index })
                .eq("id", id)
                .eq("list_id", payload.list_id),
            );
            const results = await Promise.all(updates);
            const failed = results.find((r) => r.error);
            if (failed?.error)
              return Response.json({ error: failed.error.message }, { status: 500 });
            return Response.json({ success: true });
          }
        }
      },
    },
  },
});
