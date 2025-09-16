import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAllVideoDurations } from '@/triggers/updateVideoDurations';
import { toast } from 'sonner';

/**
 * Hook para atualizar durações de vídeos com invalidação de cache
 */
export const useUpdateVideoDurations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAllVideoDurations,
    onSuccess: (success) => {
      if (success) {
        // Invalidar caches relacionados para recarregar dados com durações atualizadas
        queryClient.invalidateQueries({ queryKey: ['unified-certificates'] });
        queryClient.invalidateQueries({ queryKey: ['course-stats'] });
        queryClient.invalidateQueries({ queryKey: ['learning-lessons'] });
        queryClient.invalidateQueries({ queryKey: ['learning-courses'] });
        
        console.log('✅ Caches invalidados após atualização de durações');
        
        // Recarregar página após 3 segundos para garantir que as durações sejam refletidas
        setTimeout(() => {
          toast.info('Recarregando página para mostrar durações atualizadas...');
          window.location.reload();
        }, 3000);
      }
    },
    onError: (error) => {
      console.error('❌ Erro no hook de atualização:', error);
    }
  });
};