
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types/commentTypes';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useLogging } from '@/hooks/useLogging';

export const useModuleComments = (solutionId: string, moduleId: string) => {
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { log, logError } = useLogging();

  const {
    data: comments = [],
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['solution-comments', solutionId, moduleId],
    queryFn: async () => {
      try {
        log('Buscando comentários da solução', { solutionId, moduleId });
        
        // Usar sempre a tabela tool_comments
        const tableName = 'tool_comments';
        const idField = 'tool_id';
        
        // Buscar todos os comentários principais (sem parent_id)
        const { data: parentComments, error: parentError } = await supabase
          .from(tableName)
          .select(`
            *,
            profiles:user_id(name, avatar_url, role)
          `)
          .eq(idField, solutionId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });

        if (parentError) throw parentError;

        // Buscar todas as respostas (com parent_id)
        const { data: replies, error: repliesError } = await supabase
          .from(tableName)
          .select(`
            *,
            profiles:user_id(name, avatar_url, role)
          `)
          .eq(idField, solutionId)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });

        if (repliesError) throw repliesError;
        
        // Se o usuário estiver logado, verificar quais comentários ele curtiu
        let userLikes: Record<string, boolean> = {};
        
        if (user) {
          const { data: likes, error: likesError } = await supabase
            .from(`${tableName.replace('comments', 'comment')}_likes`)
            .select('comment_id')
            .eq('user_id', user.id);
            
          if (!likesError && likes) {
            userLikes = likes.reduce((acc: Record<string, boolean>, like) => {
              acc[like.comment_id] = true;
              return acc;
            }, {});
          }
        }
        
        // Adicionar a propriedade de curtida do usuário aos comentários
        const commentsWithLikes = (parentComments || []).map((comment: Comment) => ({
          ...comment,
          user_has_liked: !!userLikes[comment.id]
        }));
        
        const repliesWithLikes = (replies || []).map((reply: Comment) => ({
          ...reply,
          user_has_liked: !!userLikes[reply.id]
        }));
        
        // Organizar as respostas dentro dos comentários principais
        const organizedComments = commentsWithLikes.map((parentComment: Comment) => {
          const commentReplies = repliesWithLikes.filter(
            (reply: Comment) => reply.parent_id === parentComment.id
          );
          
          return {
            ...parentComment,
            replies: commentReplies
          };
        });

        log('Comentários carregados com sucesso', { 
          total: organizedComments.length,
          parentComments: parentComments?.length || 0,
          replies: replies?.length || 0
        });
        
        return organizedComments;
      } catch (error) {
        logError('Erro ao buscar comentários', error);
        return [];
      }
    },
    staleTime: 30000, // 30 segundos
    enabled: !!solutionId && !!moduleId
  });

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
      
      // Usar sempre a tabela tool_comments
      const tableName = 'tool_comments';
      const idField = 'tool_id';
      
      const commentData = {
        [idField]: solutionId,
        user_id: user.id,
        content: comment.trim(),
        parent_id: replyTo ? replyTo.id : null
      };
      
      const { error } = await supabase
        .from(tableName)
        .insert(commentData);
        
      if (error) throw error;
      
      toast.success(replyTo ? 'Resposta enviada com sucesso!' : 'Comentário enviado com sucesso!');
      setComment('');
      setReplyTo(null);
      refetch();
      
    } catch (error: any) {
      logError('Erro ao adicionar comentário', error);
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startReply = (commentObj: Comment) => {
    setReplyTo(commentObj);
    document.getElementById('comment-input')?.focus();
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const likeComment = async (commentObj: Comment) => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir comentários');
      return;
    }

    try {
      const tableName = 'tool_comment_likes';
      const alreadyLiked = commentObj.user_has_liked;
      
      if (alreadyLiked) {
        // Remover curtida
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('comment_id', commentObj.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        // Decrementar contador
        await supabase
          .rpc('decrement', { 
            row_id: commentObj.id, 
            table_name: 'tool_comments', 
            column_name: 'likes_count'
          });
          
      } else {
        // Adicionar curtida
        const { error } = await supabase
          .from(tableName)
          .insert({
            comment_id: commentObj.id,
            user_id: user.id
          });
          
        if (error) throw error;
        
        // Incrementar contador
        await supabase
          .rpc('increment', { 
            row_id: commentObj.id, 
            table_name: 'tool_comments', 
            column_name: 'likes_count'
          });
      }
      
      refetch();
    } catch (error: any) {
      logError('Erro ao curtir comentário', error);
      toast.error(`Erro ao curtir comentário: ${error.message}`);
    }
  };
  
  const deleteComment = async (commentObj: Comment) => {
    if (!user) return;
    
    // Verificar se o usuário é o autor do comentário
    if (commentObj.user_id !== user.id) {
      toast.error('Você só pode excluir seus próprios comentários');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('tool_comments')
        .delete()
        .eq('id', commentObj.id);
        
      if (error) throw error;
      
      toast.success('Comentário excluído com sucesso');
      refetch();
    } catch (error: any) {
      logError('Erro ao excluir comentário', error);
      toast.error(`Erro ao excluir comentário: ${error.message}`);
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
    startReply,
    cancelReply,
    likeComment,
    deleteComment
  };
};
