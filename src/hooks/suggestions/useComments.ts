
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface UseCommentsProps {
  suggestionId: string;
}

export const useComments = ({ suggestionId }: UseCommentsProps) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!suggestionId) {
      return [];
    }

    try {
      console.log('Buscando comentários para sugestão:', suggestionId);
      
      // Buscar comentários principais primeiro
      const { data, error } = await supabase
        .from('suggestion_comments')
        .select(`
          *,
          profiles:user_id(name, avatar_url)
        `)
        .eq('suggestion_id', suggestionId)
        .is('parent_id', null)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar comentários:', error);
        throw new Error(`Erro ao buscar comentários: ${error.message}`);
      }
      
      const commentsWithReplies = await Promise.all(
        data.map(async (comment) => {
          // Buscar respostas para cada comentário
          const { data: replies, error: repliesError } = await supabase
            .from('suggestion_comments')
            .select(`
              *,
              profiles:user_id(name, avatar_url)
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });
          
          if (repliesError) {
            console.error('Erro ao buscar respostas:', repliesError);
            return { ...comment, replies: [] };
          }
          
          return { ...comment, replies: replies || [] };
        })
      );
      
      return commentsWithReplies;
    } catch (error: any) {
      console.error('Erro não esperado ao buscar comentários:', error);
      throw error;
    }
  };

  const { data: comments = [], isLoading: commentsLoading, refetch: refetchComments } = useQuery({
    queryKey: ['suggestion-comments', suggestionId],
    queryFn: fetchComments,
    enabled: !!suggestionId,
    staleTime: 1000 * 60 // 1 minuto
  });

  const handleSubmitComment = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

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
      console.log('Enviando comentário para sugestão:', suggestionId);
      
      const { error } = await supabase
        .from('suggestion_comments')
        .insert({
          suggestion_id: suggestionId,
          user_id: user.id,
          content: comment.trim()
        });
      
      if (error) {
        console.error('Erro ao enviar comentário:', error);
        toast.error(`Erro ao enviar comentário: ${error.message}`);
        return;
      }
      
      // Incrementar contagem de comentários na sugestão
      await supabase
        .from('suggestions')
        .update({ comment_count: supabase.rpc('increment', { row_id: suggestionId, table_name: 'suggestions', column_name: 'comment_count' }) })
        .eq('id', suggestionId);
      
      setComment('');
      toast.success('Comentário enviado com sucesso');
      
      // Recarregar comentários
      refetchComments();
    } catch (error: any) {
      console.error('Erro não esperado ao enviar comentário:', error);
      toast.error('Erro ao enviar comentário');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    comment,
    setComment,
    comments,
    commentsLoading,
    isSubmitting,
    handleSubmitComment,
    refetchComments
  };
};
