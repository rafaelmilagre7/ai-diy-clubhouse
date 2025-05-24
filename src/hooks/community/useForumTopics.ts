
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
        console.log("🔍 Iniciando busca de tópicos:", { selectedFilter, searchQuery, activeTab });
        
        // Primeira abordagem: buscar tópicos com relações usando joins simples
        let query = supabase
          .from('forum_topics')
          .select(`
            *,
            profiles!forum_topics_user_id_fkey (
              id,
              name,
              avatar_url,
              role
            ),
            forum_categories!forum_topics_category_id_fkey (
              id,
              name,
              slug
            )
          `)
          .order('is_pinned', { ascending: false })
          .order('last_activity_at', { ascending: false });

        // Aplicar filtros de categoria
        if (activeTab !== "todos" && categories.length > 0) {
          const category = categories.find(c => c.slug === activeTab);
          if (category) {
            console.log("📂 Filtrando por categoria:", category.name);
            query = query.eq('category_id', category.id);
          }
        }
        
        // Aplicar filtros adicionais
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
          default: // "recentes"
            break;
        }
        
        // Aplicar filtro de busca
        if (searchQuery && searchQuery.trim()) {
          console.log("🔎 Aplicando filtro de busca:", searchQuery);
          query = query.ilike('title', `%${searchQuery.trim()}%`);
        }
        
        // Limitar resultados
        query = query.limit(50);
        
        console.log("🚀 Executando query...");
        const { data: topicsData, error } = await query;
        
        if (error) {
          console.error("❌ Erro na query de tópicos:", error);
          throw error;
        }
        
        console.log("✅ Dados brutos recebidos:", {
          quantidade: topicsData?.length || 0,
          primeiroItem: topicsData?.[0] || null
        });
        
        if (!topicsData || topicsData.length === 0) {
          console.log("📭 Nenhum tópico encontrado");
          return [];
        }
        
        // Mapear os dados para o formato esperado
        const formattedTopics: Topic[] = topicsData.map(topic => {
          const formattedTopic: Topic = {
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
            profiles: topic.profiles ? {
              id: topic.profiles.id,
              name: topic.profiles.name || 'Usuário',
              avatar_url: topic.profiles.avatar_url,
              role: topic.profiles.role || 'member',
              user_id: topic.profiles.id
            } : null,
            category: topic.forum_categories ? {
              id: topic.forum_categories.id,
              name: topic.forum_categories.name || 'Sem categoria',
              slug: topic.forum_categories.slug || 'sem-categoria'
            } : null
          };
          
          return formattedTopic;
        });
        
        console.log("🎯 Tópicos formatados:", {
          total: formattedTopics.length,
          comPerfil: formattedTopics.filter(t => t.profiles).length,
          comCategoria: formattedTopics.filter(t => t.category).length
        });
        
        return formattedTopics;
        
      } catch (error: any) {
        console.error('💥 Erro crítico ao buscar tópicos:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Em caso de erro, tentar buscar apenas os tópicos básicos
        try {
          console.log("🔄 Tentando busca simplificada...");
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('forum_topics')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
            
          if (fallbackError) {
            console.error("❌ Erro na busca simplificada:", fallbackError);
            toast.error("Não foi possível carregar os tópicos.");
            return [];
          }
          
          console.log("✅ Busca simplificada bem-sucedida:", fallbackData?.length || 0);
          
          return (fallbackData || []).map(topic => ({
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
            profiles: null,
            category: null
          }));
          
        } catch (fallbackError) {
          console.error("💀 Erro na busca de fallback:", fallbackError);
          toast.error("Erro ao carregar tópicos. Tente recarregar a página.");
          return [];
        }
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minuto de cache
    retry: 1,
    refetchOnWindowFocus: false,
    meta: {
      onError: (error: any) => {
        console.error("🚨 Erro capturado pelo React Query:", error);
      }
    }
  });
};
