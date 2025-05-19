
import { supabase } from "@/lib/supabase";

export async function fetchLessonResources(lessonId: string): Promise<any[]> {
  try {
    // Buscar recursos da lição do banco de dados
    const { data, error } = await supabase
      .from('learning_resources')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at');

    if (error) {
      console.error('Erro ao buscar recursos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar recursos da aula:', error);
    return [];
  }
}

export async function saveResourcesForLesson(
  lessonId: string,
  resources: any[]
): Promise<boolean> {
  try {
    // Primeiro remover recursos existentes
    const { error: deleteError } = await supabase
      .from('learning_resources')
      .delete()
      .eq('lesson_id', lessonId);

    if (deleteError) {
      console.error('Erro ao remover recursos antigos:', deleteError);
      return false;
    }

    // Se não houver recursos para adicionar, retornar sucesso
    if (!resources || resources.length === 0) {
      return true;
    }

    // Adicionar os novos recursos
    const resourcesToInsert = resources.map((resource) => ({
      ...resource,
      lesson_id: lessonId
    }));

    const { error: insertError } = await supabase
      .from('learning_resources')
      .insert(resourcesToInsert);

    if (insertError) {
      console.error('Erro ao salvar novos recursos:', insertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar recursos da aula:', error);
    return false;
  }
}
