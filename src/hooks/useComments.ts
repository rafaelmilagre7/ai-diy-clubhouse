
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    name?: string;
    avatar_url?: string;
  };
}

interface UseCommentsProps {
  suggestionId: string;
}

export const useComments = ({ suggestionId }: UseCommentsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: comments = [],
    isLoading: commentsLoading,
    refetch: refetchComments
  } = useQuery({
    queryKey: ['suggestion-comments', suggestionId],
    queryFn: async () => {
      if (!suggestionId) return [];
      
      const { data, error } = await supabase
        .from('suggestion_comments')
        .select(`
          *,
          user:user_id(id, email, name, avatar_url)
        `)
        .eq('suggestion_id', suggestionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
  });

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar logado para comentar.");
      return;
    }

    if (!comment.trim()) {
      toast.error("O comentário não pode estar vazio.");
      return;
    }

    setIsSubmitting(true);

    try {
      await supabase
        .from('suggestion_comments')
        .insert({
          suggestion_id: suggestionId,
          user_id: user.id,
          content: comment.trim()
        });

      setComment('');
      refetchComments();
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      
      toast.success("Comentário enviado com sucesso!");
    } catch (error: any) {
      console.error('Erro ao comentar:', error);
      toast.error(error.message || "Ocorreu um erro ao enviar seu comentário.");
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
    handleSubmitComment
  };
};
