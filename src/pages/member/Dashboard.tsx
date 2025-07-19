
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';
import { useOptimizedDashboardProgress } from '@/hooks/dashboard/useOptimizedDashboardProgress';
import LoadingScreen from '@/components/common/LoadingScreen';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { Solution } from '@/lib/supabase';
import { useState } from 'react';

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { solutions, loading, error } = useDashboardData();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Usar o hook otimizado de progresso
  const {
    active,
    completed,
    recommended,
    loading: progressLoading,
    error: progressError
  } = useOptimizedDashboardProgress(solutions);

  const isLoading = loading || progressLoading;
  const hasError = error || progressError;

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

  const handleSolutionClick = (solution: Solution) => {
    navigate(`/solution/${solution.id}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <DashboardLayout
      active={active}
      completed={completed}
      recommended={recommended}
      category={selectedCategory}
      onCategoryChange={handleCategoryChange}
      onSolutionClick={handleSolutionClick}
      isLoading={isLoading}
    />
  );
};

export default Dashboard;
