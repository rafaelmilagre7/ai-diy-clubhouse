
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Função para atualizar as durações dos vídeos da aula atual
 * @param lessonId ID da aula
 */
export const atualizarDuracoesAulaAtual = async (lessonId: string): Promise<boolean> => {
  try {
    if (!lessonId) {
      toast.error("ID da aula não definido");
      return false;
    }
    
    toast.info("Atualizando durações dos vídeos desta aula...");
    
    // Chamar a edge function para atualizar apenas os vídeos desta aula
    const { data, error } = await supabase.functions.invoke('update-video-durations', {
      body: { lessonId }
    });
    
    if (error) {
      throw error;
    }
    
    if (data.success > 0) {
      toast.success(`Duração de ${data.success} vídeo(s) atualizada com sucesso!`);
      // Recarregar a página após 2 segundos para mostrar as novas durações
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      return true;
    } else {
      toast.info("Nenhuma duração de vídeo precisou ser atualizada.");
      return true;
    }
  } catch (error: any) {
    console.error("Erro ao atualizar durações da aula atual:", error);
    toast.error("Falha ao atualizar as durações: " + (error.message || "Erro desconhecido"));
    return false;
  }
};

// Executar automaticamente quando este módulo for importado
// Obter o lessonId da URL atual para atualizar apenas a aula atual
export const executarAtualizacaoAutomatica = () => {
  const url = new URL(window.location.href);
  const path = url.pathname;
  
  // Extrair lessonId da URL (formatada como /learning/course/COURSE_ID/lesson/LESSON_ID)
  const lessonMatch = path.match(/\/lesson\/([a-zA-Z0-9-]+)/);
  
  if (lessonMatch && lessonMatch[1]) {
    const lessonId = lessonMatch[1];
    // Atualizar a duração dos vídeos desta aula específica
    atualizarDuracoesAulaAtual(lessonId)
      .then(success => {
        if (success) {
          // Recarregar a página após 2 segundos para mostrar as novas durações
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      });
  }
};
