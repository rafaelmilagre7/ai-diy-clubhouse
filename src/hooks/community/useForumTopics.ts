
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Topic, ForumCategory } from "@/types/forumTypes";
import { getUserRoleName } from "@/lib/supabase/types";

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
  categories 
}: UseForumTopicsProps) => {
  
  return useQuery({
    queryKey: ['communityTopics', selectedFilter, searchQuery, activeTab],
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
            last_activity_at
          `)
          .order('is_pinned', { ascending: false });

        // Aplicar filtros de categoria apenas se não for "todos"
        if (activeTab !== "todos") {
          const category = categories?.find(c => c.slug === activeTab);
          if (category) {
            query = query.eq('category_id', category.id as any);
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
            query = query.eq('reply_count', 0 as any).order('created_at', { ascending: false });
            break;
          case "resolvidos":
            // Filtrar apenas tópicos marcados como resolvidos
            query = query.eq('is_solved', true as any).order('last_activity_at', { ascending: false });
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
        
        // Buscar perfis de usuários em uma consulta separada
        const userIds = (topicsData as any).map((topic: any) => topic.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, role_id, user_roles:role_id(name)')
          .in('id', userIds as any);
          
        if (profilesError) {
          console.warn("Erro ao buscar perfis:", profilesError.message);
        }
        
        // Buscar categorias em uma consulta separada
        const categoryIds = (topicsData as any).map((topic: any) => topic.category_id).filter(Boolean);
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('forum_categories')
          .select('id, name, slug')
          .in('id', categoryIds as any);
          
        if (categoriesError) {
          console.warn("Erro ao buscar categorias:", categoriesError.message);
        }
        
        // Mapear os perfis e categorias para os tópicos
        const formattedTopics: Topic[] = (topicsData as any).map((topic: any) => {
          const userProfile = (profilesData as any)?.find((profile: any) => profile.id === topic.user_id);
          const topicCategory = (categoriesData as any)?.find((cat: any) => cat.id === topic.category_id);
          
          // CORREÇÃO: Usar getUserRoleName() para obter role de forma consistente
          let userRole = '';
          if (userProfile) {
            // Criar objeto profile temporário para usar getUserRoleName
            const profileForRole = {
              ...userProfile,
              user_roles: userProfile.user_roles || null
            };
            userRole = getUserRoleName(profileForRole as any) || '';
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
            view_count: topic.view_count || 0,
            reply_count: topic.reply_count || 0,
            is_pinned: topic.is_pinned || false,
            is_locked: topic.is_locked || false,
            is_solved: topic.is_solved || false,
            profiles: userProfile ? {
              id: userProfile.id,
              name: userProfile.name || 'Usuário',
              avatar_url: userProfile.avatar_url,
              role: userRole, // Usando role obtido via getUserRoleName
              user_id: userProfile.id // Garantindo que tenhamos o user_id
            } : null,
            category: topicCategory ? {
              id: topicCategory.id,
              name: topicCategory.name,
              slug: topicCategory.slug
            } : null
          };
        });
        
        console.log(`Tópicos formatados: ${formattedTopics.length}`);
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
