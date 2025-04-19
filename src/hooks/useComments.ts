
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useComments = ({ suggestionId }: { suggestionId: string }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
          profiles:user_id(name, avatar_url)
        `)
        .eq('suggestion_id', suggestionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar comentários:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!suggestionId
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
    
    try {
      setIsSubmitting(true);
      
      // Inserir comentário
      const { data, error } = await supabase
        .from('suggestion_comments')
        .insert({
          suggestion_id: suggestionId,
          user_id: user.id,
          content: comment.trim(),
          is_official: false,
          is_hidden: false
        })
        .select();
        
      if (error) throw error;
      
      // Incrementar contador de comentários na sugestão
      const { error: updateError } = await supabase
        .from('suggestions')
        .update({ comment_count: supabase.rpc('increment', { 
          row_id: suggestionId, 
          table: 'suggestions', 
          column: 'comment_count' 
        }) })
        .eq('id', suggestionId);
        
      if (updateError) {
        console.error("Erro ao atualizar contagem de comentários:", updateError);
      }
      
      toast.success("Comentário adicionado com sucesso!");
      setComment('');
      refetchComments();
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      
    } catch (error: any) {
      console.error('Erro ao adicionar comentário:', error);
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
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
