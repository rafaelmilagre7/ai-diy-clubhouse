
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
}

export const useCategories = () => {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true as any)
        .order('order_index');

      if (error) throw error;
      return (data as unknown) as Category[];
    }
  });

  return {
    categories: categories || [],
    isLoading,
    error
  };
};
