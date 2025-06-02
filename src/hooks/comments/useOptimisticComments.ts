
import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Comment } from '@/types/commentTypes';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';
import { toast } from 'sonner';

interface OptimisticComment extends Comment {
  isOptimistic?: boolean;
  isSending?: boolean;
}

export const useOptimisticComments = (queryKey: string[]) => {
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();
  const { log } = useLogging();
  const [optimisticComments, setOptimisticComments] = useState<OptimisticComment[]>([]);

  const addOptimisticComment = useCallback((content: string, parentId?: string) => {
    if (!user || !profile) return null;

    const optimisticComment: OptimisticComment = {
      id: `optimistic-${Date.now()}`,
      content: content.trim(),
      user_id: user.id,
      tool_id: '', // Will be set by the calling component
      parent_id: parentId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: 0,
      user_has_liked: false,
      profiles: {
        id: user.id,
        name: profile.name || 'Você',
        avatar_url: profile.avatar_url || null,
        role: profile.role || 'member'
      },
      replies: [],
      isOptimistic: true,
      isSending: true
    };

    setOptimisticComments(prev => [optimisticComment, ...prev]);
    log('Comentário otimista adicionado', { commentId: optimisticComment.id });
    
    return optimisticComment;
  }, [user, profile, log]);

  const confirmOptimisticComment = useCallback((optimisticId: string, realComment: Comment) => {
    setOptimisticComments(prev => 
      prev.filter(comment => comment.id !== optimisticId)
    );
    
    // Invalidar queries para buscar dados atualizados do servidor
    queryClient.invalidateQueries({ queryKey });
    
    log('Comentário confirmado pelo servidor', { optimisticId, realId: realComment.id });
  }, [queryClient, queryKey, log]);

  const removeOptimisticComment = useCallback((optimisticId: string) => {
    setOptimisticComments(prev => 
      prev.filter(comment => comment.id !== optimisticId)
    );
    
    toast.error('Erro ao enviar comentário. Tente novamente.');
    log('Comentário otimista removido por erro', { optimisticId });
  }, [log]);

  const getCommentsWithOptimistic = useCallback((serverComments: Comment[]): OptimisticComment[] => {
    // Combinar comentários do servidor com comentários otimistas
    const combined = [...optimisticComments, ...serverComments];
    
    // Remover duplicatas e ordenar por data
    const unique = combined.filter((comment, index, array) => 
      array.findIndex(c => c.id === comment.id) === index
    );
    
    return unique.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [optimisticComments]);

  return {
    addOptimisticComment,
    confirmOptimisticComment,
    removeOptimisticComment,
    getCommentsWithOptimistic,
    hasOptimisticComments: optimisticComments.length > 0
  };
};
