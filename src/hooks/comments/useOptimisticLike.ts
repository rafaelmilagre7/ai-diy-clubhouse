import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type CommentTable = 'tool_comments' | 'learning_comments' | 'solution_comments';
type LikeTable = 'tool_comment_likes' | 'learning_comment_likes' | 'solution_comment_likes';

interface UseOptimisticLikeOptions {
  commentTable: CommentTable;
  likeTable: LikeTable;
  queryKey: (string | undefined)[];
}

export const useOptimisticLike = ({ commentTable, likeTable, queryKey }: UseOptimisticLikeOptions) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const likeComment = async (commentId: string, currentLiked: boolean, currentCount: number) => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir comentários');
      return;
    }

    // Prevenir múltiplos cliques
    if (processingIds.has(commentId)) return;

    setProcessingIds(prev => new Set(prev).add(commentId));

    // 🎯 UPDATE OTIMISTA - Atualização instantânea da UI
    const optimisticUpdate = (data: any[]) => {
      return data.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            user_has_liked: !currentLiked,
            likes_count: currentLiked ? Math.max(0, currentCount - 1) : currentCount + 1
          };
        }
        // Atualizar também nas respostas, se houver
        if (comment.replies && Array.isArray(comment.replies)) {
          return {
            ...comment,
            replies: comment.replies.map((reply: any) => 
              reply.id === commentId 
                ? { ...reply, user_has_liked: !currentLiked, likes_count: currentLiked ? Math.max(0, currentCount - 1) : currentCount + 1 }
                : reply
            )
          };
        }
        return comment;
      });
    };

    // Aplicar update otimista
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (!oldData) return oldData;
      return optimisticUpdate(oldData);
    });

    try {
      if (currentLiked) {
        // ❌ Remover curtida
        const { error: deleteError } = await supabase
          .from(likeTable)
          .delete()
          .match({ user_id: user.id, comment_id: commentId });

        if (deleteError) throw deleteError;

        // Atualizar contador
        const { error: updateError } = await supabase
          .from(commentTable)
          .update({ likes_count: Math.max(0, currentCount - 1) })
          .eq('id', commentId);

        if (updateError) throw updateError;

      } else {
        // ✅ Adicionar curtida
        const { error: insertError } = await supabase
          .from(likeTable)
          .insert({ user_id: user.id, comment_id: commentId });

        if (insertError) throw insertError;

        // Atualizar contador
        const { error: updateError } = await supabase
          .from(commentTable)
          .update({ likes_count: currentCount + 1 })
          .eq('id', commentId);

        if (updateError) throw updateError;
      }

      // ✅ Sucesso - invalidar query para sincronizar com o servidor
      queryClient.invalidateQueries({ queryKey });

    } catch (error: any) {
      // 🔄 ROLLBACK - Reverter para o estado anterior
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((comment: any) => {
          if (comment.id === commentId) {
            return { ...comment, user_has_liked: currentLiked, likes_count: currentCount };
          }
          if (comment.replies && Array.isArray(comment.replies)) {
            return {
              ...comment,
              replies: comment.replies.map((reply: any) => 
                reply.id === commentId 
                  ? { ...reply, user_has_liked: currentLiked, likes_count: currentCount }
                  : reply
              )
            };
          }
          return comment;
        });
      });

      console.error('Erro ao processar curtida:', error);
      
      // Retry automático após 1 segundo
      setTimeout(() => {
        toast.error('Não foi possível processar sua curtida', {
          action: {
            label: 'Tentar novamente',
            onClick: () => likeComment(commentId, currentLiked, currentCount)
          }
        });
      }, 100);

    } finally {
      // Remover do conjunto de processamento após 500ms (tempo para animação completar)
      setTimeout(() => {
        setProcessingIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentId);
          return newSet;
        });
      }, 500);
    }
  };

  return { 
    likeComment,
    isProcessing: (commentId: string) => processingIds.has(commentId)
  };
};
