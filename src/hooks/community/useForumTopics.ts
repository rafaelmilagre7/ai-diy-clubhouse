
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CommunityFilterType, UseCommunityTopicsParams } from "@/types/communityTypes";

export const useForumTopics = ({ 
  activeTab, 
  selectedFilter, 
  searchQuery, 
  categorySlug 
}: UseCommunityTopicsParams) => {
  const { data: topics, isLoading, error, refetch } = useQuery({
    queryKey: ['forumTopics', activeTab, selectedFilter, searchQuery, categorySlug],
    queryFn: async () => {
      try {
        console.log('Carregando tópicos do fórum...', { 
          activeTab, 
          selectedFilter, 
          searchQuery, 
          categorySlug 
        });
        
        let query = supabase
          .from('forum_topics')
          .select(`
            *,
            profiles:user_id(name, avatar_url),
            forum_categories:category_id(name, slug)
          `);

        // Filtrar por categoria específica se informada
        if (categorySlug && categorySlug !== "todos") {
          query = query.eq('forum_categories.slug', categorySlug);
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
          console.error("Erro ao buscar tópicos:", error.message);
          throw error;
        }
        
        console.log('Tópicos carregados:', data?.length || 0);
        return data || [];
      } catch (error: any) {
        console.error("Erro ao buscar tópicos:", error.message);
        toast.error("Não foi possível carregar os tópicos. Por favor, tente novamente.");
        return [];
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
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
