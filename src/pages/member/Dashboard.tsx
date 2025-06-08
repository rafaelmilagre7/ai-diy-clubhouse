
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();
  const { isRequired: onboardingRequired, isLoading: onboardingLoading } = useOnboardingStatus();
  
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const initialCategory = useMemo(() => searchParams.get("category") || "general", [searchParams]);
  const [category, setCategory] = useState<string>(initialCategory);
  
  console.log('[Dashboard] Estado atual:', {
    authLoading,
    onboardingLoading,
    onboardingRequired,
    user: !!user,
    profile: !!profile
  });
  
  // Verificar se precisa completar onboarding
  useEffect(() => {
    if (!authLoading && !onboardingLoading && onboardingRequired) {
      console.log('[Dashboard] Onboarding necessário, redirecionando');
      toast.info("Complete seu onboarding para acessar o dashboard!");
      navigate('/onboarding', { replace: true });
      return;
    }
  }, [onboardingRequired, authLoading, onboardingLoading, navigate]);
  
  // Verificação de autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[Dashboard] Usuário não autenticado, redirecionando');
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);
  
  // Carregar soluções apenas se o usuário pode prosseguir
  const { solutions, loading: solutionsLoading, error: solutionsError } = useSolutionsData();
  
  // Tratamento de erro para soluções
  useEffect(() => {
    if (solutionsError) {
      console.error('[Dashboard] Erro nas soluções:', solutionsError);
      setHasError(true);
      setErrorMessage("Não foi possível carregar as soluções. Verifique sua conexão com a internet.");
    }
  }, [solutionsError]);
  
  // Filtrar soluções por categoria
  const filteredSolutions = useMemo(() => {
    if (!solutions || !Array.isArray(solutions) || solutions.length === 0) {
      return [];
    }
    return category !== "general" 
      ? solutions.filter(s => s.category === category)
      : solutions;
  }, [solutions, category]);
  
  // Obter progresso das soluções
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
      console.error('[Dashboard] Erro no progresso:', progressError);
      setHasError(true);
      setErrorMessage("Não foi possível carregar seu progresso. Por favor, tente novamente mais tarde.");
    }
  }, [progressError]);
  
  const handleCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
  }, [setSearchParams]);

  const handleSolutionClick = useCallback((solution: Solution) => {
    navigate(`/solution/${solution.id}`);
  }, [navigate]);
  
  const handleRetry = () => {
    setHasError(false);
    setErrorMessage(null);
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
  
  // Se houver erro, mostrar mensagem de erro
  if (hasError) {
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

  // Renderizar dashboard
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
