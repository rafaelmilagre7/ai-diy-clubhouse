import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Atualiza durações de vídeos usando a edge function
 * Esta é a forma correta de chamar a edge function do JavaScript
 */
export const updateVideoDurations = async (lessonId?: string): Promise<boolean> => {
  try {
    toast.info("Atualizando durações de vídeos...");
    
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
      toast.info("Nenhum vídeo encontrado para atualização");
      return true;
    }
    
    if (data.success > 0) {
      toast.success(`Durações de ${data.success} vídeo(s) atualizadas com sucesso!`);
      
      if (data.failed > 0) {
        toast.warning(`Não foi possível atualizar ${data.failed} vídeo(s)`);
      }
      
      return true;
    } else {
      toast.info("Nenhuma duração de vídeo precisou ser atualizada.");
      return true;
    }
    
  } catch (error: any) {
    console.error("❌ Erro ao executar atualização de durações:", error);
    toast.error("Falha ao atualizar durações: " + (error.message || "Erro desconhecido"));
    return false;
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