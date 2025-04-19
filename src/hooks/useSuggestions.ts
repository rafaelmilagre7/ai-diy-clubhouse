
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
        `)
        .eq('is_hidden', false);

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

      console.log('Sugestões encontradas:', data);
      return data;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
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

      return data;
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

      const { data, error } = await supabase
        .from('suggestions')
        .insert({
          ...values,
          user_id: user.id
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast("Sugestão criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
    onError: (error: any) => {
      console.error('Erro ao criar sugestão:', error);
      toast(`Erro ao criar sugestão: ${error.message}`);
    }
  });

  const voteMutation = useMutation({
    mutationFn: async ({ suggestionId, voteType }: { suggestionId: string, voteType: 'upvote' | 'downvote' }) => {
      if (!user) {
        throw new Error("Você precisa estar logado para votar.");
      }

      const { data, error } = await supabase
        .from('suggestion_votes')
        .upsert({
          suggestion_id: suggestionId,
          user_id: user.id,
          vote_type: voteType
        }, {
          onConflict: 'suggestion_id,user_id'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    },
    onError: (error: any) => {
      console.error('Erro ao votar:', error);
      toast(`Erro ao votar: ${error.message}`);
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
