
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Solution } from "@/lib/supabase";
import { OptimizedDashboardLayout } from "@/components/dashboard/OptimizedDashboardLayout";
import { useEnhancedDashboard } from "@/hooks/dashboard/useEnhancedDashboard";
import { useStableCallback } from "@/hooks/performance/useStableCallback";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { useOnboardingGuard } from "@/hooks/auth/useOnboardingGuard";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useSimpleAuth();
  
  // PROTEÇÃO CRÍTICA: Garantir onboarding obrigatório
  const { isBlocked, isLoading: guardLoading } = useOnboardingGuard();
  
  console.log('[DASHBOARD] Estado de autenticação:', {
    hasUser: !!user,
    hasProfile: !!profile,
    authLoading,
    guardLoading,
    isBlocked,
    profileName: profile?.name,
    onboardingCompleted: profile?.onboarding_completed,
    userId: user?.id?.substring(0, 8)
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

  // Se ainda está carregando auth ou guard, mostrar loading
  if (authLoading || guardLoading) {
    console.log('[DASHBOARD] Aguardando autenticação/validação...');
    return (
      <div className="space-y-8 md:pt-2">
        <div className="text-center py-8">
          <div className="text-white">Carregando dashboard...</div>
        </div>
      </div>
    );
  }

  // Se está bloqueado pelo onboarding guard, não renderizar
  if (isBlocked) {
    console.warn('[DASHBOARD] Acesso bloqueado - onboarding obrigatório');
    return (
      <div className="space-y-8 md:pt-2">
        <div className="text-center py-8">
          <div className="text-white">Redirecionando para onboarding...</div>
        </div>
      </div>
    );
  }

  // Se não há usuário, não renderizar
  if (!user) {
    console.warn('[DASHBOARD] Usuário não autenticado');
    return (
      <div className="space-y-8 md:pt-2">
        <div className="text-center py-8">
          <div className="text-white">Redirecionando...</div>
        </div>
      </div>
    );
  }

  console.log('[DASHBOARD] Renderizando dashboard principal - onboarding validado');

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
