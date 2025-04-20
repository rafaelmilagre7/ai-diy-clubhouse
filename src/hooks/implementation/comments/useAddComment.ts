
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useAddComment = (solutionId: string, moduleId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { logError } = useLogging();

  const addComment = async (content: string, parentId?: string) => {
    if (!content.trim()) {
      toast.error('O comentário não pode estar vazio');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('solution_comments')
        .insert({
          solution_id: solutionId,
          module_id: moduleId,
          content: content.trim(),
          parent_id: parentId || null,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });
        
      if (error) throw error;
      
      toast.success(parentId ? 'Resposta enviada com sucesso!' : 'Comentário enviado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['solution-comments', solutionId, moduleId] });
      
      return true;
    } catch (error) {
      logError('Erro ao adicionar comentário', error);
      toast.error('Erro ao enviar comentário. Tente novamente.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { addComment, isSubmitting };
};
