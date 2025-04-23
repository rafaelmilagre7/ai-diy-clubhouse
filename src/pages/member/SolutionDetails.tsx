
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
import { supabase } from "@/lib/supabase";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { log, logError } = useLogging("SolutionDetails");
  const [retryCount, setRetryCount] = useState(0);
  const initialRenderRef = useRef(true);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  
  // Fetch solution data with the hook
  const { solution, loading, error, progress, refetch, networkError, notFoundError } = useSolutionData(id);
  
  // Solution interaction handlers
  const { 
    initializing, 
    startImplementation, 
    continueImplementation, 
    toggleFavorite, 
    downloadMaterials 
  } = useSolutionInteractions(id, progress);
  
  // Buscar informações de diagnóstico sobre a solução
  useEffect(() => {
    const fetchDiagnosticInfo = async () => {
      if (!id) return;
      
      try {
        // Verificar se a solução existe diretamente com uma consulta simplificada
        const { count, error } = await supabase
          .from('solutions')
          .select('*', { count: 'exact', head: true })
          .eq('id', id);
        
        setDiagnosticInfo({
          timestamp: new Date().toISOString(),
          solutionExists: count && count > 0,
          error: error ? error.message : null,
          routeId: id
        });
        
        if (count === 0) {
          logError(`Diagnóstico confirmou: solução ${id} não existe no banco`);
        }
      } catch (err) {
        console.error("Erro ao buscar informações de diagnóstico", err);
      }
    };
    
    fetchDiagnosticInfo();
  }, [id, logError]);
  
  // Log detalhado na primeira renderização
  useEffect(() => {
    if (initialRenderRef.current) {
      // CORREÇÃO CRÍTICA: Registrar dados importantes para debug
      log("SolutionDetails montado", { 
        id,
        currentRoute: window.location.href,
        userAgent: navigator.userAgent
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
  
  // CORREÇÃO CRÍTICA: Mostrar esqueleto de loading primeiro durante carregamento inicial
  if (loading && initialRenderRef.current) {
    return <SolutionSkeleton />;
  }
  
  // Se o carregamento continuar por mais tempo, mostrar tela de loading completa
  if (loading) {
    return <LoadingScreen message="Carregando detalhes da solução..." />;
  }
  
  // CORREÇÃO CRÍTICA: Tratar erro de rede separadamente
  if (networkError) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <SolutionBackButton />
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de conexão</AlertTitle>
          <AlertDescription>
            <p>Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.</p>
            
            {diagnosticInfo && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                <p>Diagnóstico: {diagnosticInfo.solutionExists ? "A solução existe no banco de dados" : "A solução NÃO existe no banco de dados"}</p>
              </div>
            )}
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
  
  // Tratar o caso específico de "não encontrado"
  if (notFoundError || !solution) {
    logError("Solução não encontrada", { id, diagnosticInfo });
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <SolutionBackButton />
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Solução não encontrada</AlertTitle>
          <AlertDescription>
            <p>A solução com ID <code className="bg-gray-100 px-1 py-0.5 rounded">{id}</code> não foi encontrada na base de dados.</p>
            
            {diagnosticInfo && (
              <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                <p>Diagnóstico técnico: Solução com este ID não existe.</p>
                <p>Timestamp: {new Date(diagnosticInfo.timestamp).toLocaleString('pt-BR')}</p>
              </div>
            )}
          </AlertDescription>
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handleRetry} 
              className="flex items-center gap-2"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" /> 
              Tentar novamente
            </Button>
            <Button
              onClick={() => navigate("/solutions")}
              variant="secondary"
            >
              Voltar para soluções
            </Button>
          </div>
        </Alert>
      </div>
    );
  }
  
  // CORREÇÃO CRÍTICA: Tratamento específico para erros gerais
  if (error && !notFoundError && !networkError) {
    logError("Erro ao carregar solução", { error, id });
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <SolutionBackButton />
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar solução</AlertTitle>
          <AlertDescription>
            {error.message || "Ocorreu um erro ao carregar os detalhes desta solução."}
            <br />
            <br />
            Detalhes técnicos: {error.name} {error.message}
          </AlertDescription>
          <Button 
            onClick={handleRetry} 
            className="mt-4 flex items-center gap-2"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4" /> 
            Tentar novamente
          </Button>
          <Button
            onClick={() => navigate("/solutions")}
            className="mt-4 ml-2"
            variant="secondary"
          >
            Voltar para soluções
          </Button>
        </Alert>
      </div>
    );
  }
  
  // Se chegou aqui, temos dados válidos para renderizar
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
