
import { useState, useEffect } from 'react';
import { Solution } from '@/lib/supabase';
import { useDashboardProgress } from '../useDashboardProgress';

export interface Dashboard {
  active: Solution[];
  completed: Solution[];
  recommended: Solution[];
  loading: boolean;
  error: string | null;
}

export interface UserProgress {
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
}

// Hook consolidado que unifica funcionalidades de dashboard
export const useDashboardData = () => {
  const [dashboard, setDashboard] = useState<Dashboard>({
    active: [],
    completed: [],
    recommended: [],
    loading: true,
    error: null
  });

  // Usar o hook de progresso consolidado
  const { data: progressData, loading: progressLoading } = useDashboardProgress();

  useEffect(() => {
    // Simular carregamento de dados do dashboard
    const loadDashboardData = async () => {
      try {
        setDashboard(prev => ({ ...prev, loading: true, error: null }));
        
        // Aqui seria feita a chamada real para a API
        // Por enquanto, usando dados do progressData se disponível
        const mockData = {
          active: progressData?.active || [],
          completed: progressData?.completed || [],
          recommended: progressData?.recommended || [],
          loading: false,
          error: null
        };

        setDashboard(mockData);
      } catch (error) {
        setDashboard(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }));
      }
    };

    loadDashboardData();
  }, [progressData]);

  const userProgress: UserProgress = {
    completedCount: dashboard.completed.length,
    totalCount: dashboard.active.length + dashboard.completed.length + dashboard.recommended.length,
    progressPercentage: dashboard.completed.length > 0 ? 
      Math.round((dashboard.completed.length / (dashboard.active.length + dashboard.completed.length)) * 100) : 0
  };

  return {
    dashboard,
    userProgress,
    loading: dashboard.loading || progressLoading,
    error: dashboard.error,
    refetch: () => {
      // Implementar refetch se necessário
    }
  };
};
