
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface VoteMutationParams {
  suggestionId: string;
  voteType: 'upvote' | 'downvote';
}

export const useVoting = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async ({ suggestionId, voteType }: VoteMutationParams) => {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Iniciando votação:', { suggestionId, voteType, userId: user.id });

      // Verificar se já existe um voto
      const { data: existingVote, error: fetchError } = await supabase
        .from('suggestion_votes')
        .select('*')
        .eq('suggestion_id', suggestionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Erro ao buscar voto existente:', fetchError);
        throw fetchError;
      }

      console.log('Voto existente:', existingVote);

      // Se já votou igual, remover o voto
      if (existingVote && existingVote.vote_type === voteType) {
        const { error: deleteError } = await supabase
          .from('suggestion_votes')
          .delete()
          .eq('id', existingVote.id);

        if (deleteError) {
          console.error('Erro ao remover voto:', deleteError);
          throw deleteError;
        }

        // Atualizar contadores da sugestão
        if (voteType === 'upvote') {
          await supabase.rpc('decrement_suggestion_upvote', { suggestion_id: suggestionId });
        } else {
          await supabase.rpc('decrement_suggestion_downvote', { suggestion_id: suggestionId });
        }

        console.log('Voto removido com sucesso');
        return { action: 'removed', voteType };
      }

      // Se já votou diferente, atualizar o voto
      if (existingVote && existingVote.vote_type !== voteType) {
        const { error: updateError } = await supabase
          .from('suggestion_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);

        if (updateError) {
          console.error('Erro ao atualizar voto:', updateError);
          throw updateError;
        }

        // Decrementar contador anterior e incrementar novo
        if (existingVote.vote_type === 'upvote') {
          await supabase.rpc('decrement_suggestion_upvote', { suggestion_id: suggestionId });
          await supabase.rpc('increment_suggestion_downvote', { suggestion_id: suggestionId });
        } else {
          await supabase.rpc('decrement_suggestion_downvote', { suggestion_id: suggestionId });
          await supabase.rpc('increment_suggestion_upvote', { suggestion_id: suggestionId });
        }

        console.log('Voto atualizado com sucesso');
        return { action: 'updated', voteType };
      }

      // Criar novo voto
      const { error: insertError } = await supabase
        .from('suggestion_votes')
        .insert({
          suggestion_id: suggestionId,
          user_id: user.id,
          vote_type: voteType
        });

      if (insertError) {
        console.error('Erro ao criar voto:', insertError);
        throw insertError;
      }

      // Incrementar contador da sugestão
      if (voteType === 'upvote') {
        await supabase.rpc('increment_suggestion_upvote', { suggestion_id: suggestionId });
      } else {
        await supabase.rpc('increment_suggestion_downvote', { suggestion_id: suggestionId });
      }

      console.log('Novo voto criado com sucesso');
      return { action: 'created', voteType };
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['suggestion'] });
      queryClient.invalidateQueries({ queryKey: ['suggestions-optimized'] });
      
      // Mostrar feedback para o usuário
      const messages = {
        created: {
          upvote: 'Voto positivo registrado!',
          downvote: 'Voto negativo registrado!'
        },
        updated: {
          upvote: 'Voto alterado para positivo!',
          downvote: 'Voto alterado para negativo!'
        },
        removed: {
          upvote: 'Voto positivo removido!',
          downvote: 'Voto negativo removido!'
        }
      };

      const message = messages[data.action][data.voteType];
      toast.success(message);
    },
    onError: (error: any) => {
      console.error('Erro na votação:', error);
      toast.error(`Erro ao votar: ${error.message}`);
    }
  });

  return {
    voteMutation,
    voteLoading: voteMutation.isPending
  };
};
