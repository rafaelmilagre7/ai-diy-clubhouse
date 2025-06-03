
import React, { useState } from "react";
import { useImplementationData } from "@/hooks/useImplementationData";
import { ImplementationNotFound } from "@/components/implementation/ImplementationNotFound";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { StepProgressBar } from "@/components/implementation/StepProgressBar";
import { useLogging } from "@/hooks/useLogging";
import { ImplementationTabsNavigation } from "@/components/implementation/ImplementationTabsNavigation";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { SolutionToolsTab } from "@/components/solution/tabs/SolutionToolsTab";
import { SolutionMaterialsTab } from "@/components/solution/tabs/SolutionMaterialsTab";
import { SolutionVideosTab } from "@/components/solution/tabs/SolutionVideosTab";
import { useSolutionDataCentralized } from "@/hooks/solution/useSolutionDataCentralized";
import { SolutionDataProvider } from "@/contexts/SolutionDataContext";

const Implementation = () => {
  const { solution, progress, loading } = useImplementationData();
  const { log } = useLogging();
  const [activeTab, setActiveTab] = useState("tools");
  
  // Buscar dados centralizados da solução
  const { data: solutionData, isLoading: dataLoading } = useSolutionDataCentralized(solution?.id);
  
  if (loading || dataLoading) {
    return <LoadingScreen message="Carregando implementação..." />;
  }

  if (!solution) {
    return <ImplementationNotFound />;
  }

  log("Renderizando Implementation", { 
    solutionId: solution.id,
    hasProgress: !!progress
  });

  const steps = ["Ferramentas", "Materiais", "Vídeos", "Checklist", "Concluir"];
  const currentStep = 0;

  return (
    <SolutionDataProvider data={solutionData} isLoading={dataLoading} error={null}>
      <div className="container max-w-4xl mx-auto py-8">
        <ImplementationHeader 
          solution={solution}
          progress={progress}
        />
        
        <StepProgressBar
          steps={steps}
          currentStep={currentStep}
          completedSteps={[]}
          className="mb-8"
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <ImplementationTabsNavigation 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          
          <TabsContent value="tools" className="mt-6">
            <SolutionToolsTab solutionId={solution.id} />
          </TabsContent>
          
          <TabsContent value="materials" className="mt-6">
            <SolutionMaterialsTab solutionId={solution.id} />
          </TabsContent>
          
          <TabsContent value="videos" className="mt-6">
            <SolutionVideosTab solutionId={solution.id} />
          </TabsContent>
          
          <TabsContent value="checklist" className="mt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Checklist de Implementação</h3>
              <p className="text-muted-foreground">
                Em breve você terá aqui um checklist personalizado para implementar esta solução.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="comments" className="mt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Comentários e Dúvidas</h3>
              <p className="text-muted-foreground">
                Em breve você poderá fazer perguntas e ver comentários de outros membros.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="complete" className="mt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">Parabéns!</h3>
              <p className="text-muted-foreground">
                Você está pronto para concluir a implementação desta solução.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SolutionDataProvider>
  );
};

export default Implementation;
