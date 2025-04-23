
import { useParams, useLocation } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionInteractions } from "@/hooks/useSolutionInteractions";
import { SolutionBackButton } from "@/components/solution/SolutionBackButton";
import { SolutionHeaderSection } from "@/components/solution/SolutionHeaderSection";
import { SolutionTabsContent } from "@/components/solution/tabs/SolutionTabsContent";
import { SolutionSidebar } from "@/components/solution/SolutionSidebar";
import { SolutionMobileActions } from "@/components/solution/SolutionMobileActions";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { useEffect, useState } from "react";
import { useToolsData } from "@/hooks/useToolsData";
import { useLogging } from "@/hooks/useLogging";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { log, logError } = useLogging("SolutionDetails");
  const { toast: uiToast } = useToast();
  const [retryCount, setRetryCount] = useState(0);
  const [networkError, setNetworkError] = useState(false);
  
  // Log inicial detalhado para debug
  useEffect(() => {
    log("SolutionDetails montado", { 
      id,
      path: location.pathname,
      search: location.search,
      currentRoute: window.location.href
    });
    
    // Toast para informar usuário sobre carregamento
    toast.info("Carregando detalhes da solução...");
  }, [id, location, log]);
  
  // Garantir que os dados das ferramentas estejam corretos, mas ignorar erros
  const { isLoading: toolsDataLoading } = useToolsData();
  
  // Fetch solution data with the updated hook that includes progress
  const { solution, loading, error, progress, refetch } = useSolutionData(id);
  
  // Solution interaction handlers
  const { 
    initializing, 
    startImplementation, 
    continueImplementation, 
    toggleFavorite, 
    downloadMaterials 
  } = useSolutionInteractions(id, progress);
  
  // Verificar se há erro de rede
  useEffect(() => {
    if (error) {
      if (error.message && error.message.includes("fetch") || error.message?.includes("network")) {
        setNetworkError(true);
        toast.error("Erro de conexão com o servidor");
      }
    } else {
      setNetworkError(false);
    }
  }, [error]);
  
  // Função para tentar novamente
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
    toast.info("Tentando carregar novamente...");
    refetch();
  };
  
  // Log page visit
  useEffect(() => {
    if (solution) {
      log("Solução carregada com sucesso", { 
        solution_id: solution.id, 
        solution_title: solution.title
      });
    } else if (!loading && error) {
      logError("Erro ao carregar solução", { id, error });
      uiToast({
        title: "Erro ao carregar solução",
        description: "Não foi possível carregar os detalhes da solução solicitada.",
        variant: "destructive"
      });
    }
  }, [solution, loading, error, log, logError, uiToast, id]);
  
  if (loading) {
    return <LoadingScreen message="Carregando detalhes da solução..." />;
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
          >
            <RefreshCw className="h-4 w-4" /> Tentar novamente
          </Button>
        </Alert>
      </div>
    );
  }
  
  if (!solution) {
    logError("Solução não encontrada", { id, path: location.pathname });
    return <SolutionNotFound />;
  }
  
  // Log para depuração
  log("Renderizando SolutionDetails com solução", { 
    solutionId: solution.id, 
    solutionTitle: solution.title,
    hasProgress: !!progress
  });
  
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
