
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Solution } from "@/lib/supabase";
import { OptimizedDashboardLayout } from "@/components/dashboard/OptimizedDashboardLayout";
import { useEnhancedDashboard } from "@/hooks/dashboard/useEnhancedDashboard";
import { useStableCallback } from "@/hooks/performance/useStableCallback";

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Hook híbrido com otimização + fallback automático
  const {
    active,
    completed,
    recommended,
    isLoading,
    error,
    performance
  } = useEnhancedDashboard();

  // Callback estável para navegação
  const handleSolutionClick = useStableCallback((solution: Solution) => {
    navigate(`/solution/${solution.id}`);
  });

  // Log de erro se houver (para monitoramento)
  if (error) {
    console.warn('[DASHBOARD] Erro detectado:', error);
  }

  return (
    <OptimizedDashboardLayout
      active={active}
      completed={completed}
      recommended={recommended}
      onSolutionClick={handleSolutionClick}
      isLoading={isLoading}
      performance={performance}
    />
  );
};

export default Dashboard;
