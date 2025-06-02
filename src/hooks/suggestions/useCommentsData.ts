
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export const useCommentsData = (type: string, id?: string) => {
  const fetchComments = async () => {
    if (!id || type !== 'suggestion') return [];

    const { data, error } = await supabase
      .from('suggestion_comments')
      .select(`
        *,
        profiles:user_id(name, avatar_url)
      `)
      .eq('suggestion_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const {
    data: comments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['comments', type, id],
    queryFn: fetchComments,
    enabled: !!id && type === 'suggestion'
  });

  return {
    comments,
    isLoading,
    error,
    refetch
  };
};
