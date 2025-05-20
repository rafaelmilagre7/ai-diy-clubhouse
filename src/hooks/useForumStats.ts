
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useForumStats = () => {
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['forumStats'],
    queryFn: async () => {
      try {
        console.log("Carregando estatísticas do fórum...");
        
        // Buscar contagem de tópicos
        const { count: topicCount, error: topicError } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true });
        
        if (topicError) {
          console.error("Erro ao buscar contagem de tópicos:", topicError.message);
          throw topicError;
        }
        
        // Buscar contagem de posts
        const { count: postCount, error: postError } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true });
        
        if (postError) {
          console.error("Erro ao buscar contagem de posts:", postError.message);
          throw postError;
        }
        
        // Buscar usuários ativos (usuários únicos com atividade nos últimos 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: activeUsers, error: userError } = await supabase
          .from('forum_topics')
          .select('user_id')
          .gt('created_at', thirtyDaysAgo.toISOString())
          .limit(1000);
        
        if (userError) {
          console.error("Erro ao buscar usuários ativos:", userError.message);
          throw userError;
        }
        
        // Adicionar também usuários que fizeram posts
        const { data: activePosterUsers, error: posterError } = await supabase
          .from('forum_posts')
          .select('user_id')
          .gt('created_at', thirtyDaysAgo.toISOString())
          .limit(1000);
        
        if (posterError) {
          console.error("Erro ao buscar usuários com posts:", posterError.message);
          throw posterError;
        }
        
        // Buscar contagem de tópicos resolvidos
        const { count: solvedCount, error: solvedError } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true })
          .eq('is_solved', true);
          
        if (solvedError) {
          console.error("Erro ao buscar tópicos resolvidos:", solvedError.message);
          throw solvedError;
        }
        
        // Combinar e obter usuários únicos
        const allUserIds = [
          ...(activeUsers?.map(u => u.user_id) || []), 
          ...(activePosterUsers?.map(u => u.user_id) || [])
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
