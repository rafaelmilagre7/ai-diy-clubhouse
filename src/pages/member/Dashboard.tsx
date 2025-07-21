
import { useAuth } from '@/contexts/auth';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useDashboardProgress } from '@/hooks/dashboard/useDashboardProgress';
import LoadingScreen from '@/components/common/LoadingScreen';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { Solution } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { solutions, loading, error, refetch } = useDashboardData();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hasShownError, setHasShownError] = useState(false);

  // Usar o hook consolidado de progresso
  const {
    active,
    completed,
    recommended,
    loading: progressLoading,
    error: progressError
  } = useDashboardProgress(solutions);

  const isLoading = loading || progressLoading;
  const hasError = error || progressError;

  // Debug logs
  useEffect(() => {
    console.log('📊 Dashboard Debug Info:', {
      userExists: !!user,
      profileExists: !!profile,
      solutionsCount: solutions?.length || 0,
      isLoading,
      hasError: !!hasError,
      activeCount: active?.length || 0,
      completedCount: completed?.length || 0,
      recommendedCount: recommended?.length || 0
    });
  }, [user, profile, solutions, isLoading, hasError, active, completed, recommended]);

  // Mostrar erro apenas uma vez
  useEffect(() => {
    if (hasError && !hasShownError) {
      console.error('❌ Erro no dashboard:', hasError);
      toast.error('Erro ao carregar dashboard. Tentando recarregar...');
      setHasShownError(true);
      
      // Tentar recarregar após 3 segundos
      setTimeout(() => {
        refetch?.();
        setHasShownError(false);
      }, 3000);
    }
  }, [hasError, hasShownError, refetch]);

  if (isLoading) {
    return <LoadingScreen message="Carregando seu dashboard..." />;
  }

  // Se há erro persistente, mostrar opção de retry
  if (hasError && hasShownError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar dashboard</h2>
          <p className="text-gray-600 mb-4">{String(error || progressError)}</p>
          <button 
            onClick={() => {
              setHasShownError(false);
              refetch?.();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const handleSolutionClick = (solution: Solution) => {
    if (!solution?.id) {
      console.error('❌ Solução inválida clicada:', solution);
      toast.error('Erro ao acessar solução');
      return;
    }
    
    console.log('🔗 Navegando para solução:', solution.title);
    navigate(`/solution/${solution.id}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <ErrorBoundary>
      <DashboardLayout
        active={active || []}
        completed={completed || []}
        recommended={recommended || []}
        category={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onSolutionClick={handleSolutionClick}
        isLoading={isLoading}
      />
    </ErrorBoundary>
  );
};

export default Dashboard;
