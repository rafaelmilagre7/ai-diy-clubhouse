import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useOptimizedCertificateGeneration } from './useOptimizedCertificateGeneration';

export const useOptimizedCourseDurationSync = () => {
  const queryClient = useQueryClient();
  const { generateWithRetry, updateProgress, generationState, loadingState, cancelGeneration } = 
    useOptimizedCertificateGeneration({
      maxAttempts: 2,
      timeoutMs: 60000, // 1 minuto por tentativa
      showProgress: true
    });

  const syncAllCourses = useCallback(async () => {
    try {
      const result = await generateWithRetry(async () => {
        updateProgress('Conectando com API...', 10);

        console.log('🚀 Iniciando sincronização otimizada de durações');
        
        const { data, error } = await supabase.functions.invoke('calculate-course-durations', {
          body: { syncAll: true }
        });

        if (error) {
          console.error('❌ Erro na edge function:', error);
          throw new Error(error.message || 'Erro na sincronização');
        }

        updateProgress('Processando resultados...', 80);

        console.log('✅ Resposta da sincronização:', data);
        
        if (!data.success) {
          throw new Error(data.error || 'Sincronização falhou');
        }

        updateProgress('Atualizando cache...', 90);

        // Invalidar caches relacionados
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['course-durations'] }),
          queryClient.invalidateQueries({ queryKey: ['unified-certificates'] }),
          queryClient.invalidateQueries({ queryKey: ['course-stats'] }),
          queryClient.invalidateQueries({ queryKey: ['learning-courses'] }),
          queryClient.invalidateQueries({ queryKey: ['learning-lesson-videos'] })
        ]);

        updateProgress('Concluído!', 100);

        const { globalStats } = data;
        
        return {
          successfulCourses: globalStats?.successfulCourses || 0,
          failedCourses: globalStats?.failedCourses || 0,
          totalVideosSynced: globalStats?.totalVideosSynced || 0,
          totalFormattedDuration: data.totalFormattedDuration || '0min'
        };
      }, 'sincronização de durações');

      if (result) {
        toast.success(
          `🎉 Sincronização concluída!`,
          {
            description: `${result.successfulCourses} cursos atualizados, ${result.totalVideosSynced} vídeos sincronizados, ${result.totalFormattedDuration} de conteúdo`
          }
        );

        return result;
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ Erro no hook de sincronização:', error);
      throw error;
    }
  }, [generateWithRetry, updateProgress, queryClient]);

  return {
    syncAllCourses,
    generationState,
    loadingState,
    cancelGeneration,
    isProcessing: generationState.isGenerating || loadingState.isLoading
  };
};