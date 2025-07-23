
import { useAuth } from '@/contexts/auth';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useDashboardProgress } from '@/hooks/dashboard/useDashboardProgress';
import LoadingScreen from '@/components/common/LoadingScreen';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { OnboardingBanner } from '@/components/common/OnboardingBanner';
import { useNavigate } from 'react-router-dom';
import { Solution } from '@/lib/supabase';
import { useState, useCallback, useMemo } from 'react';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { solutions, loading, error } = useDashboardData();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Usar o hook consolidado de progresso
  const {
    active,
    completed,
    recommended,
    loading: progressLoading,
    error: progressError
  } = useDashboardProgress(solutions);

  // Otimização: Memoizar callbacks para evitar re-renderizações - ANTES dos early returns
  const handleSolutionClick = useCallback((solution: Solution) => {
    navigate(`/solution/${solution.id}`);
  }, [navigate]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const isLoading = loading || progressLoading;
  const hasError = error || progressError;

  // Memoizar dados computados para performance - ANTES dos early returns
  const memoizedData = useMemo(() => ({
    active,
    completed,
    recommended,
    category: selectedCategory,
    isLoading,
    hasError
  }), [active, completed, recommended, selectedCategory, isLoading, hasError]);

  if (isLoading) {
    return <LoadingScreen message="Carregando dashboard..." />;
  }

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar dashboard</h2>
          <p className="text-gray-600">{String(error || progressError)}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-0">
        <OnboardingBanner />
        <DashboardLayout
          active={memoizedData.active}
          completed={memoizedData.completed}
          recommended={memoizedData.recommended}
          category={memoizedData.category}
          onCategoryChange={handleCategoryChange}
          onSolutionClick={handleSolutionClick}
          isLoading={memoizedData.isLoading}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Dashboard;
