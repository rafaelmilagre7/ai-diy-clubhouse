
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
  console.log("Dashboard renderizando, verificando estado...");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();
  
  // Estado para controle de erros
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Log de diagnóstico para ajudar na depuração
  console.log("Dashboard renderizado:", { 
    user: !!user, 
    profile: !!profile,
    authLoading,
    currentRoute: window.location.pathname,
    currentUrl: window.location.href
  });
  
  // Otimização: Usar useMemo para lembrar o valor da categoria entre renderizações
  const initialCategory = useMemo(() => searchParams.get("category") || "general", [searchParams]);
  const [category, setCategory] = useState<string>(initialCategory);
  
  // Se não temos dados de soluções ainda, use um array vazio como fallback
  const { solutions = [], loading: solutionsLoading, error: solutionsError } = useSolutionsData() || {};
  
  // Log diagnóstico para Supabase
  useEffect(() => {
    if (solutionsError) {
      console.error("Erro ao carregar soluções:", solutionsError);
      setHasError(true);
      setErrorMessage("Não foi possível carregar as soluções. Verifique sua conexão com a internet.");
      toast.error("Erro ao carregar soluções", {
        description: "Tente atualizar a página"
      });
    } else {
      console.log("Soluções carregadas:", solutions?.length || 0);
    }
  }, [solutionsError, solutions]);
  
  // Otimização: Usar useMemo para o array de soluções para evitar recálculos desnecessários
  const filteredSolutions = useMemo(() => {
    if (!solutions || solutions.length === 0) return [];
    return category !== "general" 
      ? solutions.filter(s => s.category === category)
      : solutions;
  }, [solutions, category]);
  
  // Usar as soluções filtradas para obter o progresso
  const { 
    active = [], 
    completed = [], 
    recommended = [], 
    loading: progressLoading,
    error: progressError
  } = useDashboardProgress(filteredSolutions) || {};
  
  // Tratamento de erro para progresso
  useEffect(() => {
    if (progressError) {
      console.error("Erro ao carregar progresso:", progressError);
      setHasError(true);
      setErrorMessage("Não foi possível carregar seu progresso. Por favor, tente novamente mais tarde.");
    }
  }, [progressError]);
  
  // Verificação de autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      console.error("Usuário não autenticado no Dashboard");
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);
  
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

  console.log("Dashboard renderização final com estado:", {
    temSolucoes: (active?.length || 0) + (completed?.length || 0) + (recommended?.length || 0) > 0,
    hasError,
    loading: solutionsLoading || progressLoading || authLoading,
    active: active?.length || 0,
    completed: completed?.length || 0,
    recommended: recommended?.length ||
    0
  });

  // Renderizar componente de erro se necessário
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

  // Para debugging durante o desenvolvimento, mostrar conteúdo mínimo se não houver dados
  if (!active?.length && !completed?.length && !recommended?.length && !solutionsLoading && !progressLoading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-muted-foreground mb-4">Bem-vindo ao seu dashboard.</p>
        <Alert>
          <AlertTitle>Informação de desenvolvimento</AlertTitle>
          <AlertDescription>
            Não foram encontradas soluções para exibir no dashboard. 
            Isso pode ocorrer durante o desenvolvimento ou se você acabou de criar sua conta.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Renderizar o layout com as soluções disponíveis
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
