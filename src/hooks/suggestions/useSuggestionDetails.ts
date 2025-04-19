
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface UserVote {
  id: string;
  vote_type: 'upvote' | 'downvote';
}

export const useSuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [voteLoading, setVoteLoading] = useState(false);
  const [userVote, setUserVote] = useState<UserVote | null>(null);

  const {
    data: suggestion,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['suggestion', id],
    queryFn: async () => {
      if (!id) throw new Error('ID da sugestão não fornecido');
      
      console.log('Buscando sugestão com ID:', id);
      
      // Usar a view suggestions_with_profiles para obter os dados com perfil
      const { data, error } = await supabase
        .from('suggestions_with_profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar sugestão:', error);
        throw error;
      }
      
      console.log('Dados da sugestão encontrados:', data);
      return data;
    },
    enabled: !!id,
  });

  // Buscar voto do usuário atual
  useEffect(() => {
    if (!user || !id) return;
    
    const fetchUserVote = async () => {
      const { data, error } = await supabase
        .from('suggestion_votes')
        .select('id, vote_type')
        .eq('suggestion_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Erro ao buscar voto do usuário:", error);
        return;
      }
      
      setUserVote(data as UserVote);
    };
    
    fetchUserVote();
  }, [id, user]);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast.error("Você precisa estar logado para votar.");
      return;
    }

    if (!id) return;
    
    try {
      setVoteLoading(true);
      
      const { data: existingVote, error: checkError } = await supabase
        .from('suggestion_votes')
        .select('id, vote_type')
        .eq('suggestion_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      const { data: voteData, error: voteError } = await supabase
        .from('suggestion_votes')
        .upsert({
          suggestion_id: id,
          user_id: user.id,
          vote_type: voteType,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'suggestion_id,user_id'
        })
        .select();

      if (voteError) throw voteError;
      
      if (!existingVote) {
        if (voteType === 'upvote') {
          await supabase.rpc('increment_suggestion_upvote', { suggestion_id: id });
        } else {
          await supabase.rpc('increment_suggestion_downvote', { suggestion_id: id });
        }
      } else if (existingVote.vote_type !== voteType) {
        if (voteType === 'upvote') {
          await supabase.rpc('increment_suggestion_upvote', { suggestion_id: id });
          await supabase.rpc('decrement_suggestion_downvote', { suggestion_id: id });
        } else {
          await supabase.rpc('increment_suggestion_downvote', { suggestion_id: id });
          await supabase.rpc('decrement_suggestion_upvote', { suggestion_id: id });
        }
      }
      
      setUserVote({ 
        id: existingVote?.id || (voteData && voteData[0]?.id) || '', 
        vote_type: voteType 
      });
      
      toast.success(`Seu voto foi registrado!`);
      refetch();
    } catch (error: any) {
      console.error('Erro ao votar:', error);
      toast.error(error.message || "Ocorreu um erro ao registrar seu voto.");
    } finally {
      setVoteLoading(false);
    }
  };

  return {
    suggestion,
    isLoading,
    error,
    userVote,
    voteLoading,
    handleVote,
    refetch, // Adicionando a função refetch ao objeto retornado
  };
};
