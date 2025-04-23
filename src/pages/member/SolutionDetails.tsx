
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
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
  
  // Hook aprimorada para buscar os dados da solução com diagnóstico adicional
  const { 
    solution, 
    loading, 
    error, 
    progress, 
    refetch, 
    networkError, 
    notFoundError,
    availableSolutions 
  } = useSolutionData(id);
  
  // Solution interaction handlers
  const { 
    initializing, 
    startImplementation, 
    continueImplementation, 
    toggleFavorite, 
    downloadMaterials 
  } = useSolutionInteractions(id, progress);
  
  // Log detalhado na primeira renderização para diagnóstico
  useEffect(() => {
    if (initialRenderRef.current) {
      log("SolutionDetails montado com diagnóstico completo", { 
        requestedId: id,
        currentRoute: window.location.href,
        availableSolutionsCount: availableSolutions?.length || 0
      });
      
      initialRenderRef.current = false;
    }
  }, [id, log, availableSolutions]);

  // Função para tentar novamente com backoff exponencial
  const handleRetry = () => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    toast.info("Tentando carregar novamente...");
    refetch();
  };
  
  // Função para navegar para a lista de soluções
  const handleBackToList = () => {
    navigate("/solutions");
  };
  
  // Função para tentar usar a primeira solução disponível
  const handleUseFirstAvailable = () => {
    if (availableSolutions && availableSolutions.length > 0) {
      const firstSolution = availableSolutions[0];
      log("Navegando para primeira solução disponível", {
        id: firstSolution.id,
        title: firstSolution.title
      });
      navigate(`/solutions/${firstSolution.id}`);
    } else {
      toast.error("Não há soluções disponíveis no momento");
    }
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
  
  // CORREÇÃO: Tratar erro de rede separadamente
  if (networkError) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <SolutionBackButton />
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro de conexão</AlertTitle>
          <AlertDescription>
            <p>Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.</p>
            
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <p>Diagnóstico técnico: Erro de conexão ao tentar buscar solução com ID {id}</p>
              <p>Soluções disponíveis no banco: {availableSolutions?.length || 0}</p>
            </div>
          </AlertDescription>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              onClick={handleRetry} 
              className="flex items-center gap-2"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" /> 
              Tentar novamente
            </Button>
            <Button
              onClick={handleBackToList}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para soluções
            </Button>
            {availableSolutions?.length > 0 && (
              <Button
                onClick={handleUseFirstAvailable}
                variant="default"
              >
                Ver primeira solução disponível
              </Button>
            )}
          </div>
        </Alert>
      </div>
    );
  }
  
  // Tratar o caso específico de "não encontrado" com solução alternativa
  if (notFoundError || !solution) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <SolutionBackButton />
        <Alert variant="destructive" className="my-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Solução não encontrada</AlertTitle>
          <AlertDescription>
            <p>A solução com ID <code className="bg-gray-100 px-1 py-0.5 rounded">{id}</code> não foi encontrada na base de dados.</p>
            
            <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
              <p className="font-medium">Possíveis causas:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>A solução foi removida do banco de dados</li>
                <li>Há uma inconsistência entre os IDs no frontend e no banco</li>
                <li>O banco de dados está sem registros de soluções</li>
              </ul>
            </div>
            
            {availableSolutions?.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p className="text-blue-800 font-medium">Há {availableSolutions.length} soluções disponíveis no banco de dados</p>
                <p className="text-blue-700 text-sm mt-1">Você pode visualizar a lista de soluções ou selecionar a primeira disponível.</p>
              </div>
            )}
          </AlertDescription>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              onClick={handleBackToList}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Ver lista de soluções
            </Button>
            {availableSolutions?.length > 0 && (
              <Button
                onClick={handleUseFirstAvailable}
                variant="default"
              >
                Ver primeira solução disponível
              </Button>
            )}
          </div>
        </Alert>
      </div>
    );
  }
  
  // CORREÇÃO: Tratamento específico para erros gerais
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
            
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
              <p>Detalhes técnicos: {error.name} - {error.message}</p>
              <p>Soluções disponíveis: {availableSolutions?.length || 0}</p>
            </div>
          </AlertDescription>
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              onClick={handleRetry} 
              className="flex items-center gap-2"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" /> 
              Tentar novamente
            </Button>
            <Button
              onClick={handleBackToList}
              className="flex items-center gap-2"
              variant="secondary"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para soluções
            </Button>
            {availableSolutions?.length > 0 && (
              <Button
                onClick={handleUseFirstAvailable}
                variant="default"
              >
                Ver primeira solução disponível
              </Button>
            )}
          </div>
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
