
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Solution } from "@/lib/supabase";
import { OptimizedDashboardLayout } from "@/components/dashboard/OptimizedDashboardLayout";
import { useEnhancedDashboard } from "@/hooks/dashboard/useEnhancedDashboard";
import { useStableCallback } from "@/hooks/performance/useStableCallback";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useOnboardingGuard } from "@/hooks/auth/useOnboardingGuard";
import LoadingScreen from "@/components/common/LoadingScreen";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useSimpleAuth();
  
  // PROTEÇÃO CRÍTICA: Garantir onboarding obrigatório
  const { isBlocked, isLoading: guardLoading } = useOnboardingGuard();
  
  console.log('[DEBUG-DASHBOARD] 🎯 Estado de autenticação:', {
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading,
    guardLoading,
    isBlocked,
    profileName: profile?.name,
    onboardingCompleted: profile?.onboarding_completed,
    userId: user?.id?.substring(0, 8) + '***'
  });

  // Hook híbrido com otimização + fallback automático
  const {
    active,
    completed,
    recommended,
    isLoading,
    error,
    performance
  } = useEnhancedDashboard();

  console.log('[DEBUG-DASHBOARD] 📊 Estado dos dados:', {
    isLoading,
    hasError: !!error,
    errorMessage: error,
    activeCount: active?.length || 0,
    completedCount: completed?.length || 0,
    recommendedCount: recommended?.length || 0,
    performance: performance?.optimized ? 'optimized' : 'fallback'
  });

  // Callback estável para navegação
  const handleSolutionClick = useStableCallback((solution: Solution) => {
    console.log('[DEBUG-DASHBOARD] 🎯 Navegando para solução:', solution.id);
    navigate(`/solution/${solution.id}`);
  });

  // Log de erro se houver (para monitoramento)
  if (error) {
    console.error('[DEBUG-DASHBOARD] ❌ Erro detectado:', error);
  }

  // Se ainda está carregando auth ou guard, mostrar loading
  if (authLoading || guardLoading) {
    console.log('[DEBUG-DASHBOARD] ⏳ Aguardando autenticação/validação...');
    return (
      <div className="space-y-8 md:pt-2">
        <LoadingScreen message="Carregando dashboard..." />
      </div>
    );
  }

  // Se está bloqueado pelo onboarding guard, não renderizar
  if (isBlocked) {
    console.warn('[DEBUG-DASHBOARD] 🚫 Acesso bloqueado - onboarding obrigatório');
    return (
      <div className="space-y-8 md:pt-2">
        <div className="text-center py-8">
          <div className="text-white bg-orange-500/20 border border-orange-500/30 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">Onboarding Obrigatório</h3>
            <p className="text-sm text-orange-100">
              Complete seu cadastro para acessar o dashboard.
            </p>
            <button 
              onClick={() => navigate('/onboarding')}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
            >
              Completar Cadastro
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se não há usuário, não renderizar
  if (!user) {
    console.warn('[DEBUG-DASHBOARD] ❌ Usuário não autenticado');
    return (
      <div className="space-y-8 md:pt-2">
        <div className="text-center py-8">
          <div className="text-white bg-red-500/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">Erro de Autenticação</h3>
            <p className="text-sm text-red-100">
              Usuário não autenticado. Redirecionando...
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Se há erro nos dados do dashboard
  if (error && !isLoading) {
    console.error('[DEBUG-DASHBOARD] 💥 Erro nos dados do dashboard:', error);
    return (
      <div className="space-y-8 md:pt-2">
        <div className="text-center py-8">
          <div className="text-white bg-red-500/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">Erro ao Carregar Dashboard</h3>
            <p className="text-sm text-red-100 mb-4">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('[DEBUG-DASHBOARD] ✅ Renderizando dashboard principal - onboarding validado');

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
