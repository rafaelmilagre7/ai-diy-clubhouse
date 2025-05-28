
import { supabase } from "@/lib/supabase";
import { ImplementationTrail } from "@/types/implementation-trail";

/**
 * Função isolada para salvar/atualizar a trilha de implementação no banco.
 */
export const saveImplementationTrail = async (
  userId: string,
  trailData: ImplementationTrail
) => {
  try {
    const { data: existingTrail } = await supabase
      .from("implementation_trails")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingTrail) {
      await supabase
        .from("implementation_trails")
        .update({
          trail_data: trailData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingTrail.id);
    } else {
      await supabase
        .from("implementation_trails")
        .insert({
          user_id: userId,
          trail_data: trailData,
        });
    }
  } catch (error) {
    console.error("Erro ao salvar trilha no banco de dados:", error);
  }
};
