
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSolutionsData } from "@/hooks/useSolutionsData";
import { useDashboardProgress } from "@/hooks/useDashboardProgress";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Solution } from "@/lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth";

const Dashboard = () => {
  console.log("🚀 Dashboard: Componente iniciado");
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();
  
  // Estado para controle de erros
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [renderStep, setRenderStep] = useState("initializing");
  
  console.log("📊 Dashboard: Estado atual", { 
    user: !!user, 
    profile: !!profile,
    authLoading,
    hasError,
    renderStep,
    currentRoute: window.location.pathname
  });
  
  // Categoria inicial
  const initialCategory = useMemo(() => {
    const category = searchParams.get("category") || "all";
    console.log("📂 Dashboard: Categoria inicial definida", category);
    return category;
  }, [searchParams]);
  
  const [category, setCategory] = useState<string>(initialCategory);
  
  // Hook de soluções com logs
  console.log("🔍 Dashboard: Iniciando useSolutionsData...");
  const { solutions, loading: solutionsLoading, error: solutionsError } = useSolutionsData();
  
  console.log("📋 Dashboard: Dados do useSolutionsData", {
    solutions: solutions?.length || 0,
    solutionsLoading,
    solutionsError: !!solutionsError
  });
  
  // Filtrar soluções
  const filteredSolutions = useMemo(() => {
    console.log("🔄 Dashboard: Filtrando soluções", { category, totalSolutions: solutions?.length || 0 });
    if (!solutions || solutions.length === 0) {
      console.log("❌ Dashboard: Nenhuma solução disponível para filtrar");
      return [];
    }
    
    const filtered = category !== "all" 
      ? solutions.filter(s => s.category === category)
      : solutions;
      
    console.log("✅ Dashboard: Soluções filtradas", { total: filtered.length, category });
    return filtered;
  }, [solutions, category]);
  
  // Hook de progresso com logs
  console.log("📈 Dashboard: Iniciando useDashboardProgress...");
  const { 
    active, 
    completed, 
    recommended, 
    loading: progressLoading,
    error: progressError
  } = useDashboardProgress(filteredSolutions);
  
  console.log("📊 Dashboard: Dados do useDashboardProgress", {
    active: active?.length || 0,
    completed: completed?.length || 0,
    recommended: recommended?.length || 0,
    progressLoading,
    progressError: !!progressError
  });
  
  // Verificação de autenticação
  useEffect(() => {
    console.log("🔐 Dashboard: Verificando autenticação", { user: !!user, authLoading });
    
    if (!authLoading && !user) {
      console.error("❌ Dashboard: Usuário não autenticado, redirecionando");
      setRenderStep("redirecting_to_login");
      navigate('/login', { replace: true });
    } else if (user) {
      console.log("✅ Dashboard: Usuário autenticado");
      setRenderStep("authenticated");
    }
  }, [user, authLoading, navigate]);
  
  // Tratamento de erro para soluções
  useEffect(() => {
    if (solutionsError) {
      console.error("❌ Dashboard: Erro ao carregar soluções:", solutionsError);
      setHasError(true);
      setErrorMessage("Não foi possível carregar as soluções. Verifique sua conexão.");
      setRenderStep("error_solutions");
    } else if (solutions) {
      console.log("✅ Dashboard: Soluções carregadas com sucesso:", solutions.length);
      setRenderStep("solutions_loaded");
    }
  }, [solutionsError, solutions]);
  
  // Tratamento de erro para progresso
  useEffect(() => {
    if (progressError) {
      console.error("❌ Dashboard: Erro ao carregar progresso:", progressError);
      setHasError(true);
      setErrorMessage("Não foi possível carregar seu progresso.");
      setRenderStep("error_progress");
    } else if (active !== undefined && completed !== undefined && recommended !== undefined) {
      console.log("✅ Dashboard: Progresso carregado com sucesso");
      setRenderStep("progress_loaded");
    }
  }, [progressError, active, completed, recommended]);
  
  // Log do estado de loading geral
  const isLoading = solutionsLoading || progressLoading || authLoading;
  
  useEffect(() => {
    console.log("⏳ Dashboard: Estado de carregamento", {
      solutionsLoading,
      progressLoading, 
      authLoading,
      isLoading,
      renderStep
    });
  }, [solutionsLoading, progressLoading, authLoading, isLoading, renderStep]);
  
  // Função para lidar com a mudança de categoria
  const handleCategoryChange = useCallback((newCategory: string) => {
    console.log("📂 Dashboard: Mudando categoria", { from: category, to: newCategory });
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
    setRenderStep("category_changed");
  }, [setSearchParams, category]);

  // Função para navegar para a página de detalhes da solução
  const handleSolutionClick = useCallback((solution: Solution) => {
    console.log("🔗 Dashboard: Clicando na solução", solution.id);
    navigate(`/solution/${solution.id}`);
  }, [navigate]);
  
  // Função para atualizar a página em caso de erro
  const handleRetry = () => {
    console.log("🔄 Dashboard: Tentando novamente");
    setHasError(false);
    setErrorMessage(null);
    setRenderStep("retrying");
    window.location.reload();
  };

  // Toast de boas-vindas
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit && !isLoading && !hasError) {
      const timeoutId = setTimeout(() => {
        console.log("👋 Dashboard: Mostrando toast de boas-vindas");
        toast("Bem-vindo ao seu dashboard personalizado!");
        localStorage.setItem("firstDashboardVisit", "false");
      }, 1500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, hasError]);
  
  // Log final antes da renderização
  console.log("🎨 Dashboard: Preparando renderização", {
    hasError,
    isLoading,
    renderStep,
    hasSolutions: !!solutions?.length,
    hasProgress: !!(active || completed || recommended)
  });
  
  // Se houver erro, mostrar mensagem de erro
  if (hasError) {
    console.log("💥 Dashboard: Renderizando tela de erro");
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
          Se o problema persistir, tente sair e entrar novamente na plataforma.
        </p>
      </div>
    );
  }

  // Renderizar o layout do dashboard
  console.log("🏗️ Dashboard: Renderizando DashboardLayout", {
    activeCount: active?.length || 0,
    completedCount: completed?.length || 0,
    recommendedCount: recommended?.length || 0,
    isLoading
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
