
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Suggestion, SuggestionCategory } from '@/types/suggestionTypes';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

export const useSuggestions = (categoryId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
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

      return data;
    },
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

  const submitSuggestion = async (values: {
    title: string;
    description: string;
    category_id: string;
    image_url?: string;
  }) => {
    if (!user) {
      toast({
        title: "Erro ao criar sugestão",
        description: "Você precisa estar logado para criar uma sugestão.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('suggestions')
        .insert({
          ...values,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Sugestão criada",
        description: "Sua sugestão foi enviada com sucesso!"
      });

      refetch();
    } catch (error: any) {
      console.error('Erro ao criar sugestão:', error);
      toast({
        title: "Erro ao criar sugestão",
        description: error.message || "Ocorreu um erro ao enviar sua sugestão.",
        variant: "destructive"
      });
    }
  };

  const vote = async (suggestionId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) {
      toast({
        title: "Erro ao votar",
        description: "Você precisa estar logado para votar.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('suggestion_votes')
        .upsert({
          suggestion_id: suggestionId,
          user_id: user.id,
          vote_type: voteType
        }, {
          onConflict: 'suggestion_id,user_id'
        });

      if (error) throw error;

      refetch();
    } catch (error: any) {
      console.error('Erro ao votar:', error);
      toast({
        title: "Erro ao votar",
        description: error.message || "Ocorreu um erro ao registrar seu voto.",
        variant: "destructive"
      });
    }
  };

  return {
    suggestions,
    categories,
    isLoading: isLoading || categoriesLoading,
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
