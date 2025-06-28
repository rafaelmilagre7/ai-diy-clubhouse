
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Solution } from "@/lib/supabase";
import { OptimizedDashboardLayout } from "@/components/dashboard/OptimizedDashboardLayout";
import { useEnhancedDashboard } from "@/hooks/dashboard/useEnhancedDashboard";
import { useStableCallback } from "@/hooks/performance/useStableCallback";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import LoadingScreen from "@/components/common/LoadingScreen";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useSimpleAuth();
  
  console.log('[DASHBOARD] Estado de autenticação:', {
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading,
    profileName: profile?.name,
    userId: user?.id?.substring(0, 8)
  });

  // Hook com dados do dashboard
  const {
    active,
    completed,
    recommended,
    isLoading,
    error,
    performance
  } = useEnhancedDashboard();

  console.log('[DASHBOARD] Estado dos dados:', {
    isLoading,
    hasError: !!error,
    activeCount: active?.length || 0,
    completedCount: completed?.length || 0,
    recommendedCount: recommended?.length || 0,
    performance: performance?.optimized ? 'optimized' : 'fallback'
  });

  // Callback estável para navegação
  const handleSolutionClick = useStableCallback((solution: Solution) => {
    console.log('[DASHBOARD] Navegando para solução:', solution.id);
    navigate(`/solution/${solution.id}`);
  });

  // Log de erro se houver (para monitoramento)
  if (error) {
    console.warn('[DASHBOARD] Erro detectado:', error);
  }

  // Se ainda está carregando auth, mostrar loading
  if (authLoading) {
    console.log('[DASHBOARD] Aguardando autenticação...');
    return <LoadingScreen message="Carregando dashboard..." />;
  }

  // Se não há usuário, não renderizar (o layout já vai redirecionar)
  if (!user) {
    console.warn('[DASHBOARD] Usuário não autenticado');
    return <LoadingScreen message="Redirecionando..." />;
  }

  // Se há erro crítico, mostrar mensagem de erro
  if (error && !isLoading) {
    return (
      <div className="space-y-8 md:pt-2">
        <div className="text-center py-8">
          <div className="text-white mb-4">Ops! Algo deu errado</div>
          <div className="text-neutral-400 mb-4">
            Não foi possível carregar os dados do dashboard
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-viverblue hover:bg-viverblue/80 text-white px-4 py-2 rounded"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  console.log('[DASHBOARD] Renderizando dashboard principal');

  return (
    <div className="p-6">
      <OptimizedDashboardLayout
        active={active || []}
        completed={completed || []}
        recommended={recommended || []}
        onSolutionClick={handleSolutionClick}
        isLoading={isLoading}
        performance={performance}
      />
    </div>
  );
};

export default Dashboard;
