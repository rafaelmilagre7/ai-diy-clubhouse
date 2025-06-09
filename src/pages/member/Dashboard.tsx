
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useDashboardProgress } from "@/hooks/useDashboardProgress";
import { useOnboardingStatus } from "@/components/onboarding/hooks/useOnboardingStatus";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Solution } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { logger } from "@/utils/logger";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const initialCategory = useMemo(() => searchParams.get("category") || "general", [searchParams]);
  const [category, setCategory] = useState<string>(initialCategory);
  
  logger.info('[Dashboard] Estado atual', {
    authLoading,
    onboardingLoading,
    onboardingRequired,
    user: !!user,
    profile: !!profile,
    retryCount,
    component: 'DASHBOARD'
  });
  
  // Verificar se precisa completar onboarding
  useEffect(() => {
    if (!authLoading && !onboardingLoading && onboardingRequired) {
      logger.info('[Dashboard] Onboarding necessário, redirecionando');
      toast.info("Complete seu onboarding para acessar o dashboard!");
      navigate('/onboarding', { replace: true });
      return;
    }
  }, [onboardingRequired, authLoading, onboardingLoading, navigate]);
  
  // Verificação de autenticação com fallback
  useEffect(() => {
    if (!authLoading && !user) {
      logger.warn('[Dashboard] Usuário não autenticado, redirecionando');
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);
  
  // Carregar soluções apenas se o usuário pode prosseguir
  const { solutions, loading: solutionsLoading, error: solutionsError } = useSolutionsData();
  
  // Tratamento de erro para soluções com retry
  useEffect(() => {
    if (solutionsError) {
      logger.error('[Dashboard] Erro nas soluções', {
        error: solutionsError,
        retryCount,
        component: 'DASHBOARD'
      });
      
      setHasError(true);
      setErrorMessage("Não foi possível carregar as soluções. Verifique sua conexão com a internet.");
      
      // Auto-retry limitado
      if (retryCount < 2) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          setHasError(false);
          setErrorMessage(null);
        }, 3000);
      }
    }
  }, [solutionsError, retryCount]);
  
  // Filtrar soluções por categoria com fallback
  const filteredSolutions = useMemo(() => {
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      return [];
    }
    
    try {
      return category !== "general" 
        ? solutions.filter(s => s?.category === category)
        : solutions;
    } catch (error) {
      logger.warn('[Dashboard] Erro ao filtrar soluções', {
        error,
        category,
        solutionsCount: solutions?.length || 0,
        component: 'DASHBOARD'
      });
      return solutions || [];
    }
  }, [solutions, category]);
  
  // Obter progresso das soluções com tratamento de erro
  const { 
    active, 
    completed, 
    recommended, 
    loading: progressLoading,
    error: progressError
  } = useDashboardProgress(filteredSolutions);
  
  // Tratamento de erro para progresso
  useEffect(() => {
    if (progressError) {
      logger.error('[Dashboard] Erro no progresso', {
        error: progressError,
        component: 'DASHBOARD'
      });
      
      // Não bloquear o dashboard por erro de progresso
      setHasError(false);
      toast.error("Não foi possível carregar seu progresso, mas você pode continuar usando o dashboard.");
    }
  }, [progressError]);
  
  const handleCategoryChange = useCallback((newCategory: string) => {
    try {
      setCategory(newCategory);
      setSearchParams({ category: newCategory });
    } catch (error) {
      logger.warn('[Dashboard] Erro ao alterar categoria', {
        error,
        newCategory,
        component: 'DASHBOARD'
      });
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
      logger.error('[Dashboard] Erro ao navegar para solução', {
        error,
        solutionId: solution?.id,
        component: 'DASHBOARD'
      });
      toast.error("Erro ao abrir solução");
    }
  }, [navigate]);
  
  const handleRetry = () => {
    setHasError(false);
    setErrorMessage(null);
    setRetryCount(0);
    window.location.reload();
  };

  // Se ainda estiver verificando auth ou onboarding
  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viverblue mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }
  
  // Se onboarding for necessário, não renderizar nada (já foi redirecionado)
  if (onboardingRequired) {
    return null;
  }
  
  // Se houver erro crítico, mostrar mensagem de erro
  if (hasError && retryCount >= 2) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Alert variant="destructive" className="mb-4 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problema ao carregar o dashboard</AlertTitle>
          <AlertDescription>
            {errorMessage || "Ocorreu um erro inesperado. Por favor, tente novamente."}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={handleRetry} 
          className="mt-4 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    );
  }

  // Renderizar dashboard com fallbacks seguros
  return (
    <DashboardLayout
      active={active || []}
      completed={completed || []}
      recommended={recommended || []}
      category={category}
      onCategoryChange={handleCategoryChange}
      onSolutionClick={handleSolutionClick}
      isLoading={solutionsLoading || progressLoading}
    />
  );
};

export default Dashboard;
