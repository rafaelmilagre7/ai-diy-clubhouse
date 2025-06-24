
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useLogging } from '@/hooks/useLogging';
import { toast } from 'sonner';
import { Comment } from '@/types/commentTypes';
import { useRealtimeComments } from './useRealtimeComments';

export const useSolutionComments = (solutionId: string, moduleId: string = 'general') => {
  const { user } = useAuth();
  const { log, logError } = useLogging();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configurar real-time
  useRealtimeComments(solutionId, moduleId, true);

  // Buscar comentários
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['solution-comments', solutionId, moduleId],
    queryFn: async () => {
      if (!solutionId) return [];

      log('Buscando comentários da solução', { solutionId, moduleId });

      try {
        // Buscar comentários principais
        const { data: parentComments, error: parentError } = await supabase
          .from('tool_comments')
          .select(`
            *,
            profiles:user_id (
              id,
              name,
              avatar_url,
              role
            )
          `)
          .eq('tool_id', solutionId as any)
          .is('parent_id', null)
          .order('created_at', { ascending: false });

        if (parentError) throw parentError;

        // Buscar respostas
        const { data: replies, error: repliesError } = await supabase
          .from('tool_comments')
          .select(`
            *,
            profiles:user_id (
              id,
              name,
              avatar_url,
              role
            )
          `)
          .eq('tool_id', solutionId as any)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });

        if (repliesError) throw repliesError;

        // Verificar curtidas do usuário atual
        let likesMap: Record<string, boolean> = {};
        if (user) {
          const allCommentIds = [
            ...(parentComments || []).map((c: any) => c.id),
            ...(replies || []).map((r: any) => r.id)
          ];

          if (allCommentIds.length > 0) {
            const { data: userLikes } = await supabase
              .from('tool_comment_likes')
              .select('comment_id')
              .eq('user_id', user.id as any)
              .in('comment_id', allCommentIds as any);

            likesMap = (userLikes || []).reduce((acc: Record<string, boolean>, like: any) => {
              acc[like.comment_id] = true;
              return acc;
            }, {});
          }
        }

        // Organizar comentários com respostas
        const organizedComments = (parentComments || []).map((parentComment: any) => ({
          ...parentComment,
          user_has_liked: !!likesMap[parentComment.id],
          replies: (replies || [])
            .filter((reply: any) => reply.parent_id === parentComment.id)
            .map((reply: any) => ({
              ...reply,
              user_has_liked: !!likesMap[reply.id]
            }))
        }));

        log('Comentários organizados', { count: organizedComments.length });
        return organizedComments;
      } catch (error) {
        logError('Erro ao buscar comentários da solução', error);
        throw error;
      }
    },
    enabled: !!solutionId
  });

  // Enviar comentário
  const handleSubmitComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para comentar');
      return;
    }

    if (!comment.trim()) {
      toast.error('O comentário não pode estar vazio');
      return;
    }

    try {
      setIsSubmitting(true);

      const commentData = {
        tool_id: solutionId,
        user_id: user.id,
        content: comment.trim(),
        ...(replyTo && { parent_id: replyTo.id })
      };

      const { error } = await supabase
        .from('tool_comments')
        .insert(commentData as any);

      if (error) throw error;

      toast.success('Comentário adicionado com sucesso!');
      
      // Invalidar queries para atualização
      queryClient.invalidateQueries({ 
        queryKey: ['solution-comments', solutionId, moduleId] 
      });
      
      // Limpar formulário
      setComment('');
      setReplyTo(null);

    } catch (error: any) {
      logError('Erro ao adicionar comentário', error);
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Curtir comentário
  const likeComment = async (commentObj: Comment) => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir');
      return;
    }

    try {
      if (commentObj.user_has_liked) {
        // Remover curtida
        await supabase
          .from('tool_comment_likes')
          .delete()
          .eq('comment_id', commentObj.id as any)
          .eq('user_id', user.id as any);
      } else {
        // Adicionar curtida
        await supabase
          .from('tool_comment_likes')
          .insert({
            comment_id: commentObj.id,
            user_id: user.id
          } as any);
      }

      // Invalidar queries para atualização
      queryClient.invalidateQueries({ 
        queryKey: ['solution-comments', solutionId, moduleId] 
      });

    } catch (error: any) {
      logError('Erro ao curtir comentário', error);
      toast.error('Erro ao processar curtida');
    }
  };

  // Deletar comentário
  const deleteComment = async (commentObj: Comment) => {
    if (!user || user.id !== commentObj.user_id) {
      toast.error('Você só pode deletar seus próprios comentários');
      return;
    }

    try {
      const { error } = await supabase
        .from('tool_comments')
        .delete()
        .eq('id', commentObj.id as any);

      if (error) throw error;

      toast.success('Comentário removido com sucesso!');
      
      // Invalidar queries para atualização
      queryClient.invalidateQueries({ 
        queryKey: ['solution-comments', solutionId, moduleId] 
      });

    } catch (error: any) {
      logError('Erro ao deletar comentário', error);
      toast.error('Erro ao remover comentário');
    }
  };

  return {
    comments,
    isLoading,
    comment,
    setComment,
    replyTo,
    isSubmitting,
    handleSubmitComment,
    setReplyTo,
    likeComment,
    deleteComment
  };
};
