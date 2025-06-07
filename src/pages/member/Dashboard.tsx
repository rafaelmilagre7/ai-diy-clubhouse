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
import { SEOHead } from "@/components/SEO/SEOHead";
import { OrganizationStructuredData } from "@/components/SEO/StructuredData";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, profile, isLoading: authLoading } = useAuth();
  
  // Estado para controle de erros
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Categoria inicial baseada na URL
  const initialCategory = useMemo(() => searchParams.get("category") || "general", [searchParams]);
  const [category, setCategory] = useState<string>(initialCategory);
  
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
  }, [solutionsError, solutions]);
  
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
  
  // Verificação de autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);
  
  // Handlers
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

  // Toast de boas-vindas na primeira visita
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
  
  // Se houver erro, mostrar mensagem de erro
  if (hasError) {
    return (
      <>
        <SEOHead page="dashboard" />
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
      </>
    );
  }

  return (
    <>
      <SEOHead page="dashboard" />
      <OrganizationStructuredData />
      <DashboardLayout
        active={active}
        completed={completed}
        recommended={recommended}
        category={category}
        onCategoryChange={handleCategoryChange}
        onSolutionClick={handleSolutionClick}
        isLoading={solutionsLoading || progressLoading || authLoading}
      />
    </>
  );
};

export default Dashboard;
