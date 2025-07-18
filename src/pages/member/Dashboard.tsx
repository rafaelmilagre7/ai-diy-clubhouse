
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import LoadingScreen from '@/components/common/LoadingScreen';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ActiveSolutions } from '@/components/dashboard/ActiveSolutions';
import { CompletedSolutions } from '@/components/dashboard/CompletedSolutions';
import { RecommendedSolutions } from '@/components/dashboard/RecommendedSolutions';
import { useNavigate } from 'react-router-dom';
import { useForceProfileReload } from '@/hooks/useForceProfileReload';
import { Solution } from '@/lib/supabase';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { solutions, loading, error } = useDashboardData();
  const navigate = useNavigate();
  
  // FORÇA RELOAD DO PERFIL - temporário para corrigir cache
  useForceProfileReload();

  if (loading) {
    return <LoadingScreen message="Carregando dashboard..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar dashboard</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Separar soluções por status
  const activeSolutions = solutions.filter(solution => {
    // Lógica para determinar soluções ativas - por enquanto retornamos algumas como exemplo
    return solution.published;
  }).slice(0, 3);

  const completedSolutions = solutions.filter(solution => {
    // Lógica para soluções completadas - por enquanto vazio
    return false;
  });

  const recommendedSolutions = solutions.filter(solution => {
    return solution.published;
  }).slice(0, 6);

  const handleSolutionClick = (solution: Solution) => {
    navigate(`/solution/${solution.id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader />
      
      <RecommendedSolutions 
        solutions={recommendedSolutions}
        onSolutionClick={handleSolutionClick}
      />
      
      {activeSolutions.length > 0 && (
        <ActiveSolutions 
          solutions={activeSolutions}
          onSolutionClick={handleSolutionClick}
        />
      )}
      
      {completedSolutions.length > 0 && (
        <CompletedSolutions 
          solutions={completedSolutions}
          onSolutionClick={handleSolutionClick}
        />
      )}
    </div>
  );
};

export default Dashboard;
