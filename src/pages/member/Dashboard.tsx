
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
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, RotateCcw } from 'lucide-react';

// Componente de fallback específico para o dashboard
const DashboardErrorFallback = ({ error, onRetry, onGoHome }: any) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Problema no Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Encontramos um problema ao carregar seu dashboard. Você pode tentar recarregar ou acessar as soluções diretamente.
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button onClick={onRetry} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Recarregar
            </Button>
            
            <Button variant="outline" onClick={() => window.location.href = '/solutions'} className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Ver Soluções
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Memoizar categoria inicial para evitar recriações
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
  
  // Memoizar soluções para evitar recriações desnecessárias
  const stableSolutions = useMemo(() => {
    if (!solutions || !Array.isArray(solutions)) return [];
    return solutions;
  }, [solutions?.length, solutions?.map(s => s.id).join(',')]);
  
  // Filtrar soluções por categoria de forma memoizada
  const filteredSolutions = useMemo(() => {
    if (!stableSolutions || stableSolutions.length === 0) {
      return [];
    }
    
    try {
      return category !== "general" 
        ? stableSolutions.filter(s => s?.category === category)
        : stableSolutions;
    } catch (error) {
      logger.warn('[Dashboard] Erro ao filtrar soluções', {
        error,
        category,
        solutionsCount: stableSolutions?.length || 0,
        component: 'DASHBOARD'
      });
      return stableSolutions || [];
    }
  }, [stableSolutions, category]);
  
  // Obter progresso das soluções - agora com soluções estáveis
  const { 
    active, 
    completed, 
    recommended, 
    loading: progressLoading,
    error: progressError,
    isEmpty
  } = useDashboardProgress(filteredSolutions);
  
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
  
  // Callbacks memoizados para evitar recriações
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
  
  const handleRetry = useCallback(() => {
    setHasError(false);
    setErrorMessage(null);
    setRetryCount(0);
    window.location.reload();
  }, []);

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
    <ErrorBoundary
      fallback={DashboardErrorFallback}
      maxRetries={2}
      showDetails={false}
      resetOnLocationChange={true}
      onError={(error, errorInfo) => {
        logger.error('[Dashboard] Erro capturado pelo ErrorBoundary', {
          error: error.message,
          componentStack: errorInfo.componentStack,
          component: 'Dashboard'
        });
      }}
    >
      <DashboardLayout
        active={active || []}
        completed={completed || []}
        recommended={recommended || []}
        category={category}
        onCategoryChange={handleCategoryChange}
        onSolutionClick={handleSolutionClick}
        isLoading={solutionsLoading || progressLoading}
      />
    </ErrorBoundary>
  );
};

export default Dashboard;
