
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const useForumCategories = () => {
  return useQuery({
    queryKey: ['forumCategories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        console.error("Erro ao buscar categorias:", error.message);
        toast.error("Não foi possível carregar as categorias. Por favor, tente novamente.");
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    retry: 2
  });
};
