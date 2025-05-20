
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Topic } from "@/types/forumTypes";
import { toast } from "sonner";

export type TopicFilterType = "recentes" | "populares" | "sem-respostas" | "resolvidos";

interface UseForumTopicsProps {
  activeTab: string;
  selectedFilter: TopicFilterType;
  searchQuery: string;
  categories?: any[];
}

export const useForumTopics = ({ 
  activeTab, 
  selectedFilter, 
  searchQuery, 
  categories 
}: UseForumTopicsProps) => {
  
  return useQuery({
    queryKey: ['communityTopics', selectedFilter, searchQuery, activeTab],
    queryFn: async () => {
      try {
        console.log("Buscando tópicos com filtros:", { selectedFilter, searchQuery, activeTab });
        
        // Construir query base para tópicos
        let query = supabase
          .from('forum_topics')
          .select(`
            id, 
            title, 
            content, 
            created_at, 
            updated_at, 
            view_count, 
            reply_count, 
            is_locked, 
            is_pinned, 
            user_id, 
            category_id, 
            last_activity_at,
            profiles:user_id(*),
            category:category_id(id, name, slug)
          `)
          .order('is_pinned', { ascending: false });

        // Aplicar filtros de categoria apenas se não for "todos"
        if (activeTab !== "todos") {
          const category = categories?.find(c => c.slug === activeTab);
          if (category) {
            query = query.eq('category_id', category.id);
          }
        }
        
        // Aplicar filtros adicionais
        switch (selectedFilter) {
          case "recentes":
            query = query.order('last_activity_at', { ascending: false });
            break;
          case "populares":
            query = query.order('view_count', { ascending: false });
            break;
          case "sem-respostas":
            query = query.eq('reply_count', 0).order('created_at', { ascending: false });
            break;
          case "resolvidos":
            // Implementação futura
            query = query.order('last_activity_at', { ascending: false });
            break;
        }
        
        // Aplicar filtro de busca
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }
        
        // Limitar resultados
        query = query.limit(20);
        
        // Executar a consulta principal
        const { data: topicsData, error: topicsError } = await query;
        
        if (topicsError) {
          throw topicsError;
        }
        
        // Se não temos tópicos, retornar array vazio
        if (!topicsData || topicsData.length === 0) {
          return [];
        }
        
        // Converter e garantir que os dados estão no formato correto
        const formattedTopics = topicsData.map(topic => {
          // Verificar e tratar corretamente o campo profiles
          let formattedProfile = null;
          if (topic.profiles && typeof topic.profiles === 'object') {
            const profileData = topic.profiles as any; // Usamos any para contornar a incompatibilidade
            formattedProfile = {
              id: String(profileData.id || ''),
              name: String(profileData.name || ''),
              avatar_url: String(profileData.avatar_url || ''),
              role: String(profileData.role || '')
            };
          }
          
          // Verificar e tratar corretamente o campo category
          let formattedCategory = null;
          if (topic.category && typeof topic.category === 'object') {
            const categoryData = topic.category as any; // Usamos any para contornar a incompatibilidade
            formattedCategory = {
              id: String(categoryData.id || ''),
              name: String(categoryData.name || ''),
              slug: String(categoryData.slug || '')
            };
          }
          
          return {
            id: topic.id,
            title: topic.title,
            content: topic.content,
            created_at: topic.created_at,
            updated_at: topic.updated_at,
            last_activity_at: topic.last_activity_at,
            user_id: topic.user_id,
            category_id: topic.category_id,
            view_count: topic.view_count,
            reply_count: topic.reply_count,
            is_pinned: topic.is_pinned,
            is_locked: topic.is_locked,
            profiles: formattedProfile,
            category: formattedCategory
          } as Topic;
        });
        
        return formattedTopics;
      } catch (error: any) {
        console.error('Erro ao buscar tópicos:', error.message);
        toast.error("Não foi possível carregar os tópicos. Por favor, tente novamente.");
        return [];
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutos de cache
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
