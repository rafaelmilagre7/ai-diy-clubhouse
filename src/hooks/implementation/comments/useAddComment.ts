
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useAddComment = (solutionId: string, moduleId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const { logError, log } = useLogging();

  const addComment = async (content: string, parentId?: string) => {
    if (!content.trim()) {
      toast.error('O comentário não pode estar vazio');
      return false;
    }

    try {
      setIsSubmitting(true);
      
      // Verificamos se a tabela tool_comments existe
      const { data: checkTable } = await supabase
        .from('tool_comments')
        .select('id')
        .limit(1);
      
      // Use a tabela tool_comments em vez de solution_comments
      const tableName = checkTable !== null ? 'tool_comments' : 'solution_comments';
      const idField = 'tool_id';
      log(`Usando tabela ${tableName} para adicionar comentário`, { solutionId, moduleId });
      
      const userData = await supabase.auth.getUser();
      const user = userData.data.user;
      
      if (!user) {
        toast.error('Você precisa estar logado para comentar');
        return false;
      }
      
      const commentData = {
        [idField]: solutionId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId || null
      };
      
      const { error } = await supabase
        .from(tableName)
        .insert(commentData);
        
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
