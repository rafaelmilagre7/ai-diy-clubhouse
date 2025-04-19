
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Suggestion, SuggestionCategory } from '@/types/suggestionTypes';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export const useSuggestions = (categoryId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'popular' | 'recent'>('popular');
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: suggestions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['suggestions', categoryId, filter],
    queryFn: async () => {
      console.log('Buscando sugestões...', { categoryId, filter });
      
      let query = supabase
        .from('suggestions')
        .select(`
          *,
          profiles:user_id(name, avatar_url),
          category:category_id(name)
        `);

      // Se o usuário não estiver logado ou não for admin, mostre apenas sugestões públicas
      if (!user) {
        query = query.eq('is_hidden', false);
      }
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (filter === 'popular') {
        query = query.order('upvotes', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar sugestões:', error);
        throw error;
      }

      console.log('Sugestões encontradas:', data?.length, data);
      return data || [];
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 1, // 1 minuto
  });

  const {
    data: categories = [],
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['suggestion-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suggestion_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }

      return data || [];
    },
  });

  const submitSuggestionMutation = useMutation({
    mutationFn: async (values: {
      title: string;
      description: string;
      category_id: string;
      image_url?: string;
    }) => {
      if (!user) {
        throw new Error("Você precisa estar logado para criar uma sugestão.");
      }

      console.log("Enviando sugestão:", values);

      const { data, error } = await supabase
        .from('suggestions')
        .insert({
          ...values,
          user_id: user.id,
          status: 'new',
          upvotes: 1, // Começa com um upvote do próprio criador
          downvotes: 0,
          is_hidden: false
        })
        .select();

      if (error) {
        console.error("Erro ao criar sugestão:", error);
        throw error;
      }
      
      console.log("Sugestão criada com sucesso:", data);
      
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

  const voteMutation = useMutation({
    mutationFn: async ({ suggestionId, voteType }: { suggestionId: string, voteType: 'upvote' | 'downvote' }) => {
      if (!user) {
        throw new Error("Você precisa estar logado para votar.");
      }

      // Verificar se o usuário já votou nesta sugestão
      const { data: existingVote, error: checkError } = await supabase
        .from('suggestion_votes')
        .select('vote_type')
        .eq('suggestion_id', suggestionId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) {
        console.error("Erro ao verificar voto existente:", checkError);
        throw checkError;
      }
      
      // Inserir ou atualizar o voto
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

      if (voteError) {
        console.error("Erro ao registrar voto:", voteError);
        throw voteError;
      }
      
      // Atualizar contagem de votos na tabela suggestions
      let updates: any = {};
      
      if (!existingVote) {
        // Novo voto
        if (voteType === 'upvote') {
          updates.upvotes = supabase.rpc('increment', { row_id: suggestionId, table: 'suggestions', column: 'upvotes' });
        } else {
          updates.downvotes = supabase.rpc('increment', { row_id: suggestionId, table: 'suggestions', column: 'downvotes' });
        }
      } else if (existingVote.vote_type !== voteType) {
        // Mudança de voto
        if (voteType === 'upvote') {
          // Mudou de downvote para upvote
          await supabase.rpc('increment', { row_id: suggestionId, table: 'suggestions', column: 'upvotes' });
          await supabase.rpc('decrement', { row_id: suggestionId, table: 'suggestions', column: 'downvotes' });
        } else {
          // Mudou de upvote para downvote
          await supabase.rpc('increment', { row_id: suggestionId, table: 'suggestions', column: 'downvotes' });
          await supabase.rpc('decrement', { row_id: suggestionId, table: 'suggestions', column: 'upvotes' });
        }
      }
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
      toast.success("Seu voto foi registrado!");
    },
    onError: (error: any) => {
      console.error('Erro ao votar:', error);
      toast.error(`Erro ao votar: ${error.message}`);
    }
  });

  const submitSuggestion = async (values: {
    title: string;
    description: string;
    category_id: string;
    image_url?: string;
  }) => {
    return submitSuggestionMutation.mutateAsync(values);
  };

  const vote = async (suggestionId: string, voteType: 'upvote' | 'downvote') => {
    return voteMutation.mutateAsync({ suggestionId, voteType });
  };

  // Forçar refetch quando o componente montar
  useEffect(() => {
    refetch().catch(console.error);
  }, [refetch]);

  return {
    suggestions,
    categories,
    isLoading: isLoading || categoriesLoading || submitSuggestionMutation.isPending || voteMutation.isPending,
    error,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    submitSuggestion,
    vote,
    refetch
  };
};
