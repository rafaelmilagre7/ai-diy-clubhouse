
import { useState, useEffect } from 'react';

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
        
        // Mock data since forum tables may not exist yet
        const mockStats = {
          topicCount: 12,
          postCount: 45,
          activeUserCount: 8,
          solvedCount: 5
        };
        
        console.log("Estatísticas carregadas:", mockStats);
        setStats(mockStats);
        
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
