
import React, { useEffect, useState } from "react";
import { useModuleImplementation } from "@/hooks/useModuleImplementation";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { ImplementationNotFound } from "@/components/implementation/ImplementationNotFound";
import { useLogging } from "@/hooks/useLogging";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleContentMaterials } from "@/components/implementation/content/ModuleContentMaterials";
import { ModuleContentVideos } from "@/components/implementation/content/ModuleContentVideos";
import { ModuleContentTools } from "@/components/implementation/content/ModuleContentTools";
import { ModuleContentChecklist } from "@/components/implementation/content/ModuleContentChecklist";
import { ImplementationComplete } from "@/components/implementation/content/ImplementationComplete";
import { CommentsSection } from "@/components/implementation/content/tool-comments/CommentsSection";
import { useSolutionCompletion } from "@/hooks/implementation/useSolutionCompletion";
import { useRealtimeComments } from "@/hooks/implementation/useRealtimeComments";

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
  
  // Importante: Ativar escuta de comentários em tempo real
  const solutionId = solution?.id || "";
  const moduleId = currentModule?.id || "";
  
  // Ativar escuta de comentários em tempo real apenas na aba de comentários
  const enableRealtimeComments = !!solution && 
                                !!currentModule && 
                                activeTab === "comments";
  
  // Usando o hook de comentários em tempo real
  useRealtimeComments(solutionId, moduleId, enableRealtimeComments);
  
  // Log quando a aba é alterada
  useEffect(() => {
    if (activeTab === "comments" && solution && currentModule) {
      log("Aba de comentários ativada", { 
        solutionId: solution.id, 
        moduleId: currentModule.id
      });
    }
  }, [activeTab, solution, currentModule, log]);
  
  // Definindo a função onComplete que estava faltando
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
  
  return (
    <div className="pb-20 min-h-screen bg-slate-50">
      <ImplementationHeader solution={solution} />
      
      <div className="container mt-6 bg-white p-6 rounded-lg shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-6 mb-6">
            <TabsTrigger value="tools">Ferramentas</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="comments">Comentários</TabsTrigger>
            <TabsTrigger value="complete">Concluir</TabsTrigger>
          </TabsList>
          
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
    </div>
  );
};

export default SolutionImplementation;
