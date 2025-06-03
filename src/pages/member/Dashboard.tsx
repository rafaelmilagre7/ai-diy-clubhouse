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
import { useOptimizedAuth } from "@/hooks/auth/useOptimizedAuth";

const Dashboard = () => {
  console.log("Dashboard: Componente iniciando");
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, isLoading: authLoading, isAuthenticated } = useOptimizedAuth();
  
  console.log("Dashboard: Estado de autenticação:", {
    user: !!user,
    profile: !!profile,
    authLoading,
    isAuthenticated
  });
  
  // Estado para controle de erros
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Otimização: Usar useMemo para lembrar o valor da categoria entre renderizações
  const initialCategory = useMemo(() => searchParams.get("category") || "general", [searchParams]);
  const [category, setCategory] = useState<string>(initialCategory);
  
  console.log("Dashboard: Categoria atual:", category);
  
  // Otimização: Adicionar configuração de staleTime mais longa para reduzir requisições
  const { solutions, loading: solutionsLoading, error: solutionsError } = useSolutionsData();
  
  console.log("Dashboard: Dados de soluções:", {
    solutions: solutions?.length || 0,
    solutionsLoading,
    solutionsError: !!solutionsError
  });
  
  // Tratamento de erro para soluções
  useEffect(() => {
    if (solutionsError) {
      console.error("Dashboard: Erro nas soluções:", solutionsError);
      setHasError(true);
      setErrorMessage("Não foi possível carregar as soluções. Verifique sua conexão com a internet.");
      toast.error("Erro ao carregar soluções", {
        description: "Tente atualizar a página"
      });
    }
  }, [solutionsError, solutions]);
  
  // Otimização: Usar useMemo para o array de soluções para evitar recálculos desnecessários
  const filteredSolutions = useMemo(() => {
    if (!solutions || solutions.length === 0) return [];
    return category !== "general" 
      ? solutions.filter(s => s.category === category)
      : solutions;
  }, [solutions, category]);
  
  console.log("Dashboard: Soluções filtradas:", filteredSolutions.length);
  
  // Usar as soluções filtradas para obter o progresso
  const { 
    active, 
    completed, 
    recommended, 
    loading: progressLoading,
    error: progressError
  } = useDashboardProgress(filteredSolutions);
  
  console.log("Dashboard: Dados de progresso:", {
    active: active?.length || 0,
    completed: completed?.length || 0,
    recommended: recommended?.length || 0,
    progressLoading,
    progressError: !!progressError
  });
  
  // Tratamento de erro para progresso
  useEffect(() => {
    if (progressError) {
      console.error("Dashboard: Erro no progresso:", progressError);
      setHasError(true);
      setErrorMessage("Não foi possível carregar seu progresso. Por favor, tente novamente mais tarde.");
    }
  }, [progressError]);
  
  // Verificação de autenticação
  useEffect(() => {
    console.log("Dashboard: Verificando autenticação:", { authLoading, isAuthenticated });
    if (!authLoading && !isAuthenticated) {
      console.log("Dashboard: Redirecionando para login");
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);
  
  // Função para lidar com a mudança de categoria - memoizada para evitar recriação
  const handleCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
  }, [setSearchParams]);

  // Função para navegar para a página de detalhes da solução - memoizada
  const handleSolutionClick = useCallback((solution: Solution) => {
    navigate(`/solution/${solution.id}`);
  }, [navigate]);
  
  // Função para atualizar a página em caso de erro
  const handleRetry = () => {
    setHasError(false);
    setErrorMessage(null);
    window.location.reload();
  };

  // Controle para exibir toast apenas na primeira visita usando localStorage
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit) {
      // Atrasar ligeiramente o toast para evitar conflito com renderização inicial
      const timeoutId = setTimeout(() => {
        toast("Bem-vindo ao seu dashboard personalizado!");
        localStorage.setItem("firstDashboardVisit", "false");
      }, 1500);
      
      // Limpeza do timeout quando o componente é desmontado
      return () => clearTimeout(timeoutId);
    }
  }, []);
  
  // Se houver erro, mostrar mensagem de erro com opção de tentar novamente
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
          onClick={() => window.location.reload()} 
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

  console.log("Dashboard: Renderizando layout principal");

  // Renderizar o layout diretamente, sem usar um componente de carregamento bloqueante
  return (
    <DashboardLayout
      active={active}
      completed={completed}
      recommended={recommended}
      category={category}
      onCategoryChange={(newCategory: string) => {
        setCategory(newCategory);
        setSearchParams({ category: newCategory });
      }}
      onSolutionClick={(solution: Solution) => {
        navigate(`/solution/${solution.id}`);
      }}
      isLoading={solutionsLoading || progressLoading || authLoading}
    />
  );
};

export default Dashboard;
