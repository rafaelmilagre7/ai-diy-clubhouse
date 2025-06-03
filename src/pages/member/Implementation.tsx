
import React from "react";
import { useImplementationData } from "@/hooks/useImplementationData";
import { ImplementationNotFound } from "@/components/implementation/ImplementationNotFound";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { useLogging } from "@/hooks/useLogging";
import { useSolutionDataCentralized } from "@/hooks/solution/useSolutionDataCentralized";
import { SolutionDataProvider } from "@/contexts/SolutionDataContext";
import { TabBasedImplementationWizard } from "@/components/implementation/tab-based/TabBasedImplementationWizard";

const Implementation = () => {
  const { solution, progress, loading } = useImplementationData();
  const { log } = useLogging();
  
  // Buscar dados centralizados da solução
  const { data: solutionData, isLoading: dataLoading } = useSolutionDataCentralized(solution?.id);
  
  if (loading || dataLoading) {
    return <LoadingScreen message="Carregando implementação..." />;
  }

  if (!solution) {
    return <ImplementationNotFound />;
  }

  log("Renderizando Implementation com sistema por abas", { 
    solutionId: solution.id,
    hasProgress: !!progress,
    materialsCount: solutionData?.materials.length || 0,
    toolsCount: solutionData?.tools.length || 0,
    videosCount: solutionData?.videos.length || 0
  });

  return (
    <SolutionDataProvider data={solutionData} isLoading={dataLoading} error={null}>
      <div className="container max-w-5xl mx-auto py-8">
        <ImplementationHeader 
          solution={solution}
          progress={progress}
        />
        
        <div className="mt-8">
          <TabBasedImplementationWizard solutionId={solution.id} />
        </div>
      </div>
    </SolutionDataProvider>
  );
};

export default Implementation;
