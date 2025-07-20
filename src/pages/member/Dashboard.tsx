
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useOptimizedDashboardProgress } from '@/hooks/dashboard/useOptimizedDashboardProgress';
import LoadingScreen from '@/components/common/LoadingScreen';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { Solution } from '@/lib/supabase';

const Dashboard = () => {
  const { user, profile, isLoading: authLoading } = useAuth();
  const { solutions, loading: dataLoading, error } = useDashboardData();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Usar o hook de progresso
  const {
    active,
    completed,
    recommended,
    loading: progressLoading,
    error: progressError
  } = useOptimizedDashboardProgress(solutions);

  // Loading unificado e simplificado
  const isLoading = authLoading || dataLoading || progressLoading;
  const hasError = error || progressError;

  console.log('🔍 [DASHBOARD] Estado geral:', {
    authLoading,
    dataLoading,
    progressLoading,
    isLoading,
    hasUser: !!user,
    hasProfile: !!profile,
    solutionsCount: solutions.length,
    activeCount: active.length,
    completedCount: completed.length,
    recommendedCount: recommended.length
  });

  if (isLoading) {
    return <LoadingScreen message="Carregando seu dashboard..." />;
  }

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar dashboard</h2>
          <p className="text-gray-600">{String(error || progressError)}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const handleSolutionClick = (solution: Solution) => {
    navigate(`/solution/${solution.id}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <ErrorBoundary>
      <DashboardLayout
        active={active}
        completed={completed}
        recommended={recommended}
        category={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onSolutionClick={handleSolutionClick}
        isLoading={false} // Nunca passa loading aqui pois já tratamos acima
      />
    </ErrorBoundary>
  );
};

export default Dashboard;
