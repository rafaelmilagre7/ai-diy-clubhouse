
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
import { GlassCard } from "@/components/ui/GlassCard";
import { ImplementationTabsNavigation } from "@/components/implementation/ImplementationTabsNavigation";
import { PageTransition } from "@/components/transitions/PageTransition";
import { FadeTransition } from "@/components/transitions/FadeTransition";
import { StepProgressBar } from "@/components/implementation/StepProgressBar";
import { SuccessCard } from "@/components/celebration/SuccessCard";

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
  const [showSuccess, setShowSuccess] = useState(false);
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
      setShowSuccess(true);
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

  // Preparar os passos para a barra de progresso
  const moduleSteps = modules ? modules.map(module => module.title || "Etapa") : [];
  
  return (
    <PageTransition className="min-h-screen bg-[#0F111A] pb-16">
      <div className="container max-w-4xl py-4 md:py-6 animate-fade-in">
        {/* Cartão de sucesso (aparece quando o usuário completa a implementação) */}
        {showSuccess && (
          <div className="mb-6">
            <SuccessCard
              title="Implementação Concluída!"
              message={`Parabéns! Você finalizou com sucesso a implementação da solução "${solution.title}".`}
              type="implementation"
              onAnimationComplete={() => {
                setTimeout(() => setShowSuccess(false), 5000);
              }}
            />
          </div>
        )}
        
        <GlassCard className="p-0 md:p-0 transition-all duration-300 shadow-xl border border-white/10 overflow-hidden">
          <ImplementationHeader solution={solution} />
          
          {/* Barra de progresso da implementação */}
          {moduleSteps.length > 0 && (
            <div className="px-4 md:px-6 pt-4">
              <FadeTransition>
                <StepProgressBar
                  steps={moduleSteps}
                  currentStep={modules.findIndex(m => m.id === currentModule?.id)}
                  completedSteps={completedModules}
                  className="mb-4"
                />
              </FadeTransition>
            </div>
          )}
          
          <div className="mt-0 px-4 md:px-6 pb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <ImplementationTabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
              
              <div className="bg-[#151823] rounded-xl p-4 md:p-6 border border-white/10 min-h-[30vh]">
                <TabsContent value="tools" className="mt-0 tab-fade-in">
                  <FadeTransition>
                    <ModuleContentTools module={currentModule} />
                  </FadeTransition>
                </TabsContent>
                
                <TabsContent value="materials" className="mt-0 tab-fade-in">
                  <FadeTransition>
                    <ModuleContentMaterials module={currentModule} />
                  </FadeTransition>
                </TabsContent>
                
                <TabsContent value="videos" className="mt-0 tab-fade-in">
                  <FadeTransition>
                    <ModuleContentVideos module={currentModule} />
                  </FadeTransition>
                </TabsContent>
                
                <TabsContent value="checklist" className="mt-0 tab-fade-in">
                  <FadeTransition>
                    <ModuleContentChecklist module={currentModule} />
                  </FadeTransition>
                </TabsContent>
                
                <TabsContent value="comments" className="mt-0 tab-fade-in">
                  {solution && currentModule && (
                    <FadeTransition>
                      <CommentsSection 
                        solutionId={solution.id} 
                        moduleId={currentModule.id} 
                      />
                    </FadeTransition>
                  )}
                </TabsContent>
                
                <TabsContent value="complete" className="mt-0 tab-fade-in">
                  <FadeTransition>
                    <ImplementationComplete 
                      solution={solution} 
                      onComplete={onComplete} 
                      isCompleting={isCompleting}
                      isCompleted={isCompleted}
                    />
                  </FadeTransition>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </GlassCard>
      </div>
    </PageTransition>
  );
};

export default SolutionImplementation;
