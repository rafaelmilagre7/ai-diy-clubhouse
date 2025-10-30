
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CommunityFilterType, UseCommunityTopicsParams } from "@/types/communityTypes";
import { devLog, devWarn } from "@/hooks/useOptimizedLogging";

export const useCommunityTopics = ({ 
  activeTab, 
  selectedFilter, 
  searchQuery, 
  categorySlug 
}: UseCommunityTopicsParams) => {
  const { data: topics, isLoading, error, refetch } = useQuery({
    queryKey: ['community-topics', activeTab, selectedFilter, searchQuery, categorySlug],
    queryFn: async () => {
      try {
        devLog('Carregando tópicos da comunidade...', { 
          activeTab, 
          selectedFilter, 
          searchQuery, 
          categorySlug 
        });
        
        let query = supabase
          .from('community_topics')
          .select(`
            *,
            profiles_community_public!community_topics_user_id_fkey(id, name, avatar_url),
            community_categories!community_topics_category_id_fkey(name, slug)
          `);

        // Filtrar por categoria específica se informada
        if (categorySlug && categorySlug !== "todos") {
          // Primeiro buscar o ID da categoria pelo slug
          const { data: categoryData, error: categoryError } = await supabase
            .from('community_categories')
            .select('id')
            .eq('slug', categorySlug)
            .maybeSingle();
          
          if (categoryError) {
            devWarn("Erro ao buscar categoria:", categoryError.message);
            throw new Error(`Categoria '${categorySlug}' não encontrada`);
          }
          
          if (categoryData) {
            query = query.eq('category_id', categoryData.id);
          }
        }

        // Filtrar por tópicos do usuário atual se necessário
        if (activeTab === "my-topics") {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            query = query.eq('user_id', user.id);
          }
        }

        // Filtrar por busca se houver
        if (searchQuery.trim()) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        // Aplicar filtros específicos
        switch (selectedFilter) {
          case "recentes":
            query = query.order('created_at', { ascending: false });
            break;
          case "populares":
            query = query.order('view_count', { ascending: false });
            break;
          case "sem-respostas":
            query = query.eq('reply_count', 0);
            break;
          case "resolvidos":
            query = query.eq('is_solved', true);
            break;
        }

        // Ordenação adicional para manter consistência
        if (selectedFilter !== "recentes") {
          query = query.order('created_at', { ascending: false });
        }

        // Ordenar por is_pinned primeiro
        query = query.order('is_pinned', { ascending: false });

        // Limitar resultados
        query = query.limit(50);

        const { data, error } = await query;
        
        if (error) {
          devWarn("Erro ao buscar tópicos:", error.message);
          throw error;
        }
        
        devLog('Tópicos carregados:', data?.length || 0);
        return data || [];
      } catch (error: any) {
        devWarn("Erro ao buscar tópicos:", error.message);
        toast.error("Não foi possível carregar os tópicos. Por favor, tente novamente.");
        return [];
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (aumentado)
    retry: 2,
    refetchOnWindowFocus: false
  });
  
  return {
    topics: topics || [],
    isLoading,
    error,
    refetch
  };
};
