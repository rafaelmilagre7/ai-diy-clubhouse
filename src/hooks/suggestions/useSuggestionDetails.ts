
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export const useSuggestionDetails = () => {
  const { id } = useParams<{ id: string }>();

  const fetchSuggestionDetails = async () => {
    if (!id) {
      throw new Error('ID da sugestão não fornecido');
    }

    console.log('Buscando detalhes da sugestão:', id);

    const { data, error } = await supabase
      .from('suggestions')
      .select(`
        *,
        profiles(name, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar detalhes da sugestão:', error);
      throw new Error(`Erro ao buscar sugestão: ${error.message}`);
    }

    if (!data) {
      throw new Error('Sugestão não encontrada');
    }

    console.log('Detalhes da sugestão carregados:', data);
    return data;
  };

  const {
    data: suggestion,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['suggestion-details', id],
    queryFn: fetchSuggestionDetails,
    enabled: !!id,
    staleTime: 1000 * 30, // 30 segundos
    retry: 2
  });

  return {
    suggestion,
    isLoading,
    error,
    refetch
  };
};
