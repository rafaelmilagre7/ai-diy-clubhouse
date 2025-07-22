
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useLogging } from '@/hooks/useLogging';

export const useAddModuleComment = (solutionId: string, moduleId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { logError, log } = useLogging();
  const queryClient = useQueryClient();

  const addComment = async (content: string, parentId: string | null = null) => {
    if (!user) {
      toast.error('Você precisa estar logado para comentar');
      return false;
    }
    
    if (!content.trim()) {
      toast.error('O comentário não pode estar vazio');
      return false;
    }
    
    try {
      setIsSubmitting(true);
      log('Adicionando comentário', { solutionId, moduleId, parentId });
      
      const commentData = {
        solution_id: solutionId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId
      };
      
      const { error, data } = await supabase
        .from('solution_comments')
        .insert(commentData)
        .select();
        
      if (error) {
        logError('Erro ao adicionar comentário', error);
        toast.error(`Erro ao adicionar comentário: ${error.message}`);
        return false;
      }
      
      log('Comentário adicionado com sucesso', { commentId: data?.[0]?.id });
      toast.success(parentId ? 'Resposta enviada com sucesso!' : 'Comentário enviado com sucesso!');
      
      // Invalidar o cache para atualizar a lista imediatamente
      queryClient.invalidateQueries({ 
        queryKey: ['solution-comments', solutionId, moduleId] 
      });
      
      // Forçar uma segunda atualização após um pequeno delay
      // para garantir que todos os dados estejam atualizados
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          queryKey: ['solution-comments', solutionId, moduleId] 
        });
      }, 500);
      
      return true;
    } catch (error: any) {
      logError('Erro ao adicionar comentário', error);
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    addComment,
    isSubmitting
  };
};
