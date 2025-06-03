
import { useParams, useLocation } from "react-router-dom";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useSolutionDataCentralized } from "@/hooks/solution/useSolutionDataCentralized";
import { SolutionDataProvider } from "@/contexts/SolutionDataContext";
import { useSolutionInteractions } from "@/hooks/useSolutionInteractions";
import { SolutionBackButton } from "@/components/solution/SolutionBackButton";
import { SolutionHeaderSection } from "@/components/solution/SolutionHeaderSection";
import { SolutionTabsContent } from "@/components/solution/tabs/SolutionTabsContent";
import { SolutionSidebar } from "@/components/solution/SolutionSidebar";
import { SolutionMobileActions } from "@/components/solution/SolutionMobileActions";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { useEffect, useState } from "react";
import { useLogging } from "@/hooks/useLogging";
import { PageTransition } from "@/components/transitions/PageTransition";
import { FadeTransition } from "@/components/transitions/FadeTransition";
import { SuccessCard } from "@/components/celebration/SuccessCard";

const SolutionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { log, logError } = useLogging();
  const [showStartSuccess, setShowStartSuccess] = useState(false);
  
  // Usar o hook centralizado para buscar todos os dados
  const { data, isLoading, error } = useSolutionDataCentralized(id);
  
  // Solution interaction handlers
  const { 
    initializing, 
    startImplementation: originalStartImplementation, 
    continueImplementation, 
    toggleFavorite, 
    downloadMaterials 
  } = useSolutionInteractions(id, data?.progress);

  // Wrapped start implementation to show success animation
  const startImplementation = async () => {
    const result = await originalStartImplementation();
    if (result) {
      setShowStartSuccess(true);
      setTimeout(() => setShowStartSuccess(false), 3000);
    }
    return result;
  };
  
  // Log page visit
  useEffect(() => {
    if (data?.solution) {
      log("Solution details page visited", { 
        solution_id: data.solution.id, 
        solution_title: data.solution.title,
        path: location.pathname
      });
    }
  }, [data?.solution, location.pathname, log]);
  
  if (isLoading) {
    return <LoadingScreen message="Carregando detalhes da solução..." />;
  }
  
  if (error || !data?.solution) {
    logError("Solution not found or error occurred", { id, error });
    return <SolutionNotFound />;
  }
  
  // Log para depuração
  log("Renderizando SolutionDetails com dados centralizados", { 
    solutionId: data.solution.id, 
    solutionTitle: data.solution.title,
    hasProgress: !!data.progress,
    materialsCount: data.materials.length,
    toolsCount: data.tools.length,
    videosCount: data.videos.length
  });
  
  return (
    <SolutionDataProvider data={data} isLoading={isLoading} error={error}>
      <PageTransition>
        <div className="max-w-5xl mx-auto pb-12">
          {showStartSuccess && (
            <div className="fixed top-20 right-4 z-50 w-80">
              <SuccessCard
                title="Implementação Iniciada"
                message="Você começou a implementação dessa solução. Boa jornada!"
                type="step"
                onAnimationComplete={() => setShowStartSuccess(false)}
              />
            </div>
          )}
          
          <SolutionBackButton />
          
          <FadeTransition>
            <SolutionHeaderSection solution={data.solution} />
          </FadeTransition>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <FadeTransition delay={0.2}>
                <SolutionTabsContent solution={data.solution} />
              </FadeTransition>
              
              <FadeTransition delay={0.3}>
                <SolutionMobileActions 
                  solutionId={data.solution.id}
                  progress={data.progress}
                  startImplementation={startImplementation}
                  continueImplementation={continueImplementation}
                  initializing={initializing}
                />
              </FadeTransition>
            </div>
            
            <div className="md:col-span-1">
              <FadeTransition delay={0.4} direction="right">
                <SolutionSidebar 
                  solution={data.solution}
                  progress={data.progress}
                  startImplementation={startImplementation}
                  continueImplementation={continueImplementation}
                  initializing={initializing}
                />
              </FadeTransition>
            </div>
          </div>
        </div>
      </PageTransition>
    </SolutionDataProvider>
  );
};

export default SolutionDetails;
