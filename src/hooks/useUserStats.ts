
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';

interface UserStats {
  completedSolutions: number;
  activeSolutions: number;
  achievements: number;
  lastActivity: Date | null;
}

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    completedSolutions: 0,
    activeSolutions: 0,
    achievements: 0,
    lastActivity: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esta função simularia a busca de estatísticas do usuário de uma API
    const fetchUserStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Em um cenário real, aqui teríamos uma chamada à API
        // Por enquanto, vamos apenas simular alguns dados
        
        // Simulação de latência de rede
        await new Promise(resolve => setTimeout(resolve, 500));

        setStats({
          completedSolutions: 2,
          activeSolutions: 1,
          achievements: 3,
          lastActivity: new Date()
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  return { stats, loading };
}
