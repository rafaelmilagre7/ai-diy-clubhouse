
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useOptimizedSolutionsData } from "@/hooks/data/useOptimizedSolutionsData";
import { useDashboardProgress } from "@/hooks/dashboard/useDashboardProgress";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardEmergencyMode } from "@/components/dashboard/DashboardEmergencyMode";
import { Solution } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();
  
  console.log('Dashboard: Renderizando', { 
    hasUser: !!user, 
    hasProfile: !!profile,
    authLoading 
  });
  
  // Estado para controle de erros e emergência
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Categoria inicial
  const initialCategory = useMemo(() => 
    searchParams.get("category") || "general", 
    [searchParams]
  );
  const [category, setCategory] = useState<string>(initialCategory);
  
  // Hook de soluções - com fallbacks
  const { 
    solutions, 
    loading: solutionsLoading, 
    error: solutionsError,
    hasData: hasSolutionsData
  } = useOptimizedSolutionsData();
  
  console.log('Dashboard: Solutions data', {
    solutionsCount: solutions?.length || 0,
    solutionsLoading,
    solutionsError,
    hasSolutionsData
  });
  
  // Filtrar soluções por categoria
  const filteredSolutions = useMemo(() => {
    if (!Array.isArray(solutions) || solutions.length === 0) return [];
    return category !== "general" 
      ? solutions.filter(s => s && s.category === category)
      : solutions;
  }, [solutions, category]);
  
  // Hook de progresso
  const { 
    active, 
    completed, 
    recommended, 
    loading: progressLoading,
    error: progressError,
    hasData: hasProgressData
  } = useDashboardProgress(filteredSolutions);
  
  console.log('Dashboard: Progress data', {
    active: active?.length || 0,
    completed: completed?.length || 0,
    recommended: recommended?.length || 0,
    progressLoading,
    hasProgressData
  });
  
  // Verificação de autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('Dashboard: Usuário não autenticado, redirecionando para login');
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);
  
  // Tratamento de erros com modo de emergência
  useEffect(() => {
    if (solutionsError || progressError) {
      console.error('Dashboard: Erro detectado', { solutionsError, progressError });
      
      setHasError(true);
      if (solutionsError) {
        setErrorMessage("Erro ao carregar soluções");
      } else if (progressError) {
        setErrorMessage("Erro ao carregar progresso");
        toast.error("Erro ao carregar progresso", {
          description: "Algumas funcionalidades podem não estar disponíveis"
        });
      }
      
      // Ativar modo de emergência após múltiplas tentativas
      if (retryCount >= 2) {
        console.warn('Dashboard: Ativando modo de emergência após', retryCount, 'tentativas');
        setEmergencyMode(true);
      }
    }
  }, [solutionsError, progressError, retryCount]);
  
  // Handlers memoizados
  const handleCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
  }, [setSearchParams]);

  const handleSolutionClick = useCallback((solution: Solution) => {
    navigate(`/solutions/${solution.id}`);
  }, [navigate]);
  
  const handleRetry = useCallback(() => {
    console.log('Dashboard: Tentativa de retry', retryCount + 1);
    setHasError(false);
    setErrorMessage(null);
    setRetryCount(prev => prev + 1);
    
    // Se já tentou várias vezes, recarregar a página
    if (retryCount >= 2) {
      window.location.reload();
    }
  }, [retryCount]);

  const handleEmergencyRetry = useCallback(() => {
    setEmergencyMode(false);
    setHasError(false);
    setErrorMessage(null);
    setRetryCount(0);
    window.location.reload();
  }, []);

  // Toast de boas-vindas
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit && !authLoading && user && !hasError) {
      const timeoutId = setTimeout(() => {
        toast("Bem-vindo ao seu dashboard personalizado!");
        localStorage.setItem("firstDashboardVisit", "false");
      }, 1500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [authLoading, user, hasError]);
  
  // MODO DE EMERGÊNCIA - Mostrar interface mínima funcional
  if (emergencyMode) {
    return (
      <DashboardEmergencyMode
        error={errorMessage || "Falha crítica no carregamento"}
        onRetry={handleEmergencyRetry}
      />
    );
  }
  
  // Estado de erro recuperável
  if (hasError && retryCount < 2) {
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
          <RefreshCw className="h-4 w-4" /> Tentar novamente ({retryCount + 1}/3)
        </Button>
      </div>
    );
  }

  // Estado de loading
  const isLoading = solutionsLoading || progressLoading || authLoading;
  
  console.log('Dashboard: Renderizando DashboardLayout', {
    isLoading,
    hasData: (active?.length || 0) + (completed?.length || 0) + (recommended?.length || 0) > 0,
    totalSolutions: solutions?.length || 0
  });

  return (
    <DashboardLayout
      active={active || []}
      completed={completed || []}
      recommended={recommended || []}
      category={category}
      onCategoryChange={handleCategoryChange}
      onSolutionClick={handleSolutionClick}
      isLoading={isLoading}
    />
  );
};

export default Dashboard;
