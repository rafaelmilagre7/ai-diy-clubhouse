
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
        console.log("🔍 Buscando tópicos do fórum...", {
          activeTab,
          selectedFilter,
          searchQuery,
          categoriesCount: categories.length
        });
        
        // Construir query básica
        let query = supabase
          .from('forum_topics')
          .select(`
            id,
            title,
            content,
            created_at,
            updated_at,
            last_activity_at,
            user_id,
            category_id,
            view_count,
            reply_count,
            is_pinned,
            is_locked,
            is_solved
          `)
          .order('is_pinned', { ascending: false })
          .order('created_at', { ascending: false });

        // Aplicar filtro de categoria se não for "todos"
        if (activeTab !== "todos" && categories.length > 0) {
          const category = categories.find(c => c.slug === activeTab);
          if (category) {
            query = query.eq('category_id', category.id);
          }
        }
        
        // Aplicar filtros específicos
        switch (selectedFilter) {
          case "populares":
            query = query.order('view_count', { ascending: false });
            break;
          case "sem-respostas":
            query = query.eq('reply_count', 0);
            break;
          case "resolvidos":
            query = query.eq('is_solved', true);
            break;
          default:
            // "recentes" - já ordenado por created_at
            break;
        }
        
        // Filtro de busca
        if (searchQuery && searchQuery.trim()) {
          query = query.ilike('title', `%${searchQuery.trim()}%`);
        }
        
        // Limitar resultados
        query = query.limit(50);
        
        const { data: topicsData, error } = await query;
        
        if (error) {
          console.error("❌ Erro ao buscar tópicos:", error);
          throw error;
        }
        
        if (!topicsData || topicsData.length === 0) {
          console.log("📭 Nenhum tópico encontrado");
          return [];
        }

        // Buscar perfis dos usuários separadamente
        const userIds = [...new Set(topicsData.map(topic => topic.user_id))];
        let profiles: any[] = [];
        
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, role')
            .in('id', userIds);
            
          if (profilesError) {
            console.error("❌ Erro ao buscar perfis:", profilesError);
          } else {
            profiles = profilesData || [];
          }
        }

        // Buscar categorias separadamente
        const categoryIds = [...new Set(topicsData.map(topic => topic.category_id))];
        let categoriesData: any[] = [];
        
        if (categoryIds.length > 0) {
          const { data: categoriesResult, error: categoriesError } = await supabase
            .from('forum_categories')
            .select('id, name, slug')
            .in('id', categoryIds);
            
          if (categoriesError) {
            console.error("❌ Erro ao buscar categorias:", categoriesError);
          } else {
            categoriesData = categoriesResult || [];
          }
        }

        // Mapear os dados para o formato correto
        const formattedTopics: Topic[] = topicsData.map(topic => {
          const userProfile = profiles.find(profile => profile.id === topic.user_id);
          const category = categoriesData.find(cat => cat.id === topic.category_id);
          
          return {
            id: topic.id,
            title: topic.title || 'Tópico sem título',
            content: topic.content || '',
            created_at: topic.created_at,
            updated_at: topic.updated_at,
            last_activity_at: topic.last_activity_at || topic.created_at,
            user_id: topic.user_id,
            category_id: topic.category_id,
            view_count: topic.view_count || 0,
            reply_count: topic.reply_count || 0,
            is_pinned: topic.is_pinned || false,
            is_locked: topic.is_locked || false,
            is_solved: topic.is_solved || false,
            profiles: userProfile ? {
              id: userProfile.id,
              name: userProfile.name || 'Usuário',
              avatar_url: userProfile.avatar_url,
              role: userProfile.role || 'member',
              user_id: userProfile.id
            } : null,
            category: category ? {
              id: category.id,
              name: category.name || 'Sem categoria',
              slug: category.slug || 'sem-categoria'
            } : null
          };
        });
        
        console.log("✅ Tópicos carregados:", formattedTopics.length);
        return formattedTopics;
        
      } catch (error: any) {
        console.error('💥 Erro ao buscar tópicos:', error);
        toast.error("Erro ao carregar tópicos");
        return [];
      }
    },
    staleTime: 30000, // 30 segundos
    retry: 1,
    refetchOnWindowFocus: false
  });
};
