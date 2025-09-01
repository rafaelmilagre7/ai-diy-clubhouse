/**
 * Hook robusto para queries de vídeo com tratamento de erros avançado
 * Resolve problemas de cache corrompido e colunas inexistentes
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { devLog } from '@/hooks/useOptimizedLogging';
import { toast } from 'sonner';
import { useClearLearningCache } from './useClearLearningCache';

interface UseRobustVideoQueryOptions {
  lessonId?: string;
  retryOnSchemaError?: boolean;
  enableFallback?: boolean;
}

export const useRobustVideoQuery = ({
  lessonId,
  retryOnSchemaError = true,
  enableFallback = true
}: UseRobustVideoQueryOptions) => {
  const queryClient = useQueryClient();
  const { forceVideoDataReload, clearAllLearningCache } = useClearLearningCache();

  return useQuery({
    queryKey: ['learning-lesson-videos-robust', lessonId],
    queryFn: async () => {
      if (!lessonId) return [];

      try {
        devLog(`🎬 [ROBUST-QUERY] Buscando vídeos para lesson: ${lessonId}`);

        // Primeira tentativa - query normal
        const { data, error } = await supabase
          .from('learning_lesson_videos')
          .select('*')
          .eq('lesson_id', lessonId)
          .order('order_index', { ascending: true });

        if (error) {
          devLog('❌ [ROBUST-QUERY] Erro na primeira tentativa:', error);

          // Detectar erro de coluna inexistente
          if (error.message?.includes('video_url does not exist') || 
              error.message?.includes('column') && error.message?.includes('does not exist')) {
            
            devLog('🚨 [SCHEMA-ERROR] Detectado erro de esquema/cache corrompido!');
            
            if (retryOnSchemaError) {
              toast.error('Cache corrompido detectado', {
                description: 'Limpando cache e tentando novamente...'
              });
              
              // Limpar cache completamente
              await clearAllLearningCache();
              
              // Aguardar um pouco
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Segunda tentativa após limpeza
              const retryResult = await supabase
                .from('learning_lesson_videos')
                .select('*')
                .eq('lesson_id', lessonId)
                .order('order_index', { ascending: true });
              
              if (retryResult.error) {
                devLog('❌ [ROBUST-QUERY] Erro na segunda tentativa:', retryResult.error);
                throw new Error(`Erro persistente: ${retryResult.error.message}`);
              }
              
              devLog('✅ [ROBUST-QUERY] Sucesso na segunda tentativa');
              return retryResult.data || [];
            }
          }
          
          throw error;
        }

        devLog('✅ [ROBUST-QUERY] Sucesso na primeira tentativa');
        return data || [];
        
      } catch (error) {
        devLog('❌ [ROBUST-QUERY] Erro final:', error);
        
        if (enableFallback) {
          devLog('🔄 [FALLBACK] Tentando query alternativa...');
          
          try {
            // Fallback: buscar da tabela de lessons com join
            const fallbackResult = await supabase
              .from('learning_lessons')
              .select(`
                id,
                learning_lesson_videos (*)
              `)
              .eq('id', lessonId)
              .maybeSingle();
            
            if (fallbackResult.data && fallbackResult.data.learning_lesson_videos) {
              devLog('✅ [FALLBACK] Sucesso com query alternativa');
              return fallbackResult.data.learning_lesson_videos;
            }
          } catch (fallbackError) {
            devLog('❌ [FALLBACK] Erro na query alternativa:', fallbackError);
          }
        }
        
        // Se tudo falhar, retornar array vazio para não quebrar a UI
        devLog('⚠️ [ROBUST-QUERY] Retornando array vazio como último recurso');
        return [];
      }
    },
    enabled: !!lessonId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: (failureCount, error) => {
      // Não fazer retry automático em erros de esquema
      if (error?.message?.includes('does not exist')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};