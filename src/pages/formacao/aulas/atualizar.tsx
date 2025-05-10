
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from "sonner";

/**
 * Componente para atualizar automaticamente as durações dos vídeos da aula atual
 * NOTA: Este componente está desativado e não é mais utilizado na interface do usuário
 * Mantido apenas para referência futura
 */
export const AtualizarDuracoesAutomaticamente = () => {
  const { aulaId } = useParams<{ aulaId: string }>();
  
  // Componente desativado - não faz mais nada
  useEffect(() => {
    // Funcionalidade desativada
    return;
    
    // Código original comentado para referência futura
    /*
    if (!aulaId) return;
    
    // Verificar se essa aula tem vídeos sem duração
    const verificarEAtualizarVideos = async () => {
      try {
        // Buscar vídeos sem duração para esta aula
        const { data, error } = await supabase
          .from('learning_lesson_videos')
          .select('id')
          .eq('lesson_id', aulaId)
          .or('duration_seconds.is.null,duration_seconds.eq.0');
          
        if (error) throw error;
        
        // Se houver vídeos sem duração, atualizar automaticamente
        if (data && data.length > 0) {
          toast.info(`Atualizando durações de ${data.length} vídeos...`);
          
          // Chamar a edge function para atualizar apenas os vídeos desta aula
          const { data: result, error: updateError } = await supabase.functions.invoke('update-video-durations', {
            body: { lessonId: aulaId }
          });
          
          if (updateError) throw updateError;
          
          if (result && result.success > 0) {
            toast.success(`Duração de ${result.success} vídeo(s) atualizada com sucesso!`);
            // Recarregar a página após 2 segundos para mostrar as novas durações
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      } catch (err) {
        console.error("Erro ao verificar/atualizar vídeos:", err);
      }
    };
    
    // Executar a verificação quando o componente montar
    verificarEAtualizarVideos();
    */
  }, [aulaId]);
  
  // Este componente não renderiza nada
  return null;
};

export default AtualizarDuracoesAutomaticamente;
