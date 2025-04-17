
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
import { useSolutionCompletion } from "@/hooks/implementation/useSolutionCompletion";
import { useNavigate } from "react-router-dom";

const SolutionImplementation = () => {
  const {
    solution,
    modules,
    currentModule,
    loading,
    completedModules,
  } = useModuleImplementation();
  
  const [activeTab, setActiveTab] = useState("tools");
  const navigate = useNavigate();
  const { log, logError } = useLogging();
  
  const {
    isCompleting,
    handleConfirmImplementation
  } = useSolutionCompletion({
    progressId: solution?.progress?.id,
    solutionId: solution?.id,
    moduleIdx: 0,
    completedModules: completedModules,
    setCompletedModules: () => {} // We're not using this anymore
  });
  
  const onComplete = async () => {
    const success = await handleConfirmImplementation();
    if (success) {
      // Navigate back to solution or dashboard
      navigate(`/solution/${solution?.id}`);
    }
  };
  
  // Log module data when it changes
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
    const error = "Solution not found";
    logError("Implementation not found", { error, solution_id: solution?.id });
    return <ImplementationNotFound />;
  }
  
  return (
    <div className="pb-20 min-h-screen bg-slate-50">
      {/* Header section */}
      <ImplementationHeader solution={solution} />
      
      {/* Module content */}
      <div className="container mt-6 bg-white p-6 rounded-lg shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5 mb-6">
            <TabsTrigger value="tools">Ferramentas</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
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
          
          <TabsContent value="complete">
            <ImplementationComplete 
              solution={solution} 
              onComplete={onComplete} 
              isCompleting={isCompleting} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SolutionImplementation;
