
import { useParams, useNavigate } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionInteractions } from "@/hooks/useSolutionInteractions";
import { SolutionBackButton } from "@/components/solution/SolutionBackButton";
import { SolutionHeaderSection } from "@/components/solution/SolutionHeaderSection";
import { SolutionTabsContent } from "@/components/solution/tabs/SolutionTabsContent";
import { SolutionSidebar } from "@/components/solution/SolutionSidebar";
import { SolutionMobileActions } from "@/components/solution/SolutionMobileActions";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { useEffect, useRef, useState } from "react";
import { useLogging } from "@/hooks/useLogging";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { log, logError } = useLogging("SolutionDetails");
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const initialRenderRef = useRef(true);
  
  // Fetch solution data with the hook that includes progress
  const { solution, loading, error, progress, refetch } = useSolutionData(id);
  
  // Solution interaction handlers
  const { 
    initializing, 
    startImplementation, 
    continueImplementation, 
    toggleFavorite, 
    downloadMaterials 
  } = useSolutionInteractions(id, progress);
  
  // Verificar se há erro de rede - uma única vez quando o erro muda
  useEffect(() => {
    if (error) {
      log("Erro detectado:", { errorMessage: error.message, id });
      if (error.message && (
        error.message.includes("fetch") || 
        error.message.includes("network") ||
        error.message.includes("Failed to fetch")
      )) {
        setNetworkError(true);
      } else {
        setNetworkError(false);
      }
    } else {
      setNetworkError(false);
    }
  }, [error, log]);

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
  
  // Função para tentar novamente
  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    // Aguardar um tempo proporcional ao número de tentativas
    const delay = Math.min(1000 * Math.pow(1.5, newRetryCount), 5000); // máximo de 5 segundos
    
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
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
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
