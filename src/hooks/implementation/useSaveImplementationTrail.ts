
import { supabase } from "@/integrations/supabase/client";
import { ImplementationTrail } from "@/types/implementation-trail";

/**
 * Função isolada para salvar/atualizar a trilha de implementação no banco.
 */
export const saveImplementationTrail = async (
  userId: string,
  trailData: ImplementationTrail
) => {
  try {
    console.log('Salvando trilha para usuário:', userId);
    console.log('Dados da trilha:', trailData);

    const { data: existingTrail } = await supabase
      .from("implementation_trails")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingTrail) {
      console.log('Atualizando trilha existente:', existingTrail.id);
      const { error } = await supabase
        .from("implementation_trails")
        .update({
          trail_data: trailData,
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingTrail.id);

      if (error) {
        console.error('Erro ao atualizar trilha:', error);
        throw error;
      }
    } else {
      console.log('Criando nova trilha');
      const { error } = await supabase
        .from("implementation_trails")
        .insert({
          user_id: userId,
          trail_data: trailData,
          status: 'completed'
        });

      if (error) {
        console.error('Erro ao criar trilha:', error);
        throw error;
      }
    }

    console.log('Trilha salva com sucesso');
  } catch (error) {
    console.error("Erro ao salvar trilha no banco de dados:", error);
    throw error;
  }
};
