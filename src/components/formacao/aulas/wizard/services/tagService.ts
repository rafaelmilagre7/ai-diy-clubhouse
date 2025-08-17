import { supabase } from "@/lib/supabase";

/**
 * Salva as tags de uma aula
 * Remove tags antigas e adiciona as novas
 */
export async function saveTagsForLesson(
  lessonId: string,
  tagIds: string[]
): Promise<boolean> {
  try {
    // Primeiro, remover todas as tags existentes da aula
    const { error: deleteError } = await supabase
      .from('learning_lesson_tags')
      .delete()
      .eq('lesson_id', lessonId);

    if (deleteError) {
      console.error("Erro ao remover tags existentes:", deleteError);
      return false;
    }

    // Se não há tags para adicionar, retornar sucesso
    if (!tagIds || tagIds.length === 0) {
      console.log("Nenhuma tag para adicionar");
      return true;
    }

    // Adicionar as novas tags
    const tagsToInsert = tagIds.map(tagId => ({
      lesson_id: lessonId,
      tag_id: tagId
    }));

    const { error: insertError } = await supabase
      .from('learning_lesson_tags')
      .insert(tagsToInsert);

    if (insertError) {
      console.error("Erro ao inserir novas tags:", insertError);
      return false;
    }

    console.log(`✅ Tags salvas com sucesso para a aula ${lessonId}:`, tagIds);
    return true;
  } catch (error) {
    console.error("Erro ao salvar tags:", error);
    return false;
  }
}