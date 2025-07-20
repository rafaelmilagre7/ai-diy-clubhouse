
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useCommunityStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      console.log('Carregando estatísticas da comunidade...');
      
      // Contar tópicos
      const { count: topicCount } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true });

      // Contar posts
      const { count: postCount } = await supabase
        .from('forum_posts')
        .select('*', { count: 'exact', head: true });

      // Contar usuários ativos (com pelo menos um tópico ou post)
      const { data: activeUsers } = await supabase
        .from('profiles')
        .select('id')
        .or('id.in.(select user_id from forum_topics),id.in.(select user_id from forum_posts)');

      // Contar tópicos resolvidos
      const { count: solvedCount } = await supabase
        .from('forum_topics')
        .select('*', { count: 'exact', head: true })
        .eq('is_solved', true);

      console.log('Estatísticas carregadas:', {
        topicCount,
        postCount,
        activeUserCount: activeUsers?.length || 0,
        solvedCount
      });

      return {
        topicCount: topicCount || 0,
        postCount: postCount || 0,
        activeUserCount: activeUsers?.length || 0,
        solvedCount: solvedCount || 0
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2
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
