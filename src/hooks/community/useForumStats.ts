
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ForumStats {
  topicCount: number;
  postCount: number;
  activeUserCount: number;
  isLoading: boolean;
}

export const useForumStats = (): ForumStats => {
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ['forumStats'],
    queryFn: async () => {
      try {
        // Buscar contagem de tópicos
        const { count: topicCount, error: topicError } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true });
        
        if (topicError) throw topicError;
        
        // Buscar contagem de posts
        const { count: postCount, error: postError } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true });
        
        if (postError) throw postError;
        
        // Buscar usuários ativos (usuários únicos com atividade nos últimos 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: activeUsers, error: userError } = await supabase
          .from('forum_topics')
          .select('user_id')
          .gt('created_at', thirtyDaysAgo.toISOString())
          .limit(1000);
        
        if (userError) throw userError;
        
        // Adicionar também usuários que fizeram posts
        const { data: activePosterUsers, error: posterError } = await supabase
          .from('forum_posts')
          .select('user_id')
          .gt('created_at', thirtyDaysAgo.toISOString())
          .limit(1000);
        
        if (posterError) throw posterError;
        
        // Combinar e obter usuários únicos
        const allUserIds = [
          ...(activeUsers?.map(u => u.user_id) || []), 
          ...(activePosterUsers?.map(u => u.user_id) || [])
        ];
        const uniqueUserIds = [...new Set(allUserIds)];
        
        return {
          topicCount: topicCount || 0,
          postCount: postCount || 0,
          activeUserCount: uniqueUserIds.length
        };
      } catch (error: any) {
        console.error('Erro ao buscar estatísticas do fórum:', error.message);
        toast.error("Não foi possível carregar as estatísticas. Por favor, tente novamente.");
        return {
          topicCount: 0,
          postCount: 0,
          activeUserCount: 0
        };
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
    retry: 1
  });
  
  return {
    topicCount: data?.topicCount || 0,
    postCount: data?.postCount || 0,
    activeUserCount: data?.activeUserCount || 0,
    isLoading
  };
};
