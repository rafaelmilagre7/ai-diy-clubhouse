
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Comment } from '@/types/commentTypes';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { useLogging } from '@/hooks/useLogging';

export const useSolutionComments = (solutionId: string, moduleId: string) => {
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
        
        // Buscar comentários principais
        const { data: parentComments, error: parentError } = await supabase
          .from('solution_comments')
          .select(`
            *,
            profiles:user_id(name, avatar_url, role)
          `)
          .eq('solution_id', solutionId)
          .is('parent_id', null)
          .order('created_at', { ascending: false });

        if (parentError) throw parentError;

        // Buscar respostas
        const { data: replies, error: repliesError } = await supabase
          .from('solution_comments')
          .select(`
            *,
            profiles:user_id(name, avatar_url, role)
          `)
          .eq('solution_id', solutionId)
          .not('parent_id', 'is', null)
          .order('created_at', { ascending: true });

        if (repliesError) throw repliesError;
        
        // Verificar curtidas do usuário
        let userLikes: Record<string, boolean> = {};
        
        if (user) {
          const { data: likes } = await supabase
            .from('solution_comment_likes')
            .select('comment_id')
            .eq('user_id', user.id);
            
          if (likes) {
            userLikes = likes.reduce((acc: Record<string, boolean>, like) => {
              acc[like.comment_id] = true;
              return acc;
            }, {});
          }
        }

        // Organizar respostas dentro dos comentários principais
        const organizedComments = parentComments.map((comment: Comment) => ({
          ...comment,
          user_has_liked: !!userLikes[comment.id],
          replies: replies
            .filter((reply: Comment) => reply.parent_id === comment.id)
            .map((reply: Comment) => ({
              ...reply,
              user_has_liked: !!userLikes[reply.id]
            }))
        }));

        return organizedComments;
      } catch (error) {
        logError('Erro ao buscar comentários', error);
        throw error;
      }
    }
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
      
      const commentData = {
        solution_id: solutionId,
        user_id: user.id,
        content: comment.trim(),
        parent_id: replyTo ? replyTo.id : null,
        module_id: moduleId
      };
      
      const { error } = await supabase
        .from('solution_comments')
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

  const likeComment = async (commentObj: Comment) => {
    if (!user) {
      toast.error('Você precisa estar logado para curtir comentários');
      return;
    }

    try {
      if (commentObj.user_has_liked) {
        const { error } = await supabase
          .from('solution_comment_likes')
          .delete()
          .eq('comment_id', commentObj.id)
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        await supabase
          .from('solution_comments')
          .update({ likes_count: commentObj.likes_count - 1 })
          .eq('id', commentObj.id);
      } else {
        const { error } = await supabase
          .from('solution_comment_likes')
          .insert({
            comment_id: commentObj.id,
            user_id: user.id
          });
          
        if (error) throw error;
        
        await supabase
          .from('solution_comments')
          .update({ likes_count: commentObj.likes_count + 1 })
          .eq('id', commentObj.id);
      }
      
      refetch();
    } catch (error: any) {
      logError('Erro ao curtir comentário', error);
      toast.error(`Erro ao curtir comentário: ${error.message}`);
    }
  };

  const deleteComment = async (commentObj: Comment) => {
    if (!user) return;
    
    if (commentObj.user_id !== user.id) {
      toast.error('Você só pode excluir seus próprios comentários');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('solution_comments')
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
    setReplyTo,
    likeComment,
    deleteComment
  };
};
