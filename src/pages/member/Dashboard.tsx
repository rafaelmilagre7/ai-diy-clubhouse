
import React, { useState, useEffect } from 'react';
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

  // Debug log para identificar o problema
  useEffect(() => {
    console.log('🎯 [DASHBOARD] Debug Estado:', {
      solutionsCount: solutions.length,
      activeCount: activeSolutions.length,
      completedCount: completedSolutions.length,
      recommendedCount: recommendedSolutions.length,
      solutionsLoading,
      progressLoading,
      canViewSolutions
    });
  }, [solutions.length, activeSolutions.length, completedSolutions.length, recommendedSolutions.length, solutionsLoading, progressLoading, canViewSolutions]);
  
  // Função para navegar para detalhes da solução
  const handleSolutionClick = (solution: any) => {
    console.log('🎯 [DASHBOARD] Navegando para solução:', solution.id);
    navigate(`/solutions/${solution.id}`);
  };
  
  // Verificar se o usuário pode ver soluções
  if (!canViewSolutions) {
    console.log('🚫 [DASHBOARD] Usuário sem permissão para ver soluções');
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

  console.log('✅ [DASHBOARD] Renderizando DashboardLayout');
  
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
