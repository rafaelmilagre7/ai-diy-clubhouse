
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useCommentsData = (type: string, id?: string) => {
  const {
    data: comments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['comments', type, id],
    queryFn: async () => {
      if (!id || type !== 'suggestion') return [];
      
      console.log('Buscando comentários para sugestão:', id);
      
      const { data, error } = await supabase
        .from('suggestion_comments')
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
        .eq('suggestion_id', id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar comentários:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!id && type === 'suggestion',
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  return {
    comments,
    isLoading,
    error,
    refetch
  };
};
