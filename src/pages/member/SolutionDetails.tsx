
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { SolutionBackButton } from "@/components/solution/SolutionBackButton";
import { SolutionHeaderSection } from "@/components/solution/SolutionHeaderSection";
import { SolutionTabsContent } from "@/components/solution/tabs/SolutionTabsContent";
import { SolutionSidebar } from "@/components/solution/SolutionSidebar";
import { SolutionMobileActions } from "@/components/solution/SolutionMobileActions";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionInteractions } from "@/hooks/useSolutionInteractions";
import { useLogging } from "@/hooks/useLogging";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";
import { SolutionSkeleton } from "@/components/solution/SolutionSkeleton";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { log, logError } = useLogging("SolutionDetails");
  const [retryCount, setRetryCount] = useState(0);
  const initialRenderRef = useRef(true);
  
  // Fetch solution data with the hook
  const { solution, loading, error, progress, refetch, networkError } = useSolutionData(id);
  
  // Solution interaction handlers
  const { 
    initializing, 
    startImplementation, 
    continueImplementation, 
    toggleFavorite, 
    downloadMaterials 
  } = useSolutionInteractions(id, progress);
  
  // Log detalhado na primeira renderização
  useEffect(() => {
    if (initialRenderRef.current) {
      log("SolutionDetails montado", { 
        id,
        currentRoute: window.location.href, 
      });
      initialRenderRef.current = false;
    }
    
    // Limpeza ao desmontar
    return () => {
      log("SolutionDetails desmontado");
    };
  }, [id, log]);
  
  // Função para tentar novamente com backoff exponencial
  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    toast.info("Tentando carregar novamente...");
    refetch();
  };

  // Verificar ID inválido ou ausente
  if (!id) {
    log("ID da solução não fornecido, redirecionando para lista de soluções");
    navigate("/solutions", { replace: true });
    return null;
  }
  
  // Mostrar esqueleto de loading primeiro durante 1.5s (mais amigável que spinner)
  if (loading && initialRenderRef.current) {
    return <SolutionSkeleton />;
  }
  
  // Se o carregamento continuar por mais tempo, mostrar tela de loading completa
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
            <RefreshCw className="h-4 w-4" /> 
            Tentar novamente
          </Button>
        </Alert>
      </div>
    );
  }
  
  if (error) {
    logError("Erro ao carregar solução", { error, id });
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <SolutionBackButton />
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar solução</AlertTitle>
          <AlertDescription>
            {error.message || "Ocorreu um erro ao carregar os detalhes desta solução."}
          </AlertDescription>
          <Button 
            onClick={handleRetry} 
            className="mt-4 flex items-center gap-2"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" /> 
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
