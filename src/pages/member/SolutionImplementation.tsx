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
    <div className="min-h-screen bg-gradient-to-br from-[#f8fdff] via-[#f0fafe] to-[#edf6fb] pb-16">
      <div className="container max-w-4xl py-4 md:py-6 animate-fade-in">
        <GlassCard className="p-0 md:p-0 transition-all duration-300 shadow-xl border border-[#0ABAB5]/10 overflow-hidden">
          <ImplementationHeader solution={solution} />
          
          <div className="mt-0 px-4 md:px-6 pb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <ImplementationTabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
              
              <div className="bg-white/50 rounded-xl p-4 md:p-6 border border-[#0ABAB5]/5 min-h-[30vh]">
                <TabsContent value="tools" className="mt-0">
                  <ModuleContentTools module={currentModule} />
                </TabsContent>
                
                <TabsContent value="materials" className="mt-0">
                  <ModuleContentMaterials module={currentModule} />
                </TabsContent>
                
                <TabsContent value="videos" className="mt-0">
                  <ModuleContentVideos module={currentModule} />
                </TabsContent>
                
                <TabsContent value="checklist" className="mt-0">
                  <ModuleContentChecklist module={currentModule} />
                </TabsContent>
                
                <TabsContent value="comments" className="mt-0">
                  {solution && currentModule && (
                    <CommentsSection 
                      solutionId={solution.id} 
                      moduleId={currentModule.id} 
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="complete" className="mt-0">
                  <ImplementationComplete 
                    solution={solution} 
                    onComplete={onComplete} 
                    isCompleting={isCompleting}
                    isCompleted={isCompleted}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default SolutionImplementation;
