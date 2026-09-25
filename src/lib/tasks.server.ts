// Tarefa automática do lead novo. Só roda no servidor (server routes).
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cria "Chamar <nome>" no topo da primeira lista de tarefas (cria a lista
 * "Minhas tarefas" se não houver nenhuma). Nunca lança — o cadastro do lead
 * não pode falhar por causa da tarefa.
 */
export async function criarTaskDoLead(
  supabase: SupabaseClient,
  lead: { id: string | null; nome: string; whatsapp: string; faturamento: string },
) {
  if (!lead.id) return;
  try {
    let { data: lista } = await supabase
      .from("task_lists")
      .select("id")
      .order("ordem", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (!lista) {
      ({ data: lista } = await supabase
        .from("task_lists")
        .insert({ nome: "Minhas tarefas", ordem: 0 })
        .select("id")
        .single());
    }
    if (!lista) return;

    // Topo da lista: as pendentes são ordenadas por `ordem` crescente.
    const { data: primeira } = await supabase
      .from("tasks")
      .select("ordem")
      .eq("list_id", lista.id)
      .order("ordem", { ascending: true })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase.from("tasks").insert({
      list_id: lista.id,
      lead_id: lead.id,
      titulo: `Chamar ${lead.nome.trim()}`,
      descricao: `WhatsApp: ${lead.whatsapp}\nFaturamento: ${lead.faturamento}`,
      ordem: (primeira?.ordem ?? 1) - 1,
    });
    if (error) console.error("[tasks] tarefa do lead falhou", error.message);
  } catch (e) {
    console.error("[tasks] tarefa do lead error", e);
  }
}
