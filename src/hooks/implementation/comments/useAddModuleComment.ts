
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
        tool_id: solutionId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId
      };
      
      const { data, error } = await supabase
        .from('tool_comments')
        .insert(commentData)
        .select();
        
      if (error) {
        logError('Erro ao adicionar comentário', error);
        toast.error(`Erro ao adicionar comentário: ${error.message}`);
        return false;
      }
      
      log('Comentário adicionado com sucesso', { data });
      toast.success(parentId ? 'Resposta enviada com sucesso!' : 'Comentário enviado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
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
