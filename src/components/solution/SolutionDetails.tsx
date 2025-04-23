
import { useParams, useNavigate } from "react-router-dom";
import { useCentralDataStore } from "@/hooks/useCentralDataStore";
import { useSolutionInteractions } from "@/hooks/useSolutionInteractions";
import { SolutionBackButton } from "@/components/solution/SolutionBackButton";
import { SolutionHeaderSection } from "@/components/solution/SolutionHeaderSection";
import { SolutionTabsContent } from "@/components/solution/tabs/SolutionTabsContent";
import { SolutionSidebar } from "@/components/solution/SolutionSidebar";
import { SolutionMobileActions } from "@/components/solution/SolutionMobileActions";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { useEffect, useState } from "react";
import { useLogging } from "@/hooks/useLogging";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { LoadingPage } from "@/components/ui/loading-states";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { log, logError } = useLogging("SolutionDetails");
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const { fetchSolutionDetails } = useCentralDataStore();
  
  // Buscar dados da solução usando React Query
  const { 
    data: solution, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['solution', id],
    queryFn: () => fetchSolutionDetails(id || ''),
    enabled: !!id,
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
  
  // Verificar erro de rede
  useEffect(() => {
    if (error) {
      log("Erro detectado:", { errorMessage: (error as Error).message, id });
      
      if ((error as Error).message && (
        (error as Error).message.includes("fetch") || 
        (error as Error).message.includes("network") ||
        (error as Error).message.includes("Failed to fetch")
      )) {
        setNetworkError(true);
      } else {
        setNetworkError(false);
      }
    } else {
      setNetworkError(false);
    }
  }, [error, id, log]);
  
  // Requisitar dados de interação do usuário com a solução (progresso, etc)
  const { 
    initializing, 
    startImplementation, 
    continueImplementation, 
    toggleFavorite, 
    downloadMaterials,
    // Adicionando propriedade progress para satisfazer dependências
    progress = null
  } = useSolutionInteractions(id, null);
  
  // Função para tentar novamente em caso de erro
  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    // Aguardar um tempo proporcional ao número de tentativas
    const delay = Math.min(1000 * Math.pow(1.5, newRetryCount), 5000);
    
    log("Tentando novamente após erro", { retryCount: newRetryCount, delay });
    
    setTimeout(() => {
      refetch();
    }, delay);
  };

  // Verificar ID inválido ou ausente
  if (!id) {
    navigate("/solutions");
    return null;
  }
  
  if (isLoading) {
    return (
      <LoadingPage 
        message="Carregando detalhes da solução" 
        description="Por favor, aguarde enquanto buscamos informações desta solução..." 
      />
    );
  }
  
  if (networkError) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <SolutionBackButton />
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de conexão</AlertTitle>
          <AlertDescription>
            Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.
          </AlertDescription>
          <Button 
            onClick={handleRetry} 
            className="mt-4 flex items-center gap-2"
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> 
            Tentar novamente
          </Button>
        </Alert>
      </div>
    );
  }
  
  if (!solution) {
    logError("Solução não encontrada", { id });
    return <SolutionNotFound />;
  }
  
  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      <SolutionBackButton />
      
      <SolutionHeaderSection solution={solution} />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <SolutionTabsContent solution={solution} />
          
          <SolutionMobileActions 
            solutionId={solution.id}
            progress={progress}
            startImplementation={startImplementation}
            continueImplementation={continueImplementation}
            initializing={initializing}
          />
        </div>
        
        <div className="md:col-span-1">
          <SolutionSidebar 
            solution={solution}
            progress={progress}
            startImplementation={startImplementation}
            continueImplementation={continueImplementation}
            initializing={initializing}
          />
        </div>
      </div>
    </div>
  );
};

export default SolutionDetails;
