
import React, { useState } from 'react';
import { useSolutionsData } from '@/hooks/useSolutionsData';
import { useDashboardProgress } from '@/hooks/dashboard/useDashboardProgress';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [category, setCategory] = useState('all');
  
  // Buscar dados das soluções
  const { 
    solutions = [], 
    loading: solutionsLoading,
    canViewSolutions 
  } = useSolutionsData();
  
  // Buscar progresso do usuário
  const { 
    active: activeSolutions = [], 
    completed: completedSolutions = [],
    recommended: recommendedSolutions = [],
    loading: progressLoading 
  } = useDashboardProgress(solutions);
  
  // Função para navegar para detalhes da solução
  const handleSolutionClick = (solution: any) => {
    navigate(`/solutions/${solution.id}`);
  };
  
  // Verificar se o usuário pode ver soluções
  if (!canViewSolutions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">
            Você não tem permissão para visualizar as soluções.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <DashboardLayout
      active={activeSolutions}
      completed={completedSolutions}
      recommended={recommendedSolutions}
      category={category}
      onCategoryChange={setCategory}
      onSolutionClick={handleSolutionClick}
      isLoading={solutionsLoading || progressLoading}
    />
  );
}
