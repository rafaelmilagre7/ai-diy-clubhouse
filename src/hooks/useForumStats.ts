
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useForumStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['forumStats'],
    queryFn: async () => {
      try {
        // Buscar estatísticas através de uma única chamada RPC para melhor desempenho
        const { data, error } = await supabase.rpc('get_forum_statistics');
        
        if (error) throw error;
        
        // Se não conseguimos usar a função RPC, tentamos o método tradicional
        if (!data) {
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
          
          // Buscar usuários ativos limitando melhor os dados
          const { data: uniqueUserIds, error: usersError } = await supabase
            .rpc('count_distinct_forum_users');
          
          if (usersError) throw usersError;
          
          return {
            topicCount: topicCount || 0,
            postCount: postCount || 0,
            activeUserCount: uniqueUserIds || 0
          };
        }
        
        return {
          topicCount: data.topic_count || 0,
          postCount: data.post_count || 0,
          activeUserCount: data.active_user_count || 0
        };
      } catch (error) {
        console.error("Erro ao buscar estatísticas do fórum:", error);
        // Retornar valores padrão em caso de erro
        return {
          topicCount: 0,
          postCount: 0,
          activeUserCount: 0
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
    isLoading,
    error
  };
};
