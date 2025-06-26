
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Solution } from "@/lib/supabase";
import { OptimizedDashboardLayout } from "@/components/dashboard/OptimizedDashboardLayout";
import { useEnhancedDashboard } from "@/hooks/dashboard/useEnhancedDashboard";
import { useStableCallback } from "@/hooks/performance/useStableCallback";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useSimpleAuth();

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

  // Loading simples
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viverblue mx-auto mb-4"></div>
          <p>Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário, não renderizar
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-white">Redirecionando para login...</p>
      </div>
    );
  }

  // Se há erro nos dados do dashboard
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-white bg-red-500/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-2">Erro ao Carregar Dashboard</h3>
          <p className="text-sm text-red-100 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
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
