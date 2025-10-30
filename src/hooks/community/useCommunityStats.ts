
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useCommunityStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      console.log('Carregando estatísticas da comunidade...');
      
      // Contar tópicos
      const { count: topicCount } = await supabase
        .from('community_topics')
        .select('*', { count: 'exact', head: true });

      // Contar posts
      const { count: postCount } = await supabase
        .from('community_posts')
        .select('*', { count: 'exact', head: true });

      // Contar usuários ativos (com pelo menos um tópico ou post)
      // Usando RPC para evitar acesso direto à tabela profiles
      const { data: topicUsers } = await supabase
        .from('community_topics')
        .select('user_id');
      
      const { data: postUsers } = await supabase
        .from('community_posts')
        .select('user_id');
      
      // Criar conjunto único de IDs
      const uniqueUserIds = new Set([
        ...(topicUsers?.map(t => t.user_id) || []),
        ...(postUsers?.map(p => p.user_id) || [])
      ]);
      
      const activeUserCount = uniqueUserIds.size;

      // Contar tópicos resolvidos
      const { count: solvedCount } = await supabase
        .from('community_topics')
        .select('*', { count: 'exact', head: true })
        .eq('is_solved', true);

      console.log('Estatísticas carregadas:', {
        topicCount,
        postCount,
        activeUserCount,
        solvedCount
      });

      return {
        topicCount: topicCount || 0,
        postCount: postCount || 0,
        activeUserCount,
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
