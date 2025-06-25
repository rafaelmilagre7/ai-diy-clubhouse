
import { useState, useEffect } from 'react';
import { Solution } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

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

// Hook consolidado que carrega dados do dashboard sem dependências circulares
export const useDashboardData = () => {
  const [dashboard, setDashboard] = useState<Dashboard>({
    active: [],
    completed: [],
    recommended: [],
    loading: true,
    error: null
  });

  const [solutions, setSolutions] = useState<Solution[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setDashboard(prev => ({ ...prev, loading: true, error: null }));
        
        // Carregar soluções do banco
        const { data: solutionsData, error } = await supabase
          .from('solutions')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const solutionsList = solutionsData || [];
        setSolutions(solutionsList);

        // Dividir soluções em categorias
        const active = solutionsList.slice(0, 3);
        const completed: Solution[] = [];
        const recommended = solutionsList.slice(0, 6);

        setDashboard({
          active,
          completed,
          recommended,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        setDashboard(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        }));
      }
    };

    loadDashboardData();
  }, []);

  const userProgress: UserProgress = {
    completedCount: dashboard.completed.length,
    totalCount: dashboard.active.length + dashboard.completed.length + dashboard.recommended.length,
    progressPercentage: dashboard.completed.length > 0 ? 
      Math.round((dashboard.completed.length / (dashboard.active.length + dashboard.completed.length)) * 100) : 0
  };

  return {
    dashboard,
    userProgress,
    solutions,
    loading: dashboard.loading,
    error: dashboard.error,
    refetch: () => {
      // Implementar refetch se necessário
    }
  };
};
