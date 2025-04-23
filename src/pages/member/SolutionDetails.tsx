
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
import { useEffect } from "react";
import { useToolsData } from "@/hooks/useToolsData";
import { useLogging } from "@/hooks/useLogging";
import { useToast } from "@/hooks/use-toast";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { log, logError } = useLogging("SolutionDetails");
  const { toast } = useToast();
  
  // Log inicial detalhado para debug
  useEffect(() => {
    log("SolutionDetails montado", { 
      id,
      path: location.pathname,
      search: location.search,
      currentRoute: window.location.href
    });
  }, [id, location, log]);
  
  // Garantir que os dados das ferramentas estejam corretos, mas ignorar erros
  const { isLoading: toolsDataLoading } = useToolsData();
  
  // Fetch solution data with the updated hook that includes progress
  const { solution, loading, error, progress } = useSolutionData(id);
  
  // Solution interaction handlers
  const { 
    initializing, 
    startImplementation, 
    continueImplementation, 
    toggleFavorite, 
    downloadMaterials 
  } = useSolutionInteractions(id, progress);
  
  // Log page visit
  useEffect(() => {
    if (solution) {
      log("Solução carregada com sucesso", { 
        solution_id: solution.id, 
        solution_title: solution.title
      });
    } else if (!loading && error) {
      logError("Erro ao carregar solução", { id, error });
      toast({
        title: "Erro ao carregar solução",
        description: "Não foi possível carregar os detalhes da solução solicitada.",
        variant: "destructive"
      });
    }
  }, [solution, loading, error, log, logError, toast, id]);
  
  if (loading) {
    return <LoadingScreen message="Carregando detalhes da solução..." />;
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
