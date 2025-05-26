
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ForumCategory } from "@/types/forumTypes";

export const useForumCategories = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['forumCategories'],
    queryFn: async (): Promise<ForumCategory[]> => {
      try {
        console.log('🔍 Buscando categorias do fórum...');
        
        const { data, error } = await supabase
          .from('forum_categories')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        
        if (error) {
          console.error("❌ Erro ao buscar categorias:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        
        console.log('✅ Categorias carregadas:', data?.length || 0);
        return data || [];
      } catch (error: any) {
        console.error("💥 Erro detalhado ao buscar categorias:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        
        // Retornar array vazio em caso de erro para não quebrar a UI
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    retry: 1, // Reduzir tentativas
    refetchOnWindowFocus: false,
    enabled: true // Sempre habilitado
  });
  
  return {
    categories: data || [],
    isLoading,
    error,
    refetch
  };
};
