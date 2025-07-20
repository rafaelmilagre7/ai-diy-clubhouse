
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export type TopicFilterType = "recentes" | "populares" | "sem-respostas" | "resolvidos";

interface UseForumTopicsParams {
  activeTab: "all" | "my-topics";
  selectedFilter: TopicFilterType;
  searchQuery: string;
}

export const useForumTopics = ({ activeTab, selectedFilter, searchQuery }: UseForumTopicsParams) => {
  const { data: topics, isLoading, error } = useQuery({
    queryKey: ['forumTopics', activeTab, selectedFilter, searchQuery],
    queryFn: async () => {
      try {
        console.log('Carregando tópicos do fórum...', { activeTab, selectedFilter, searchQuery });
        
        let query = supabase
          .from('forum_topics')
          .select(`
            *,
            profiles:user_id(name, avatar_url)
          `);

        // Filtrar por busca se houver
        if (searchQuery.trim()) {
          query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        // Aplicar filtros
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

        // Limitar resultados
        query = query.limit(20);

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
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
    retry: 2,
    refetchOnWindowFocus: false
  });
  
  return {
    topics: topics || [],
    isLoading,
    error
  };
};
