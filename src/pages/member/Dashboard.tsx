
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useSolutionProgress } from '@/hooks/dashboard/useSolutionProgress';
import LoadingScreen from '@/components/common/LoadingScreen';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ActiveSolutions } from '@/components/dashboard/ActiveSolutions';
import { CompletedSolutions } from '@/components/dashboard/CompletedSolutions';
import { RecommendedSolutions } from '@/components/dashboard/RecommendedSolutions';
import { useNavigate } from 'react-router-dom';
import { Solution } from '@/lib/supabase';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { solutions, progressData, loading, error } = useDashboardData();
  const { active, completed, recommended } = useSolutionProgress(solutions, progressData);
  const navigate = useNavigate();

  if (loading) {
    return <LoadingScreen message="Carregando dashboard..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar dashboard</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const handleSolutionClick = (solution: Solution) => {
    navigate(`/solutions/${solution.id}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader />
      
      {/* Sempre mostrar recomendadas primeiro se existirem */}
      {recommended.length > 0 && (
        <RecommendedSolutions 
          solutions={recommended}
          onSolutionClick={handleSolutionClick}
        />
      )}
      
      {/* Mostrar ativas se existirem */}
      {active.length > 0 && (
        <ActiveSolutions 
          solutions={active}
          onSolutionClick={handleSolutionClick}
        />
      )}
      
      {/* Mostrar completadas se existirem */}
      {completed.length > 0 && (
        <CompletedSolutions 
          solutions={completed}
          onSolutionClick={handleSolutionClick}
        />
      )}

      {/* Estado vazio - quando não há soluções */}
      {solutions.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhuma solução disponível
          </h3>
          <p className="text-gray-600 mb-4">
            As soluções em IA serão disponibilizadas em breve.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
