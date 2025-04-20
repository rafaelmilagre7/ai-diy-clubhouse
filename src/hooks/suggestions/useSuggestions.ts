
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Suggestion } from '@/types/suggestionTypes';

export const useSuggestions = () => {
  const fetchSuggestions = async (): Promise<Suggestion[]> => {
    console.log('Buscando sugestões...');
    
    try {
      const { data, error } = await supabase
        .from('suggestions_with_profiles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Erro ao buscar sugestões:', error);
        throw new Error(`Erro ao buscar sugestões: ${error.message}`);
      }
      
      console.log('Sugestões carregadas:', data?.length || 0);
      return data as Suggestion[];
    } catch (error: any) {
      console.error('Erro não esperado ao buscar sugestões:', error);
      throw error;
    }
  };

  const { data = [], isLoading, error, refetch } = useQuery({
    queryKey: ['suggestions'],
    queryFn: fetchSuggestions,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    suggestions: data,
    isLoading,
    error,
    refetch
  };
};
