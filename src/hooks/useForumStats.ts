
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ForumStats {
  topicCount: number;
  postCount: number;
  activeUserCount: number;
  isLoading: boolean;
  error: Error | null;
}

export function useForumStats(): ForumStats {
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['forumStats'],
    queryFn: async () => {
      // Buscar contagem de tópicos
      const { count: topicCount, error: topicError } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true });
      
      if (topicError) throw new Error(`Erro ao buscar tópicos: ${topicError.message}`);
      
      // Buscar contagem total de posts
      const { count: postCount, error: postError } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true });
      
      if (postError) throw new Error(`Erro ao buscar posts: ${postError.message}`);
      
      // Buscar contagem de usuários ativos (que criaram tópicos ou posts nos últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: activeUsers, error: userError } = await supabase
        .from('forum_topics')
        .select('user_id')
        .gt('created_at', thirtyDaysAgo.toISOString())
        .union([
          supabase
            .from('forum_posts')
            .select('user_id')
            .gt('created_at', thirtyDaysAgo.toISOString())
        ]);
      
      if (userError) throw new Error(`Erro ao buscar usuários ativos: ${userError.message}`);
      
      // Remover duplicatas para obter contagem única de usuários
      const uniqueUserIds = new Set(activeUsers?.map(item => item.user_id));
      const activeUserCount = uniqueUserIds.size;
      
      return {
        topicCount: topicCount || 0,
        postCount: postCount || 0,
        activeUserCount
      };
    }
  });

  return {
    topicCount: data?.topicCount || 0,
    postCount: data?.postCount || 0,
    activeUserCount: data?.activeUserCount || 0,
    isLoading,
    error: error as Error | null
  };
}
