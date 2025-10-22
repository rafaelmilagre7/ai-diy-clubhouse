
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useSuggestionCreation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const submitSuggestionMutation = useMutation({
    mutationFn: async (values: {
      title: string;
      description: string;
      category_id: string;
    }) => {
      if (!user) {
        throw new Error("Você precisa estar logado para criar uma sugestão.");
      }

      if (!values.category_id) {
        throw new Error("A categoria é obrigatória.");
      }

      setIsSubmitting(true);
      
      try {
        const { data, error } = await supabase
          .from('suggestions')
          .insert({
            ...values,
            user_id: user.id,
            status: 'new',
            upvotes: 1,
            downvotes: 0,
            is_hidden: false
          })
          .select();

        if (error) {
          console.error("Erro ao criar sugestão:", error);
          throw new Error(error.message || "Erro ao criar sugestão");
        }
        
        // Registrar o voto automático do criador
        if (data && data.length > 0) {
          const { error: voteError } = await supabase
            .from('suggestion_votes')
            .insert({
              suggestion_id: data[0].id,
              user_id: user.id,
              vote_type: 'upvote'
            });
            
          if (voteError) {
            console.error("Erro ao registrar voto do criador:", voteError);
          }
        }
        
        return data;
      } catch (error: any) {
        console.error("Erro durante a criação da sugestão:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a sugestões para garantir refresh
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
    onError: (error: any) => {
      console.error('Erro ao criar sugestão:', error);
      toast.error(`Erro ao criar sugestão: ${error.message}`);
    }
  });

  return {
    isSubmitting,
    submitSuggestion: submitSuggestionMutation.mutateAsync
  };
};
