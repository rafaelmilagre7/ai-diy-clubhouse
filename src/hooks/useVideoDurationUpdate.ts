import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateVideoDurations } from '@/triggers/updateVideoDurations';
import { toast } from 'sonner';

/**
 * Hook para atualizar durações de vídeos com feedback visual e invalidação de cache
 */
export const useVideoDurationUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId?: string) => {
      console.log('🎯 Iniciando atualização de durações...', { lessonId });
      toast.info('Iniciando atualização das durações dos vídeos...');
      
      const result = await updateVideoDurations(lessonId);
      
      if (result) {
        console.log('✅ Atualização concluída com sucesso!');
        toast.success('Durações dos vídeos atualizadas com sucesso!');
        
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
    onSuccess: () => {
      console.log('🎉 Hook de atualização concluído com sucesso!');
    },
    onError: (error: any) => {
      console.error('❌ Erro no hook de atualização:', error);
      toast.error(`Erro na atualização: ${error.message || 'Erro desconhecido'}`);
    }
  });
};

/**
 * Hook para atualização em lote de todas as durações
 */
export const useUpdateAllVideoDurations = () => {
  return useVideoDurationUpdate();
};