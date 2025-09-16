import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook para invalidar caches após atualização de durações de vídeos
 */
export const useVideoDurationRefresh = () => {
  const queryClient = useQueryClient();

  const refreshAfterSync = async () => {
    try {
      console.log('🔄 Invalidando caches após sincronização de durações...');
      
      // Invalidar todos os caches relacionados a certificados e durações
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['unified-certificates'] }),
        queryClient.invalidateQueries({ queryKey: ['course-stats'] }),
        queryClient.invalidateQueries({ queryKey: ['learning-lessons'] }),
        queryClient.invalidateQueries({ queryKey: ['learning-courses'] }),
        queryClient.invalidateQueries({ queryKey: ['learning-lesson-videos'] }),
        queryClient.invalidateQueries({ queryKey: ['course-duration'] }),
        queryClient.invalidateQueries({ queryKey: ['solution-certificates'] })
      ]);
      
      console.log('✅ Caches invalidados com sucesso');
      
      // Mostrar notificação de sucesso
      setTimeout(() => {
        toast.info('📄 Certificados atualizados com novas durações');
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao invalidar caches:', error);
      return false;
    }
  };

  return { refreshAfterSync };
};