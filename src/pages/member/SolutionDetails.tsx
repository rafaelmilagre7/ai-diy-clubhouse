
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionInteractions } from "@/hooks/useSolutionInteractions";
import { useLogging } from "@/hooks/useLogging";
import { useAuth } from "@/contexts/auth";
import { NetworkError } from "@/components/solution/errors/NetworkError";
import { GeneralError } from "@/components/solution/errors/GeneralError";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { SolutionBackButton } from "@/components/solution/SolutionBackButton";
import { SolutionHeaderSection } from "@/components/solution/SolutionHeaderSection";
import SolutionTabsContent from "@/components/solution/tabs/SolutionTabsContent";
import { SolutionSidebar } from "@/components/solution/SolutionSidebar";
import { SolutionMobileActions } from "@/components/solution/SolutionMobileActions";
import { SolutionSkeleton } from "@/components/solution/SolutionSkeleton";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useCacheManagement } from "@/hooks/useCacheManagement";
import { adaptSolutionType, adaptProgressType } from "@/utils/typeAdapters";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { log } = useLogging("SolutionDetails");
  const initialRenderRef = useRef(true);
  const { user, isAdmin } = useAuth();
  const { invalidateSolution } = useCacheManagement();
  
  // Hook aprimorada para buscar os dados da solução com diagnóstico adicional
  const { 
    solution: supaSolution, 
    loading, 
    isLoading,
    isFetching,
    error, 
    progress: supaProgress, 
    refetch, 
    networkError, 
    notFoundError,
    availableSolutions, 
    connectionStatus,
    checkConnection,
    implementationMetrics
  } = useSolutionData(id || "");
  
  // Adaptar tipos para compatibilidade
  const solution = supaSolution ? adaptSolutionType(supaSolution) : null;
  const progress = supaProgress ? adaptProgressType(supaProgress) : null;
  
  // Solution interaction handlers
  const { 
    initializing, 
    startImplementation, 
    continueImplementation
  } = useSolutionInteractions(id, progress);

  // Invalidar cache em caso de erro
  useEffect(() => {
    if (error && id) {
      invalidateSolution(id);
    }
  }, [error, id, invalidateSolution]);

  // Verificar a autenticação do usuário
  useEffect(() => {
    if (!isLoading && !loading && !user) {
      toast.error("Você precisa estar logado para acessar esta página");
      navigate("/login", { state: { returnTo: `/solution/${id}` } });
    }
  }, [user, loading, isLoading, id, navigate]);
  
  // Registrar visualização da solução
  useEffect(() => {
    if (user && solution && !loading && !isLoading && initialRenderRef.current) {
      // Registrar visualização para métricas
      const trackView = async () => {
        try {
          await supabase.rpc('increment', {
            row_id: solution.id,
            table_name: 'solution_metrics',
            column_name: 'total_views'
          });
          
          log("Visualização registrada", { solutionId: solution.id });
        } catch (error) {
          // Não exibir erro para usuário - apenas log
          log("Erro ao registrar visualização", { error });
        }
      };
      
      trackView();
    }
  }, [user, solution, loading, isLoading, log]);
  
  // Log detalhado na primeira renderização para diagnóstico
  useEffect(() => {
    if (initialRenderRef.current) {
      log("SolutionDetails montado", { 
        requestedId: id,
        currentRoute: window.location.href,
        availableSolutionsCount: availableSolutions?.length || 0,
        isAdmin,
        connectionStatus,
        isOnline: navigator.onLine
      });
      
      // Verificar a conexão com o servidor no carregamento inicial
      checkConnection();
      initialRenderRef.current = false;
    }
  }, [id, log, availableSolutions, isAdmin, connectionStatus, checkConnection]);

  // Verificar ID inválido ou ausente
  if (!id) {
    log("ID da solução não fornecido, redirecionando para lista de soluções");
    navigate("/solutions", { replace: true });
    return null;
  }
  
  // Mostrar esqueleto de loading primeiro durante carregamento inicial
  if ((loading || isLoading) && initialRenderRef.current) {
    return <SolutionSkeleton />;
  }
  
  // Se o carregamento continuar por mais tempo, mostrar tela de loading completa
  if (loading || isLoading) {
    return <LoadingScreen message="Carregando detalhes da solução..." />;
  }
  
  // Tratar erro de rede separadamente
  if (networkError) {
    return <NetworkError id={id} onRetry={refetch} loading={isFetching} />;
  }
  
  // Tratar erro geral
  if (error && !notFoundError && !networkError) {
    return <GeneralError error={error} id={id} onRetry={refetch} availableSolutions={availableSolutions} />;
  }
  
  // Tratar o caso específico de "não encontrado"
  if (notFoundError || !solution) {
    return <SolutionNotFound />;
  }

  // Verificar se o usuário tem acesso à solução (não publicada)
  if (!isAdmin && !solution.published) {
    log("Usuário tentando acessar solução não publicada", { solutionId: id });
    return (
      <GeneralError 
        error={new Error("Esta solução não está disponível ou publicada.")} 
        id={id} 
        onRetry={refetch} 
        availableSolutions={availableSolutions?.filter(s => s.published)} 
      />
    );
  }

  const completionPercentage = progress?.completion_percentage || 0;
  
  // Se chegou aqui, temos dados válidos para renderizar
  return (
    <div className="max-w-5xl mx-auto pb-12 animate-fade-in">
      <SolutionBackButton />
      
      <SolutionHeaderSection 
        solution={solution} 
        implementationMetrics={implementationMetrics} 
      />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <SolutionTabsContent 
            solution={solution} 
            progress={progress}
          />
          
          <SolutionMobileActions 
            solutionId={solution?.id}
            progress={progress}
            startImplementation={() => startImplementation()}
            continueImplementation={() => continueImplementation()}
            initializing={initializing}
            completionPercentage={progress?.completion_percentage || 0}
          />
        </div>
        
        <div className="md:col-span-1">
          <SolutionSidebar 
            solution={solution}
            progress={progress}
            startImplementation={() => startImplementation()}
            continueImplementation={() => continueImplementation()}
            initializing={initializing}
            implementationMetrics={implementationMetrics}
          />
        </div>
      </div>
    </div>
  );
};

export default SolutionDetails;
