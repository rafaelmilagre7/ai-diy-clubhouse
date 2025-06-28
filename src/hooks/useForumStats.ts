
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ForumStats {
  topicCount: number;
  postCount: number;
  activeUserCount: number;
  solvedCount: number;
}

export const useForumStats = () => {
  const [stats, setStats] = useState<ForumStats>({
    topicCount: 0,
    postCount: 0,
    activeUserCount: 0,
    solvedCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        console.log("Carregando estatísticas do fórum...");
        
        // Buscar contagem de tópicos
        const { count: topicCount } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true });
        
        // Buscar contagem de posts
        const { count: postCount } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true });
        
        // Buscar contagem de tópicos resolvidos
        const { count: solvedCount } = await supabase
          .from('forum_topics')
          .select('*', { count: 'exact', head: true })
          .eq('is_solved', true);
        
        console.log("Estatísticas carregadas:", {
          topicCount,
          postCount,
          solvedCount
        });
        
        setStats({
          topicCount: topicCount || 0,
          postCount: postCount || 0,
          activeUserCount: 0, // Simplified for now
          solvedCount: solvedCount || 0
        });
      } catch (err: any) {
        console.error('Erro ao buscar estatísticas do fórum:', err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  return {
    topicCount: stats.topicCount,
    postCount: stats.postCount,
    activeUserCount: stats.activeUserCount,
    solvedCount: stats.solvedCount,
    isLoading,
    error
  };
};
