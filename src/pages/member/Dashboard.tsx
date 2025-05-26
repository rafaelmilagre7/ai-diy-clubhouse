
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();
  
  // Estado para controle de erros
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [renderCount, setRenderCount] = useState(0);
  
  // Incrementar contador de renderização para debug
  useEffect(() => {
    setRenderCount(prev => {
      const newCount = prev + 1;
      console.log(`Dashboard renderização #${newCount}:`, { 
        user: !!user, 
        profile: !!profile,
        authLoading,
        currentRoute: window.location.pathname,
        timestamp: new Date().toISOString()
      });
      return newCount;
    });
  });
  
  // Otimização: Usar useMemo para lembrar o valor da categoria entre renderizações
  const initialCategory = useMemo(() => searchParams.get("category") || "general", [searchParams]);
  const [category, setCategory] = useState<string>(initialCategory);
  
  // Otimização: Adicionar configuração de staleTime mais longa para reduzir requisições
  const { solutions, loading: solutionsLoading, error: solutionsError } = useSolutionsData();
  
  // Log diagnóstico para Supabase
  useEffect(() => {
    if (solutionsError) {
      console.error("Dashboard: Erro ao carregar soluções:", solutionsError);
      setHasError(true);
      setErrorMessage("Não foi possível carregar as soluções. Verifique sua conexão com a internet.");
      toast.error("Erro ao carregar soluções", {
        description: "Tente atualizar a página"
      });
    } else if (solutions) {
      console.log("Dashboard: Soluções carregadas com sucesso:", solutions?.length || 0);
    }
  }, [solutionsError, solutions]);
  
  // Otimização: Usar useMemo para o array de soluções para evitar recálculos desnecessários
  const filteredSolutions = useMemo(() => {
    if (!solutions || solutions.length === 0) {
      console.log("Dashboard: Sem soluções para filtrar");
      return [];
    }
    const filtered = category !== "general" 
      ? solutions.filter(s => s.category === category)
      : solutions;
    
    console.log("Dashboard: Soluções filtradas:", {
      category,
      total: solutions.length,
      filtered: filtered.length
    });
    
    return filtered;
  }, [solutions, category]);
  
  // Usar as soluções filtradas para obter o progresso
  const { 
    active, 
    completed, 
    recommended, 
    loading: progressLoading,
    error: progressError
  } = useDashboardProgress(filteredSolutions);
  
  // Log dos dados de progresso
  useEffect(() => {
    console.log("Dashboard: Dados de progresso atualizados:", {
      active: active?.length || 0,
      completed: completed?.length || 0,
      recommended: recommended?.length || 0,
      progressLoading,
      progressError: !!progressError
    });
  }, [active, completed, recommended, progressLoading, progressError]);
  
  // Tratamento de erro para progresso
  useEffect(() => {
    if (progressError) {
      console.error("Dashboard: Erro ao carregar progresso:", progressError);
      setHasError(true);
      setErrorMessage("Não foi possível carregar seu progresso. Por favor, tente novamente mais tarde.");
    }
  }, [progressError]);
  
  // Verificação de autenticação - mais robusta
  useEffect(() => {
    console.log("Dashboard: Verificando autenticação:", {
      authLoading,
      user: !!user,
      shouldRedirect: !authLoading && !user
    });
    
    if (!authLoading && !user) {
      console.error("Dashboard: Usuário não autenticado, redirecionando para login");
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);
  
  // Função para lidar com a mudança de categoria - memoizada para evitar recriação
  const handleCategoryChange = useCallback((newCategory: string) => {
    console.log("Dashboard: Mudando categoria de", category, "para", newCategory);
    setCategory(newCategory);
    setSearchParams({ category: newCategory });
  }, [setSearchParams, category]);

  // Função para navegar para a página de detalhes da solução - memoizada
  const handleSolutionClick = useCallback((solution: Solution) => {
    console.log("Dashboard: Navegando para solução:", solution.id);
    navigate(`/solution/${solution.id}`);
  }, [navigate]);
  
  // Função para atualizar a página em caso de erro
  const handleRetry = () => {
    console.log("Dashboard: Tentando novamente após erro");
    setHasError(false);
    setErrorMessage(null);
    window.location.reload();
  };

  // Controle para exibir toast apenas na primeira visita usando localStorage
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("firstDashboardVisit") !== "false";
    
    if (isFirstVisit && user) {
      // Atrasar ligeiramente o toast para evitar conflito com renderização inicial
      const timeoutId = setTimeout(() => {
        console.log("Dashboard: Exibindo toast de boas-vindas");
        toast("Bem-vindo ao seu dashboard personalizado!");
        localStorage.setItem("firstDashboardVisit", "false");
      }, 1500);
      
      // Limpeza do timeout quando o componente é desmontado
      return () => clearTimeout(timeoutId);
    }
  }, [user]);

  // Log antes de renderizar
  console.log("Dashboard: Prestes a renderizar com estado:", {
    hasError,
    authLoading,
    solutionsLoading,
    progressLoading,
    renderCount
  });
  
  // Se houver erro, mostrar mensagem de erro com opção de tentar novamente
  if (hasError) {
    console.log("Dashboard: Renderizando estado de erro");
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

  console.log("Dashboard: Renderizando DashboardLayout");
  
  // Renderizar o layout diretamente, sem usar um componente de carregamento bloqueante
  return (
    <DashboardLayout
      active={active || []}
      completed={completed || []}
      recommended={recommended || []}
      category={category}
      onCategoryChange={handleCategoryChange}
      onSolutionClick={handleSolutionClick}
      isLoading={solutionsLoading || progressLoading || authLoading}
    />
  );
};

export default Dashboard;
