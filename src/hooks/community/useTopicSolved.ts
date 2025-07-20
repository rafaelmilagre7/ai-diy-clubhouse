import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTopicSolved } from '@/lib/supabase/rpc';
import { toast } from 'sonner';

export const useTopicSolved = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: toggleTopicSolved,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['community-topics'] });
        queryClient.invalidateQueries({ queryKey: ['community-topic'] });
        
        const message = data.is_solved 
          ? 'Tópico marcado como resolvido!' 
          : 'Tópico desmarcado como resolvido!';
        
        toast.success(message);
      } else {
        toast.error(data.error || 'Erro ao alterar status do tópico');
      }
    },
    onError: (error: any) => {
      toast.error('Erro ao alterar status do tópico: ' + error.message);
    }
  });

  return {
    toggleSolved: mutation.mutateAsync,
    isLoading: mutation.isPending
  };
};