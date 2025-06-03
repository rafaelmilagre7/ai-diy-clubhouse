
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useLogging } from '@/hooks/useLogging';
import { Comment } from '@/types/learningTypes';

export const useCommentSync = (lessonId: string) => {
  const queryClient = useQueryClient();
  const { log, logError } = useLogging();
  
  const queryKey = ['learning-comments', lessonId];

  // Sincronizar comentário específico
  const syncComment = useCallback(async (commentData: Partial<Comment>) => {
    try {
      log('Sincronizando comentário', { lessonId, commentId: commentData.id });
      
      const { data, error } = await supabase
        .from('learning_comments')
        .upsert(commentData)
        .select()
        .single();

      if (error) throw error;

      // Atualizar cache local
      queryClient.setQueryData(queryKey, (oldData: Comment[] | undefined) => {
        if (!oldData) return [data];
        
        const existingIndex = oldData.findIndex(c => c.id === data.id);
        if (existingIndex >= 0) {
          const newData = [...oldData];
          newData[existingIndex] = data;
          return newData;
        }
        
        return [data, ...oldData];
      });

      log('Comentário sincronizado com sucesso', { commentId: data.id });
      return data;
      
    } catch (error) {
      logError('Erro ao sincronizar comentário', { error, lessonId });
      throw error;
    }
  }, [lessonId, queryClient, queryKey, log, logError]);

  // Invalidar cache e recarregar
  const invalidateAndReload = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
    log('Cache de comentários invalidado', { lessonId });
  }, [queryClient, queryKey, lessonId, log]);

  return {
    syncComment,
    invalidateAndReload
  };
};
