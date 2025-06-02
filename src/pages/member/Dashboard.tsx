
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useOptimizedSolutionsData } from "@/hooks/data/useOptimizedSolutionsData";
import { useDashboardProgress } from "@/hooks/dashboard/useDashboardProgress";
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
  
  console.log('Dashboard: Renderizando', { 
    hasUser: !!user, 
    hasProfile: !!profile,
    authLoading 
  });
  
  // Estado para controle de erros
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Categoria inicial
  const initialCategory = useMemo(() => 
    searchParams.get("category") || "general", 
    [searchParams]
  );
  const [category, setCategory] = useState<string>(initialCategory);
  
  // Hook de soluções - agora mais resiliente
  const { 
    solutions, 
    loading: solutionsLoading, 
    error: solutionsError 
  } = useOptimizedSolutionsData();
  
  console.log('Dashboard: Solutions data', {
    solutionsCount: solutions.length,
    solutionsLoading,
    solutionsError
  });
  
  // Filtrar soluções por categoria
  const filteredSolutions = useMemo(() => {
    if (!solutions || solutions.length === 0) return [];
    return category !== "general" 
      ? solutions.filter(s => s.category === category)
      : solutions;
  }, [solutions, category]);
  
  // Hook de progresso
  const { 
    active, 
    completed, 
    recommended, 
    loading: progressLoading,
    error: progressError
  } = useDashboardProgress(filteredSolutions);
  
  console.log('Dashboard: Progress data', {
    active: active.length,
    completed: completed.length,
    recommended: recommended.length,
    progressLoading
  });
  
  // Verificação de autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('Dashboard: Usuário não autenticado, redirecionando para login');
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);
  
  // Tratamento de erros
  useEffect(() => {
    if (solutionsError || progressError) {
      setHasError(true);
      setErrorMessage(
        solutionsError ? "Erro ao carregar soluções" : "Erro ao carregar progresso"
      );
      console.error('Dashboard: Erro detectado', { solutionsError, progressError });
    }
  }, [solutionsError, progressError]);
  
  // Handlers memoizados
  const handleCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
  }, [setSearchParams]);

  const handleSolutionClick = useCallback((solution: Solution) => {
    navigate(`/solutions/${solution.id}`);
  }, [navigate]);
  
  const handleRetry = useCallback(() => {
    setHasError(false);
    setErrorMessage(null);
    window.location.reload();
  }, []);

  // Toast de boas-vindas
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit && !authLoading && user) {
      const timeoutId = setTimeout(() => {
        toast("Bem-vindo ao seu dashboard personalizado!");
        localStorage.setItem("firstDashboardVisit", "false");
      }, 1500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [authLoading, user]);
  
  // Estado de erro
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

  // Estado de loading
  const isLoading = solutionsLoading || progressLoading || authLoading;
  
  console.log('Dashboard: Renderizando DashboardLayout', {
    isLoading,
    hasData: active.length + completed.length + recommended.length > 0
  });

  return (
    <DashboardLayout
      active={active}
      completed={completed}
      recommended={recommended}
      category={category}
      onCategoryChange={handleCategoryChange}
      onSolutionClick={handleSolutionClick}
      isLoading={isLoading}
    />
  );
};

export default Dashboard;
