
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { Comment } from "@/types/learningTypes";

export const useLessonComments = (lessonId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Buscar comentários da aula
  const { 
    data: comments = [], 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['lesson-comments', lessonId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('learning_comments')
          .select(`
            *,
            profiles:user_id (
              id,
              name,
              avatar_url,
              role
            )
          `)
          .eq('lesson_id', lessonId as any)
          .eq('is_hidden', false)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        // Verificar quais comentários o usuário curtiu
        let userLikes: any[] = [];
        if (user) {
          const { data: likesData, error: likesError } = await supabase
            .from('learning_comment_likes')
            .select('comment_id')
            .eq('user_id', user.id as any);
          
          if (!likesError && likesData) {
            userLikes = likesData;
          }
        }
        
        const likedCommentIds = new Set(userLikes.map(like => like.comment_id));
        
        // Verificar se o comentário pertence ao usuário atual ou se o usuário é admin/formacao
        const canDelete = (comment: any) => {
          if (!user) return false;
          return comment.user_id === user.id || 
            (user && ['admin', 'formacao'].includes(user?.role || ''));
        };
        
        // Processar comentários com informações adicionais
        return (data as any || []).map((comment: any) => {
          // Buscar respostas para este comentário
          const replies = (data as any || [])
            .filter((c: any) => c.parent_id === comment.id)
            .map((reply: any) => ({
              ...reply,
              profiles: reply.profiles,
              user_has_liked: likedCommentIds.has(reply.id),
              can_delete: canDelete(reply),
              replies: [] // Respostas não têm sub-respostas
            }));
            
          return {
            ...comment,
            profiles: comment.profiles,
            replies,
            user_has_liked: likedCommentIds.has(comment.id),
            can_delete: canDelete(comment)
          };
        }).filter((comment: any) => !comment.parent_id); // Retornar apenas comentários principais
        
      } catch (error) {
        console.error('Erro ao buscar comentários:', error);
        throw error;
      }
    },
    enabled: !!lessonId
  });
  
  // Adicionar comentário
  const addComment = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string | null }) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('learning_comments')
        .insert({
          lesson_id: lessonId,
          user_id: user.id,
          content,
          parent_id: parentId || null
        } as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', lessonId] });
      toast.success('Comentário adicionado com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar comentário:', error);
      toast.error('Erro ao adicionar comentário');
    }
  });
  
  // Curtir/descurtir comentário
  const likeComment = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar se já curtiu
      const { data: existingLike } = await supabase
        .from('learning_comment_likes')
        .select('id')
        .eq('user_id', user.id as any)
        .eq('comment_id', commentId as any)
        .single();
      
      if (existingLike) {
        // Remover curtida
        await supabase
          .from('learning_comment_likes')
          .delete()
          .eq('user_id', user.id as any)
          .eq('comment_id', commentId as any);
        
        // Decrementar contador
        await supabase.rpc('decrement', {
          row_id: commentId,
          table_name: 'learning_comments',
          column_name: 'likes_count'
        });
      } else {
        // Adicionar curtida
        await supabase
          .from('learning_comment_likes')
          .insert({ 
            user_id: user.id, 
            comment_id: commentId 
          } as any);
        
        // Incrementar contador
        await supabase.rpc('increment', {
          row_id: commentId,
          table_name: 'learning_comments',
          column_name: 'likes_count'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', lessonId] });
    },
    onError: (error: any) => {
      console.error('Erro ao curtir comentário:', error);
      toast.error('Erro ao curtir comentário');
    }
  });
  
  // Excluir comentário
  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const { error } = await supabase
        .from('learning_comments')
        .delete()
        .eq('id', commentId as any);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-comments', lessonId] });
      toast.success('Comentário excluído com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao excluir comentário:', error);
      toast.error('Erro ao excluir comentário');
    }
  });
  
  return {
    comments,
    isLoading,
    error,
    addComment: async (content: string, parentId?: string | null) => {
      return addComment.mutateAsync({ content, parentId });
    },
    deleteComment: async (commentId: string) => {
      return deleteComment.mutateAsync(commentId);
    },
    likeComment: async (commentId: string) => {
      return likeComment.mutateAsync(commentId);
    },
    isSubmitting: addComment.isPending,
    isLiking: likeComment.isPending,
    isDeleting: deleteComment.isPending
  };
};
