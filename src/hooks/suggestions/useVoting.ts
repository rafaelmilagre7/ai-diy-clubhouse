
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { enhancedToast } from '@/components/suggestions/notifications/EnhancedToastProvider';

export const useVoting = () => {
  const [voteLoading, setVoteLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async ({ suggestionId, voteType }: { suggestionId: string, voteType: 'upvote' | 'downvote' }) => {
      if (!user) {
        throw new Error("Você precisa estar logado para votar.");
      }

      try {
        setVoteLoading(true);
        console.log("Votando:", { voteType, suggestionId, userId: user.id });
        
        const { data: existingVote } = await supabase
          .from('suggestion_votes')
          .select('id, vote_type')
          .eq('suggestion_id', suggestionId)
          .eq('user_id', user.id)
          .maybeSingle();
          
        const { error: voteError } = await supabase
          .from('suggestion_votes')
          .upsert({
            suggestion_id: suggestionId,
            user_id: user.id,
            vote_type: voteType,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'suggestion_id,user_id'
          });

        if (voteError) throw voteError;
        
        // Atualizar contagem de votos
        if (!existingVote) {
          // Novo voto
          if (voteType === 'upvote') {
            await supabase.rpc('increment_suggestion_upvote', { suggestion_id: suggestionId });
          } else {
            await supabase.rpc('increment_suggestion_downvote', { suggestion_id: suggestionId });
          }
        } else if (existingVote.vote_type !== voteType) {
          // Mudança de voto
          if (voteType === 'upvote') {
            await supabase.rpc('increment_suggestion_upvote', { suggestion_id: suggestionId });
            await supabase.rpc('decrement_suggestion_downvote', { suggestion_id: suggestionId });
          } else {
            await supabase.rpc('increment_suggestion_downvote', { suggestion_id: suggestionId });
            await supabase.rpc('decrement_suggestion_upvote', { suggestion_id: suggestionId });
          }
        }
        
        return { success: true, voteType };
      } finally {
        setVoteLoading(false);
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['suggestions-enhanced'] });
      queryClient.invalidateQueries({ queryKey: ['suggestions-optimized'] });
      queryClient.invalidateQueries({ queryKey: ['suggestion'] });
      
      // Use enhanced toast with animation
      enhancedToast.voting(data.voteType);
    },
    onError: (error: any) => {
      console.error('Erro ao votar:', error);
      enhancedToast.error(
        "Erro ao votar", 
        error.message || "Não foi possível registrar seu voto. Tente novamente."
      );
    }
  });

  return {
    voteLoading,
    voteMutation
  };
};
