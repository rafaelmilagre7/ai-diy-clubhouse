
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useSuggestionComments = (suggestionId?: string) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!suggestionId) {
      return [];
    }

    try {
      console.log('Buscando comentários para sugestão:', suggestionId);
      
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
      
      return data || [];
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

    if (!suggestionId) {
      toast.error('ID da sugestão não encontrado');
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
