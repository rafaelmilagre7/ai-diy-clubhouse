
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
import { ModuleContentText } from "@/components/implementation/content/ModuleContentText";

const SolutionImplementation = () => {
  const {
    solution,
    modules,
    currentModule,
    loading,
    moduleIdx,
    completedModules,
  } = useModuleImplementation();
  
  const { log, logError } = useLogging();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Log module data when it changes
  useEffect(() => {
    if (currentModule && solution) {
      log("Module loaded", { 
        solution_id: solution.id,
        solution_title: solution.title,
        module_id: currentModule.id,
        module_title: currentModule.title,
        module_type: currentModule.type,
        module_index: moduleIdx,
        has_content: !!currentModule.content,
        content_keys: currentModule.content ? Object.keys(currentModule.content) : []
      });
    }
  }, [currentModule, solution, moduleIdx, log]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!solution || !currentModule) {
    const error = "Solution or module not found";
    logError("Implementation not found", { error, solution_id: solution?.id });
    return <ImplementationNotFound />;
  }
  
  return (
    <div className="pb-20 min-h-screen bg-slate-50">
      {/* Header section */}
      <ImplementationHeader
        solution={solution}
        moduleIdx={moduleIdx}
        modulesLength={modules.length}
        completedModules={completedModules}
        isCompleting={false}
      />
      
      {/* Module content */}
      <div className="container mt-6 bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6">{currentModule.title}</h1>
        
        {currentModule.content && (
          <div className="mb-8">
            <ModuleContentText content={currentModule.content} />
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-8">
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="tools">Ferramentas</TabsTrigger>
            <TabsTrigger value="materials">Materiais</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
};

export default SolutionImplementation;
