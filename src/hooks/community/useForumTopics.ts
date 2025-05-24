
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Topic, ForumCategory } from "@/types/forumTypes";

export type TopicFilterType = "recentes" | "populares" | "sem-respostas" | "resolvidos";

interface UseForumTopicsProps {
  activeTab: string;
  selectedFilter: TopicFilterType;
  searchQuery: string;
  categories?: ForumCategory[];
}

export const useForumTopics = ({ 
  activeTab, 
  selectedFilter, 
  searchQuery, 
  categories = []
}: UseForumTopicsProps) => {
  
  return useQuery({
    queryKey: ['forum-topics', selectedFilter, searchQuery, activeTab],
    queryFn: async (): Promise<Topic[]> => {
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
            is_solved,
            user_id, 
            category_id, 
            last_activity_at,
            profiles:user_id (id, name, avatar_url, role),
            category:forum_categories!forum_topics_category_id_fkey (id, name, slug)
          `)
          .order('is_pinned', { ascending: false });

        // Aplicar filtros de categoria apenas se não for "todos"
        if (activeTab !== "todos") {
          const category = categories.find(c => c.slug === activeTab);
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
            query = query.eq('is_solved', true).order('last_activity_at', { ascending: false });
            break;
        }
        
        // Aplicar filtro de busca
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }
        
        // Limitar resultados
        query = query.limit(50);
        
        // Executar a consulta
        const { data: topicsData, error: topicsError } = await query;
        
        if (topicsError) {
          console.error("Erro ao buscar tópicos:", topicsError);
          throw topicsError;
        }
        
        // Se não temos tópicos, retornar array vazio
        if (!topicsData || topicsData.length === 0) {
          return [];
        }
        
        // Agora, buscar os perfis dos usuários separadamente
        const userIds = [...new Set(topicsData.map(topic => topic.user_id))];

        let userProfiles: any[] = [];
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, role')
            .in('id', userIds);

          if (profilesError) {
            console.error("Erro ao buscar perfis:", profilesError);
          } else {
            userProfiles = profiles || [];
          }
        }

        // Buscar categorias relacionadas
        const categoryIds = [...new Set(topicsData.map(topic => topic.category_id))];
        let categoriesData: any[] = [];
        if (categoryIds.length > 0) {
          const { data: categoriesResult, error: categoriesError } = await supabase
            .from('forum_categories')
            .select('id, name, slug')
            .in('id', categoryIds);

          if (categoriesError) {
            console.error("Erro ao buscar categorias:", categoriesError);
          } else {
            categoriesData = categoriesResult || [];
          }
        }

        // Mapear manualmente os dados de perfil e categoria para cada tópico
        const mapTopicWithRelations = (topic: any): Topic => {
          const userProfile = userProfiles.find(profile => profile.id === topic.user_id);
          const category = categoriesData.find(cat => cat.id === topic.category_id);

          return {
            ...topic,
            profiles: userProfile ? {
              id: userProfile.id,
              name: userProfile.name || 'Usuário',
              avatar_url: userProfile.avatar_url,
              role: userProfile.role || '',
              user_id: userProfile.id
            } : null,
            category: category ? {
              id: category.id,
              name: category.name,
              slug: category.slug
            } : null
          };
        };
        
        const formattedTopics: Topic[] = topicsData.map(mapTopicWithRelations);
        
        console.log(`Tópicos encontrados: ${formattedTopics.length}`);
        return formattedTopics;
        
      } catch (error: any) {
        console.error('Erro ao buscar tópicos:', error);
        toast.error("Não foi possível carregar os tópicos. Tente novamente.");
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos de cache
    retry: 2,
    refetchOnWindowFocus: false,
  });
};
