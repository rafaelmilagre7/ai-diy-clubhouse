
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
        
        // Use Promise.all to avoid type depth issues
        const [topicsResult, postsResult, solvedResult] = await Promise.all([
          supabase.from('forum_topics').select('*', { count: 'exact', head: true }),
          supabase.from('forum_posts').select('*', { count: 'exact', head: true }),
          supabase.from('forum_topics').select('*', { count: 'exact', head: true }).eq('is_solved', true)
        ]);
        
        console.log("Estatísticas carregadas:", {
          topicCount: topicsResult.count,
          postCount: postsResult.count,
          solvedCount: solvedResult.count
        });
        
        setStats({
          topicCount: topicsResult.count || 0,
          postCount: postsResult.count || 0,
          activeUserCount: 0, // Simplified for now
          solvedCount: solvedResult.count || 0
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
