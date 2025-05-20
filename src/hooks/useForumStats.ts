
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useForumStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['forumStats'],
    queryFn: async () => {
      try {
        // Buscar contagem de tópicos
        const { count: topicCount, error: topicsError } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true });
        
        if (topicsError) throw topicsError;
        
        // Buscar contagem de posts
        const { count: postCount, error: postsError } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true });
        
        if (postsError) throw postsError;
        
        // Buscar usuários ativos (usuários distintos que possuem tópicos)
        const { data: uniqueUsers, error: usersError } = await supabase
          .from('forum_topics')
          .select('user_id', { count: 'exact' })
          .not('user_id', 'is', null);
        
        if (usersError) throw usersError;
        
        // Calcular usuários únicos
        const uniqueUserIds = new Set();
        uniqueUsers?.forEach(item => {
          if (item.user_id) uniqueUserIds.add(item.user_id);
        });
        
        // Buscar contagem de tópicos resolvidos
        const { count: solvedCount, error: solvedError } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true })
          .eq('is_solved', true);
        
        if (solvedError) throw solvedError;
        
        return {
          topicCount: topicCount || 0,
          postCount: postCount || 0,
          activeUserCount: uniqueUserIds.size || 0,
          solvedCount: solvedCount || 0
        };
      } catch (error) {
        console.error("Erro ao buscar estatísticas do fórum:", error);
        // Retornar valores padrão em caso de erro
        return {
          topicCount: 0,
          postCount: 0,
          activeUserCount: 0,
          solvedCount: 0
        };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
    retry: 1
  });
  
  return {
    topicCount: data?.topicCount || 0,
    postCount: data?.postCount || 0,
    activeUserCount: data?.activeUserCount || 0,
    solvedCount: data?.solvedCount || 0,
    isLoading,
    error
  };
};
