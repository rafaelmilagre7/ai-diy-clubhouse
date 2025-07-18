
import React, { useState, useMemo } from 'react';
import { useSolutionsData } from '@/hooks/useSolutionsData';
import { useDashboardProgress } from '@/hooks/dashboard/useDashboardProgress';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  
  // Buscar dados das soluções - memoizado
  const solutionsData = useSolutionsData();
  const { 
    solutions = [], 
    loading: solutionsLoading,
    canViewSolutions 
  } = solutionsData;
  
  // Buscar progresso do usuário - memoizado
  const progressData = useDashboardProgress(solutions);
  const { 
    active: activeSolutions = [], 
    completed: completedSolutions = [],
    recommended: recommendedSolutions = [],
    loading: progressLoading 
  } = progressData;

  // Memoizar dados para evitar re-renderizações
  const dashboardData = useMemo(() => ({
    active: activeSolutions,
    completed: completedSolutions,
    recommended: recommendedSolutions,
    isLoading: solutionsLoading || progressLoading
  }), [activeSolutions, completedSolutions, recommendedSolutions, solutionsLoading, progressLoading]);
  
  // Função para navegar para detalhes da solução
  const handleSolutionClick = useMemo(() => (solution: any) => {
    navigate(`/solutions/${solution.id}`);
  }, [navigate]);
  
  // Verificar se o usuário pode ver soluções
  if (!canViewSolutions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-semibold">Acesso Restrito</h2>
          <p className="text-muted-foreground max-w-sm">
            Você não tem permissão para visualizar as soluções. Entre em contato com o administrador.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <DashboardLayout
      active={dashboardData.active}
      completed={dashboardData.completed}
      recommended={dashboardData.recommended}
      category={category}
      onCategoryChange={setCategory}
      onSolutionClick={handleSolutionClick}
      isLoading={dashboardData.isLoading}
    />
  );
}
