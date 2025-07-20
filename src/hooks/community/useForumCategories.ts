
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ForumCategory } from "@/types/forumTypes";

export const useForumCategories = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['forum-categories'],
    queryFn: async (): Promise<ForumCategory[]> => {
      try {
        console.log('Buscando categorias do fórum...');
        
        const { data, error } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        
        if (error) {
          console.error("Erro ao buscar categorias:", error.message);
          throw error;
        }
        
        console.log('Categorias carregadas:', data?.length || 0);
        return data || [];
      } catch (error: any) {
        console.error("Erro ao buscar categorias:", error.message);
        toast.error("Não foi possível carregar as categorias. Por favor, tente novamente.");
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    retry: 2,
    refetchOnWindowFocus: false
  });
  
  return {
    categories: data || [],
    isLoading,
    error,
    refetch
  };
};
