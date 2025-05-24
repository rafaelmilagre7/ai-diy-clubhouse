
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
        
        // Mapear os dados para o formato esperado
        const formattedTopics: Topic[] = topicsData.map(topic => ({
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
          profiles: topic.profiles ? {
            id: topic.profiles.id,
            name: topic.profiles.name || 'Usuário',
            avatar_url: topic.profiles.avatar_url,
            role: topic.profiles.role || '',
            user_id: topic.profiles.id
          } : null,
          category: topic.category ? {
            id: topic.category.id,
            name: topic.category.name,
            slug: topic.category.slug
          } : null
        }));
        
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
