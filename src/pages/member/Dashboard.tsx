
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
import { Card, CardContent } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { AlertCircle, RefreshCw, Wifi } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-surface-subtle to-surface-elevated">
        <Card variant="elevated" className="p-8 max-w-sm text-center">
          <CardContent className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <Text variant="body" textColor="secondary">
              Carregando sua experiência...
            </Text>
          </CardContent>
        </Card>
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
      <Container size="md" className="py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Card variant="outline" className="max-w-md mx-auto text-center">
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-error/10 rounded-2xl">
                <Wifi className="h-12 w-12 text-error" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Text variant="subsection" textColor="primary">
                Problema de Conexão
              </Text>
              <Text variant="body" textColor="secondary">
                {errorMessage || "Ocorreu um erro inesperado. Por favor, tente novamente."}
              </Text>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleRetry} className="hover-scale">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
              
              <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
                <AlertCircle className="h-4 w-4 mr-2" />
                Recarregar Página
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
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
