
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionModules } from "@/hooks/useSolutionModules";
import { useModuleProgress } from "@/hooks/useModuleProgress";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { ModulesList } from "@/components/implementation/ModulesList";
import { ImplementationProgress } from "@/components/implementation/ImplementationProgress";
import { WelcomeMessage } from "@/components/implementation/WelcomeMessage";
import { ImplementationNotFound } from "@/components/implementation/ImplementationNotFound";
import { useImplementationNavigation } from "@/hooks/implementation/useImplementationNavigation";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useLogging } from "@/hooks/useLogging";

const SolutionImplementation = () => {
  const { id, moduleIdx } = useParams<{ id: string; moduleIdx?: string }>();
  const { log, logError } = useLogging();
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Parse module index (default to 0 if not provided)
  const currentModuleIndex = moduleIdx ? parseInt(moduleIdx) : 0;
  
  // Fetch solution data
  const { solution, loading: solutionLoading, error: solutionError } = useSolutionData(id);
  
  // Fetch modules for this solution
  const { modules, loading: modulesLoading, error: modulesError } = useSolutionModules(id);
  
  // Get current module
  const currentModule = modules[currentModuleIndex] || null;
  
  // Module progress management
  const {
    completedModules,
    setCompletedModules,
    progressId,
    loading: progressLoading
  } = useModuleProgress(id, solution?.id);
  
  // Navigation handlers
  const { handleComplete, handlePrevious } = useImplementationNavigation();
  
  // Handle module completion
  const handleModuleComplete = () => {
    if (!currentModule) return;
    
    log("Module completed", { 
      module_id: currentModule.id, 
      module_index: currentModuleIndex 
    });
    
    // Add current module to completed list
    setCompletedModules(prev => [...new Set([...prev, currentModuleIndex])]);
    
    // Check if this is the last module
    const isLastModule = currentModuleIndex === modules.length - 1;
    
    if (isLastModule) {
      log("All modules completed, solution implemented");
      setIsCompleted(true);
    } else {
      // Navigate to next module
      handleComplete();
    }
  };
  
  // Loading states
  if (solutionLoading || modulesLoading || progressLoading) {
    return <LoadingScreen message="Carregando implementação..." />;
  }
  
  // Error states
  if (solutionError || modulesError) {
    logError("Error loading implementation", { solutionError, modulesError });
    return <ImplementationNotFound />;
  }
  
  // Solution not found
  if (!solution) {
    return <ImplementationNotFound />;
  }
  
  // No modules found
  if (!modules || modules.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F111A] text-white">
        <ImplementationHeader solution={solution} />
        <div className="container py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Implementação em Desenvolvimento</h2>
            <p className="text-neutral-400">
              Os módulos de implementação para esta solução estão sendo preparados. 
              Volte em breve para começar sua jornada!
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0F111A] text-white">
      <ImplementationHeader solution={solution} />
      
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with modules list and progress */}
          <div className="lg:col-span-1">
            <ImplementationProgress 
              currentStep={currentModuleIndex + 1}
              totalSteps={modules.length}
              completedModules={completedModules}
            />
            
            <div className="mt-6">
              <ModulesList 
                modules={modules}
                currentModuleIndex={currentModuleIndex}
                completedModules={completedModules}
              />
            </div>
          </div>
          
          {/* Main content area */}
          <div className="lg:col-span-3">
            {currentModuleIndex === 0 && completedModules.length === 0 ? (
              <WelcomeMessage 
                solution={solution}
                onStart={handleModuleComplete}
              />
            ) : (
              <ModuleContent 
                module={currentModule}
                onComplete={handleModuleComplete}
                onError={(error) => logError("Module content error", error)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionImplementation;
