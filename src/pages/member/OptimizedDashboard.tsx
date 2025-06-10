
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import { useOptimizedDashboardData } from "@/hooks/dashboard/useOptimizedDashboardData";
import { useLoading } from "@/contexts/LoadingContext";
import { toast } from "sonner";
import { Solution } from "@/lib/supabase";
import { useAuth } from "@/contexts/auth";
import { logger } from "@/utils/logger";
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ProgressiveRenderer from '@/components/dashboard/ProgressiveRenderer';
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const OptimizedDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  const { isCriticalLoading } = useLoading();
  
  // Estado para timeout de segurança
  const [forceRender, setForceRender] = useState(false);
  
  // Estado local mínimo
  const initialCategory = useMemo(() => searchParams.get("category") || "general", [searchParams]);
  const [category, setCategory] = useState<string>(initialCategory);
  
  // Hook centralizado para todos os dados
  const {
    solutions,
    active,
    completed,
    recommended,
    isLoading: dataLoading,
    error: dataError,
    canFetchData,
    invalidateData,
    stats
  } = useOptimizedDashboardData();

  // Timeout de segurança para evitar loading infinito
  useEffect(() => {
    const timer = setTimeout(() => {
      logger.warn('[OptimizedDashboard] Timeout de segurança ativado');
      setForceRender(true);
    }, 5000); // 5 segundos

    return () => clearTimeout(timer);
  }, []);

  logger.info('[OptimizedDashboard] Estado atual', {
    authLoading,
    onboardingLoading,
    onboardingRequired,
    dataLoading,
    canFetchData,
    solutionsCount: solutions?.length || 0,
    forceRender,
    component: 'OPTIMIZED_DASHBOARD'
  });
  
  // Verificações de redirecionamento otimizadas
  const shouldRedirectToOnboarding = useMemo(() => 
    !authLoading && !onboardingLoading && onboardingRequired
  , [authLoading, onboardingLoading, onboardingRequired]);
  
  const shouldRedirectToLogin = useMemo(() => 
    !authLoading && !user
  , [authLoading, user]);

  // Efeitos de redirecionamento
  useMemo(() => {
    if (shouldRedirectToOnboarding) {
      logger.info('[OptimizedDashboard] Onboarding necessário, redirecionando');
      toast.info("Complete seu onboarding para acessar o dashboard!");
      navigate('/onboarding', { replace: true });
      return;
    }
    
    if (shouldRedirectToLogin) {
      logger.warn('[OptimizedDashboard] Usuário não autenticado, redirecionando');
      navigate('/login', { replace: true });
      return;
    }
  }, [shouldRedirectToOnboarding, shouldRedirectToLogin, navigate]);
  
  // Soluções filtradas por categoria
  const filteredSolutions = useMemo(() => {
    if (!solutions || solutions.length === 0) return [];
    
    try {
      return category !== "general" 
        ? solutions.filter(s => s?.category === category)
        : solutions;
    } catch (error) {
      logger.warn('[OptimizedDashboard] Erro ao filtrar soluções', { error, category });
      return solutions || [];
    }
  }, [solutions, category]);
  
  // Handlers memoizados
  const handleCategoryChange = useCallback((newCategory: string) => {
    try {
      setCategory(newCategory);
      setSearchParams({ category: newCategory });
    } catch (error) {
      logger.warn('[OptimizedDashboard] Erro ao alterar categoria', { error, newCategory });
    }
  }, [setSearchParams]);

  const handleSolutionClick = useCallback((solution: Solution) => {
    try {
      if (solution?.id) {
        navigate(`/solution/${solution.id}`);
      } else {
        toast.error("Solução inválida");
      }
    } catch (error) {
      logger.error('[OptimizedDashboard] Erro ao navegar para solução', { error, solutionId: solution?.id });
      toast.error("Erro ao abrir solução");
    }
  }, [navigate]);
  
  const handleRetry = useCallback(() => {
    invalidateData();
    window.location.reload();
  }, [invalidateData]);

  // Loading states com prioridade e timeout de segurança
  if (!forceRender && (isCriticalLoading || authLoading || onboardingLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viverblue mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // Redirecionamentos - retornar null para evitar flash
  if (!forceRender && (shouldRedirectToOnboarding || shouldRedirectToLogin)) {
    return null;
  }
  
  // Erro de dados críticos
  if (dataError && !solutions?.length) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Problema ao carregar dados</h2>
          <p className="text-muted-foreground">Não foi possível carregar suas soluções</p>
          <button 
            onClick={handleRetry} 
            className="px-4 py-2 bg-viverblue text-white rounded hover:bg-viverblue/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={({ error, onRetry }) => (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Problema no Dashboard</h2>
            <p className="text-muted-foreground">Encontramos um problema ao carregar seu dashboard</p>
            <button onClick={onRetry} className="px-4 py-2 bg-viverblue text-white rounded">
              Recarregar
            </button>
          </div>
        </div>
      )}
      maxRetries={2}
    >
      <ProgressiveRenderer priority="high">
        <DashboardLayout
          active={active}
          completed={completed}
          recommended={recommended}
          category={category}
          onCategoryChange={handleCategoryChange}
          onSolutionClick={handleSolutionClick}
          isLoading={dataLoading}
        />
      </ProgressiveRenderer>
    </ErrorBoundary>
  );
};

export default OptimizedDashboard;
