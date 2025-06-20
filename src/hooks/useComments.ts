
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useComments = (suggestionId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const {
    data: comments = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['suggestion-comments', suggestionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suggestion_comments')
        .select(`
          *,
          profiles:user_id(name, avatar_url)
        `)
        .eq('suggestion_id', suggestionId as any)
        .eq('is_hidden', false as any)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar comentários:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!suggestionId
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) {
        throw new Error("Você precisa estar logado para comentar.");
      }

      if (!content.trim()) {
        throw new Error("O comentário não pode estar vazio.");
      }

      console.log("Adicionando comentário:", { suggestionId, content, userId: user.id });

      // Inserir comentário
      const { data, error } = await supabase
        .from('suggestion_comments')
        .insert({
          suggestion_id: suggestionId,
          user_id: user.id,
          content: content.trim(),
          is_official: false,
          is_hidden: false
        } as any)
        .select();

      if (error) {
        console.error("Erro ao adicionar comentário:", error);
        throw error;
      }

      // Incrementar contador de comentários
      const { error: updateError } = await supabase
        .from('suggestions')
        .update({
          comment_count: supabase.rpc('increment' as any)
        } as any)
        .eq('id', suggestionId as any);

      if (updateError) {
        console.error("Erro ao atualizar contador:", updateError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestion-comments', suggestionId] });
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      setNewComment('');
      toast.success("Comentário adicionado com sucesso!");
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar comentário:', error);
      toast.error(`Erro ao adicionar comentário: ${error.message}`);
    }
  });

  return {
    comments,
    isLoading,
    error,
    newComment,
    setNewComment,
    addComment: (content: string) => addCommentMutation.mutateAsync(content),
    isAddingComment: addCommentMutation.isPending
  };
};
