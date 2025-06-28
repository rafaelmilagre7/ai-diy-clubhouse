
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ForumStats {
  topicCount: number;
  postCount: number;
  activeUserCount: number;
  solvedCount: number;
}

export const useForumStats = () => {
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['forumStats'],
    queryFn: async (): Promise<ForumStats> => {
      try {
        console.log("Carregando estatísticas do fórum...");
        
        // Buscar contagem de tópicos
        const { count: topicCount } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true });
        
        // Buscar contagem de posts
        const { count: postCount } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true });
        
        // Buscar usuários ativos (usuários únicos com atividade nos últimos 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: activeUsers } = await supabase
          .from('forum_topics')
          .select('user_id')
          .gt('created_at', thirtyDaysAgo.toISOString())
          .limit(1000);
        
        // Adicionar também usuários que fizeram posts
        const { data: activePosterUsers } = await supabase
          .from('forum_posts')
          .select('user_id')
          .gt('created_at', thirtyDaysAgo.toISOString())
          .limit(1000);
        
        // Buscar contagem de tópicos resolvidos
        const { count: solvedCount } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true })
          .eq('is_solved', true);
        
        // Combinar e obter usuários únicos
        const allUserIds = [
          ...((activeUsers || []).map((u: any) => u.user_id)), 
          ...((activePosterUsers || []).map((u: any) => u.user_id))
        ];
        const uniqueUserIds = [...new Set(allUserIds)];
        
        console.log("Estatísticas carregadas:", {
          topicCount,
          postCount,
          activeUsers: uniqueUserIds.length,
          solvedCount
        });
        
        return {
          topicCount: topicCount || 0,
          postCount: postCount || 0,
          activeUserCount: uniqueUserIds.length,
          solvedCount: solvedCount || 0
        };
      } catch (error: any) {
        console.error('Erro ao buscar estatísticas do fórum:', error.message);
        // Retornar valores padrão em caso de erro
        return {
          topicCount: 0,
          postCount: 0,
          activeUserCount: 0,
          solvedCount: 0
        };
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
    retry: 1,
    refetchOnWindowFocus: false
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
