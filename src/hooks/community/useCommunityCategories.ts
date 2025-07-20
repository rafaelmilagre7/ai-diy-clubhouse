
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CommunityCategory } from "@/types/communityTypes";

export const useCommunityCategories = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['community-categories'],
    queryFn: async (): Promise<CommunityCategory[]> => {
      try {
        console.log('Buscando categorias da comunidade...');
        
        const { data, error } = await supabase
          .from('community_categories')
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
    staleTime: 1000 * 60 * 3, // 3 minutos de cache
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
