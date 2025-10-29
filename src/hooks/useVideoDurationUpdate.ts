import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateVideoDurations } from '@/triggers/updateVideoDurations';
import { 
  showModernLoading,
  showModernSuccess,
  showModernError,
  dismissModernToast
} from '@/lib/toast-helpers';

/**
 * Hook para atualizar durações de vídeos com feedback visual e invalidação de cache
 */
export const useVideoDurationUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId?: string) => {
      console.log('🎯 Iniciando atualização de durações...', { lessonId });
      
      const result = await updateVideoDurations(lessonId);
      
      if (result) {
        console.log('✅ Atualização concluída com sucesso!');
        
        // Invalidar caches relacionados para recarregar dados
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['unified-certificates'] }),
          queryClient.invalidateQueries({ queryKey: ['course-stats'] }),
          queryClient.invalidateQueries({ queryKey: ['learning-lessons'] }),
          queryClient.invalidateQueries({ queryKey: ['learning-courses'] }),
          queryClient.invalidateQueries({ queryKey: ['learning-lesson-videos'] })
        ]);
        
        console.log('🔄 Caches invalidados após atualização');
        
        return result;
      }
      
      throw new Error('Atualização falhou');
    },
    onMutate: () => {
      const loadingId = showModernLoading(
        'Sincronizando vídeos...',
        'Atualizando durações com API do Panda Video'
      );
      return { loadingId };
    },
    onSuccess: (data, variables, context) => {
      console.log('🎉 Hook de atualização concluído com sucesso!');
      
      if (context?.loadingId) {
        dismissModernToast(context.loadingId);
      }
      
      // Tentar extrair estatísticas do resultado
      let totalUpdated = 0;
      let totalSkipped = 0;
      
      if (typeof data === 'object' && data !== null) {
        totalUpdated = (data as any).updated || (data as any).success || 0;
        totalSkipped = (data as any).skipped || 0;
      }
      
      showModernSuccess(
        'Sincronização concluída!',
        `${totalUpdated} vídeo(s) atualizados${totalSkipped > 0 ? `, ${totalSkipped} já sincronizados` : ''}`
      );
    },
    onError: (error: any, variables, context) => {
      console.error('❌ Erro no hook de atualização:', error);
      
      if (context?.loadingId) {
        dismissModernToast(context.loadingId);
      }
      
      showModernError(
        'Erro na sincronização',
        error.message || 'Não foi possível atualizar as durações dos vídeos'
      );
    }
  });
};

/**
 * Hook para atualização em lote de todas as durações
 */
export const useUpdateAllVideoDurations = () => {
  return useVideoDurationUpdate();
};