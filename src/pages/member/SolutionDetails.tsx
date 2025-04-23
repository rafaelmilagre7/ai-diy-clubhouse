
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionInteractions } from "@/hooks/useSolutionInteractions";
import { useLogging } from "@/hooks/useLogging";
import { NetworkError } from "@/components/solution/errors/NetworkError";
import { GeneralError } from "@/components/solution/errors/GeneralError";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { SolutionBackButton } from "@/components/solution/SolutionBackButton";
import { SolutionHeaderSection } from "@/components/solution/SolutionHeaderSection";
import { SolutionTabsContent } from "@/components/solution/tabs/SolutionTabsContent";
import { SolutionSidebar } from "@/components/solution/SolutionSidebar";
import { SolutionMobileActions } from "@/components/solution/SolutionMobileActions";
import { SolutionSkeleton } from "@/components/solution/SolutionSkeleton";
import LoadingScreen from "@/components/common/LoadingScreen";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { log } = useLogging("SolutionDetails");
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
    continueImplementation
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

  // Verificar ID inválido ou ausente
  if (!id) {
    log("ID da solução não fornecido, redirecionando para lista de soluções");
    navigate("/solutions", { replace: true });
    return null;
  }
  
  // Mostrar esqueleto de loading primeiro durante carregamento inicial
  if (loading && initialRenderRef.current) {
    return <SolutionSkeleton />;
  }
  
  // Se o carregamento continuar por mais tempo, mostrar tela de loading completa
  if (loading) {
    return <LoadingScreen message="Carregando detalhes da solução..." />;
  }
  
  // Tratar erro de rede separadamente
  if (networkError) {
    return <NetworkError id={id} onRetry={refetch} loading={loading} />;
  }
  
  // Tratar erro geral
  if (error && !notFoundError && !networkError) {
    return <GeneralError error={error} id={id} onRetry={refetch} availableSolutions={availableSolutions} />;
  }
  
  // Tratar o caso específico de "não encontrado"
  if (notFoundError || !solution) {
    return <SolutionNotFound />;
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
