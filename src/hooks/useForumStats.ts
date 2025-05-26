
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
        
        // Buscar usuários ativos (distintos que publicaram tópicos ou posts)
        const { data: uniqueUsers, error: usersError } = await supabase
          .from('forum_topics')
          .select('user_id')
          .limit(1000); // Limitar para não trazer muitos dados
        
        if (usersError) throw usersError;
        
        const { data: uniquePostUsers, error: postUsersError } = await supabase
          .from('forum_posts')
          .select('user_id')
          .limit(1000);
        
        if (postUsersError) throw postUsersError;
        
        // Combinar IDs únicos
        const allUserIds = [...uniqueUsers, ...uniquePostUsers].map(u => u.user_id);
        const uniqueUserIds = [...new Set(allUserIds)];
        
        return {
          topicCount,
          postCount,
          activeUserCount: uniqueUserIds.length
        };
      } catch (error) {
        console.error("Erro ao buscar estatísticas do fórum:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  return {
    topicCount: data?.topicCount || 0,
    postCount: data?.postCount || 0,
    activeUserCount: data?.activeUserCount || 0,
    isLoading,
    error
  };
};
