
import React from "react";
import { useImplementationData } from "@/hooks/useImplementationData";
import { useImplementationProgress } from "@/hooks/useImplementationProgress";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { ImplementationNotFound } from "@/components/implementation/ImplementationNotFound";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { StepProgressBar } from "@/components/implementation/StepProgressBar";
import { useLogging } from "@/hooks/useLogging";

const Implementation = () => {
  const { solution, modules, progress, completedModules, setCompletedModules, loading } = useImplementationData();
  const { log } = useLogging();
  
  const {
    currentModuleIndex,
    handleModuleComplete,
    handleNavigateToModule
  } = useImplementationProgress({
    modules,
    progress,
    completedModules,
    setCompletedModules
  });

  if (loading) {
    return <LoadingScreen message="Carregando implementação..." />;
  }

  if (!solution) {
    return <ImplementationNotFound />;
  }

  // Determinar o módulo atual
  const currentModule = modules.length > 0 ? modules[currentModuleIndex] : null;
  
  // Se não há módulos, o sistema de fallback será usado no ModuleContent
  log("Renderizando Implementation", { 
    solutionId: solution.id,
    modulesCount: modules.length,
    currentModuleIndex,
    currentModule: currentModule?.id || 'fallback'
  });

  // Criar lista de steps baseada nos módulos ou usar fallback
  const steps = modules.length > 0 
    ? modules.map(module => module.title)
    : ["Visualizar Solução"];

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <ImplementationHeader 
        solution={solution}
        currentModule={currentModule}
        progress={progress}
      />
      
      <StepProgressBar
        steps={steps}
        currentStep={currentModuleIndex}
        completedSteps={completedModules}
        className="mb-8"
      />
      
      <ModuleContent
        module={currentModule}
        solution={solution}
        onComplete={handleModuleComplete}
        onError={(error) => {
          console.error("Module content error:", error);
        }}
      />
    </div>
  );
};

export default Implementation;
