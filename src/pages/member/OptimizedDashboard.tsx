
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useOptimizedDashboardData } from "@/hooks/dashboard/useOptimizedDashboardData";
import { useOptimizedDashboardProgress } from "@/hooks/dashboard/useOptimizedDashboardProgress";
import { useOptimizedAuth } from "@/hooks/auth/useOptimizedAuth";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Solution } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Dashboard otimizado com hooks otimizados e menor re-rendering
 */
const OptimizedDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useOptimizedAuth();
  
  // Estado local otimizado
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const initialCategory = useMemo(() => 
    searchParams.get("category") || "general", 
    [searchParams]
  );
  const [category, setCategory] = useState<string>(initialCategory);
  
  // Hooks otimizados
  const { solutions, loading: solutionsLoading, error: solutionsError } = useOptimizedDashboardData();
  
  // Filtrar soluções de forma otimizada
  const filteredSolutions = useMemo(() => {
    if (!solutions?.length) return [];
    return category !== "general" 
      ? solutions.filter(s => s.category === category)
      : solutions;
  }, [solutions, category]);
  
  const { 
    active, 
    completed, 
    recommended, 
    loading: progressLoading,
    error: progressError
  } = useOptimizedDashboardProgress(filteredSolutions);
  
  // Verificação de autenticação otimizada
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // Tratamento de erros otimizado
  useEffect(() => {
    if (solutionsError || progressError) {
      setHasError(true);
      setErrorMessage(
        solutionsError ? "Erro ao carregar soluções" : "Erro ao carregar progresso"
      );
    }
  }, [solutionsError, progressError]);
  
  // Handlers memoizados
  const handleCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
  }, [setSearchParams]);

  const handleSolutionClick = useCallback((solution: Solution) => {
    navigate(`/solution/${solution.id}`);
  }, [navigate]);
  
  const handleRetry = useCallback(() => {
    setHasError(false);
    setErrorMessage(null);
    window.location.reload();
  }, []);

  // Toast de boas-vindas otimizado
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit) {
      const timeoutId = setTimeout(() => {
        toast("Bem-vindo ao seu dashboard personalizado!");
        localStorage.setItem("firstDashboardVisit", "false");
      }, 1500);
      
      return () => clearTimeout(timeoutId);
    }
  }, []);
  
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

  return (
    <DashboardLayout
      active={active}
      completed={completed}
      recommended={recommended}
      category={category}
      onCategoryChange={handleCategoryChange}
      onSolutionClick={handleSolutionClick}
      isLoading={solutionsLoading || progressLoading || authLoading}
    />
  );
};

export default OptimizedDashboard;
