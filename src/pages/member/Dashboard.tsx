
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
  const { isRequired: onboardingRequired, isLoading: onboardingLoading, canProceed } = useOnboardingStatus();
  
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);
  
  const initialCategory = useMemo(() => searchParams.get("category") || "general", [searchParams]);
  const [category, setCategory] = useState<string>(initialCategory);
  
  console.log('[Dashboard] Estado atual:', {
    authLoading,
    onboardingLoading,
    onboardingRequired,
    user: !!user,
    profile: !!profile,
    hasCheckedOnboarding,
    canProceed
  });
  
  // Verificar se precisa completar onboarding (apenas uma vez)
  useEffect(() => {
    if (canProceed && !hasCheckedOnboarding) {
      setHasCheckedOnboarding(true);
      
      if (onboardingRequired) {
        console.log('[Dashboard] Onboarding necessário, redirecionando');
        toast.info("Complete seu onboarding para acessar o dashboard!");
        navigate('/onboarding', { replace: true });
        return;
      }
    }
  }, [onboardingRequired, canProceed, navigate, hasCheckedOnboarding]);
  
  // Verificação de autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('[Dashboard] Usuário não autenticado, redirecionando');
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);
  
  // Carregar soluções
  const { solutions, loading: solutionsLoading, error: solutionsError } = useSolutionsData();
  
  // Tratamento de erro para soluções
  useEffect(() => {
    if (solutionsError) {
      setHasError(true);
      setErrorMessage("Não foi possível carregar as soluções. Verifique sua conexão com a internet.");
      toast.error("Erro ao carregar soluções", {
        description: "Tente atualizar a página"
      });
    }
  }, [solutionsError]);
  
  // Filtrar soluções por categoria
  const filteredSolutions = useMemo(() => {
    if (!solutions || solutions.length === 0) return [];
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

  // Toast de boas-vindas
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit && user && !onboardingRequired && hasCheckedOnboarding) {
      const timeoutId = setTimeout(() => {
        toast("Bem-vindo ao seu dashboard personalizado!");
        localStorage.setItem("firstDashboardVisit", "false");
      }, 1500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [user, onboardingRequired, hasCheckedOnboarding]);
  
  // Se ainda estiver verificando onboarding ou auth, mostrar loading
  if (authLoading || onboardingLoading || !hasCheckedOnboarding || !canProceed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-viverblue mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Verificando seu progresso...</p>
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
        <p className="mt-8 text-sm text-muted-foreground max-w-md text-center">
          Se o problema persistir, tente sair e entrar novamente na plataforma, ou entre em contato com o suporte.
        </p>
      </div>
    );
  }

  return (
    <DashboardLayout
      active={active}
      completed={completed}
      recommended={recommended}
      category={category}
      onCategoryChange={handleCategoryChange}
      onSolutionClick={handleSolutionClick}
      isLoading={solutionsLoading || progressLoading}
    />
  );
};

export default Dashboard;
