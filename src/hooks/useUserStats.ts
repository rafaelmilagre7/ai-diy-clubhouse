
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { UserStats } from '@/hooks/useUserStats/types';

export type { UserStats } from '@/hooks/useUserStats/types';

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    completedSolutions: 0,
    activeSolutions: 0,
    achievements: 0,
    lastActivity: null,
    totalSolutions: 0,
    inProgressSolutions: 0,
    completionRate: 0,
    averageCompletionTime: null,
    activeDays: 0,
    categoryDistribution: {
      Receita: { total: 0, completed: 0 },
      Operacional: { total: 0, completed: 0 },
      Estratégia: { total: 0, completed: 0 }
    },
    recentActivity: []
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
          lastActivity: new Date(),
          totalSolutions: 3,
          inProgressSolutions: 1,
          completionRate: 66,
          averageCompletionTime: 45,
          activeDays: 5,
          categoryDistribution: {
            Receita: { total: 1, completed: 1 },
            Operacional: { total: 1, completed: 1 },
            Estratégia: { total: 1, completed: 0 }
          },
          recentActivity: [
            { date: new Date().toISOString(), action: "Solução concluída", solution: "Assistente de IA no WhatsApp" }
          ]
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
