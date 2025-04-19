
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

      setIsSubmitting(true);
      
      try {
        console.log("Enviando sugestão:", values);

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

        if (error) throw error;
        
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
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      toast.success("Sugestão criada com sucesso!");
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
