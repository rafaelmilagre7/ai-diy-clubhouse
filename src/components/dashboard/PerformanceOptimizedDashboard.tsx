
import React, { memo } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { usePreloadRoutes } from '../../hooks/performance/usePreloadRoutes';
import { Solution } from '@/lib/supabase';

interface PerformanceOptimizedDashboardProps {
  active: Solution[];
  completed: Solution[];
  recommended: Solution[];
  category: string;
  onCategoryChange: (category: string) => void;
  onSolutionClick: (solution: Solution) => void;
  isLoading?: boolean;
}

// Wrapper otimizado para o dashboard principal usando DashboardLayout consolidado
export const PerformanceOptimizedDashboard = memo<PerformanceOptimizedDashboardProps>((props) => {
  // Ativar preload inteligente
  usePreloadRoutes();

  return <DashboardLayout {...props} optimized={true} />;
});

PerformanceOptimizedDashboard.displayName = 'PerformanceOptimizedDashboard';
