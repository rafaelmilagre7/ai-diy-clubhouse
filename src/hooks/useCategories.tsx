
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string;
}

export const useCategories = () => {
  const fetchCategories = async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('forum_categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data as Category[];
  };

  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: fetchCategories,
    meta: {
      onError: (err: Error) => {
        console.error("Erro ao buscar categorias:", err.message);
      }
    }
  });

  return {
    categories,
    isLoading,
    error
  };
};
