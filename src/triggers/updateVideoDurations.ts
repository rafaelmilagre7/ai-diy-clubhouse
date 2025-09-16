import { supabase } from "@/lib/supabase";

/**
 * Atualiza durações de vídeos usando a edge function corrigida
 */
export const updateVideoDurations = async (lessonId?: string): Promise<boolean> => {
  try {
    console.log('🔄 Chamando edge function update-video-durations', { lessonId });
    
    // Chamar edge function usando o método correto do cliente Supabase
    const { data, error } = await supabase.functions.invoke('update-video-durations', {
      body: lessonId ? { lessonId } : {}
    });
    
    if (error) {
      console.error('❌ Erro na edge function:', error);
      throw error;
    }
    
    console.log('✅ Resposta da edge function:', data);
    
    if (data.totalProcessed === 0) {
      console.log("ℹ️ Nenhum vídeo encontrado para atualização");
      return true;
    }
    
    if (data.success > 0) {
      console.log(`✅ Durações de ${data.success} vídeo(s) atualizadas com sucesso!`);
      
      if (data.failed > 0) {
        console.log(`⚠️ Não foi possível atualizar ${data.failed} vídeo(s)`);
      }
      
      return true;
    } else {
      console.log("ℹ️ Nenhuma duração de vídeo precisou ser atualizada.");
      return true;
    }
    
  } catch (error: any) {
    console.error("❌ Erro ao executar atualização de durações:", error);
    throw error;
  }
};

/**
 * Executa atualização de todas as durações de vídeos
 */
export const updateAllVideoDurations = async (): Promise<boolean> => {
  return updateVideoDurations(); // Sem lessonId = atualizar todos
};

/**
 * Executa atualização das durações de vídeos de uma aula específica
 */
export const updateLessonVideoDurations = async (lessonId: string): Promise<boolean> => {
  return updateVideoDurations(lessonId);
};