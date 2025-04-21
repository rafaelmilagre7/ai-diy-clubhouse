
import React, { useEffect, useState } from "react";
import { useModuleImplementation } from "@/hooks/useModuleImplementation";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { ImplementationNotFound } from "@/components/implementation/ImplementationNotFound";
import { useLogging } from "@/hooks/useLogging";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ModuleContentMaterials } from "@/components/implementation/content/ModuleContentMaterials";
import { ModuleContentVideos } from "@/components/implementation/content/ModuleContentVideos";
import { ModuleContentTools } from "@/components/implementation/content/ModuleContentTools";
import { ModuleContentChecklist } from "@/components/implementation/content/ModuleContentChecklist";
import { ImplementationComplete } from "@/components/implementation/content/ImplementationComplete";
import { CommentsSection } from "@/components/implementation/content/tool-comments/CommentsSection";
import { useSolutionCompletion } from "@/hooks/implementation/useSolutionCompletion";
import { useRealtimeComments } from "@/hooks/implementation/useRealtimeComments";
import { WizardStepProgress } from "@/components/implementation/WizardStepProgress";
import { GlassCard } from "@/components/ui/GlassCard";
import { ImplementationTabsNavigation } from "@/components/implementation/ImplementationTabsNavigation";

const SolutionImplementation = () => {
  const {
    solution,
    modules,
    currentModule,
    loading,
    completedModules,
    progress
  } = useModuleImplementation();
  
  const [activeTab, setActiveTab] = useState("tools");
  const { log, logError } = useLogging();
  
  const {
    isCompleting,
    isCompleted,
    handleConfirmImplementation
  } = useSolutionCompletion({
    progressId: progress?.id,
    solutionId: solution?.id,
    moduleIdx: 0,
    completedModules: completedModules,
    setCompletedModules: () => {}
  });
  
  const solutionId = solution?.id || "";
  const moduleId = currentModule?.id || "";
  
  const enableRealtimeComments = !!solution && 
                                !!currentModule && 
                                activeTab === "comments";
  
  useRealtimeComments(solutionId, moduleId, enableRealtimeComments);
  
  useEffect(() => {
    if (activeTab === "comments" && solution && currentModule) {
      log("Aba de comentários ativada", { 
        solutionId: solution.id, 
        moduleId: currentModule.id
      });
    }
  }, [activeTab, solution, currentModule, log]);
  
  const onComplete = async () => {
    const success = await handleConfirmImplementation();
    if (success) {
      log("Implementation completed successfully", { solution_id: solution?.id });
    }
  };
  
  useEffect(() => {
    if (currentModule && solution) {
      log("Module loaded", { 
        solution_id: solution.id,
        solution_title: solution.title,
        module_id: currentModule.id,
        module_title: currentModule.title,
        module_type: currentModule.type,
        has_content: !!currentModule.content,
        content_keys: currentModule.content ? Object.keys(currentModule.content) : []
      });
    }
  }, [currentModule, solution, log]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!solution) {
    const errorMsg = "Solution not found";
    logError("Implementation not found", { error: errorMsg, solution_id: solution?.id });
    return <ImplementationNotFound />;
  }
  
  const currentStep = modules.findIndex(m => m.id === currentModule?.id) || 0;
  
  return (
    <div className="pb-20 min-h-screen bg-gradient-to-br from-[#f6fdff] via-[#ecfafe] to-[#e7f4fb]">
      <div className="container max-w-3xl animate-fade-in">
        <WizardStepProgress
          currentStep={currentStep}
          totalSteps={modules.length}
          stepTitles={[
            "", "Visão Geral", "Preparação", "Implementação",
            "Verificação", "Resultados", "Otimização", "Celebração"
          ]}
        />
        <GlassCard className="p-0 md:p-0 transition-all duration-300 shadow-2xl ring-2 ring-[#0ABAB5]/10">
          <ImplementationHeader solution={solution} />
          
          <div className="mt-0 px-0 md:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <ImplementationTabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
              
              <TabsContent value="tools">
                <ModuleContentTools module={currentModule} />
              </TabsContent>
              
              <TabsContent value="materials">
                <ModuleContentMaterials module={currentModule} />
              </TabsContent>
              
              <TabsContent value="videos">
                <ModuleContentVideos module={currentModule} />
              </TabsContent>
              
              <TabsContent value="checklist">
                <ModuleContentChecklist module={currentModule} />
              </TabsContent>
              
              <TabsContent value="comments">
                {solution && currentModule && (
                  <CommentsSection 
                    solutionId={solution.id} 
                    moduleId={currentModule.id} 
                  />
                )}
              </TabsContent>
              
              <TabsContent value="complete">
                <ImplementationComplete 
                  solution={solution} 
                  onComplete={onComplete} 
                  isCompleting={isCompleting}
                  isCompleted={isCompleted}
                />
              </TabsContent>
            </Tabs>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default SolutionImplementation;

