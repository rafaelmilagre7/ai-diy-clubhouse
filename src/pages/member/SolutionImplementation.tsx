
import React, { useEffect } from "react";
import { useModuleImplementation } from "@/hooks/useModuleImplementation";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { ImplementationFooter } from "@/components/implementation/ImplementationFooter";
import { ImplementationNotFound } from "@/components/implementation/ImplementationNotFound";
import { useImplementationShortcuts } from "@/hooks/useImplementationShortcuts";
import { ImplementationConfirmationModal } from "@/components/implementation/ImplementationConfirmationModal";
import { useLogging } from "@/hooks/useLogging";

const SolutionImplementation = () => {
  const {
    solution,
    modules,
    currentModule,
    loading,
    moduleIdx,
    completedModules,
    handleComplete,
    handlePrevious,
    handleMarkAsCompleted,
    handleConfirmImplementation,
    showConfirmationModal,
    setShowConfirmationModal,
    isCompleting,
    hasInteracted,
    setModuleInteraction
  } = useModuleImplementation();
  
  const { log, logError } = useLogging();
  
  // Setup keyboard shortcuts
  useImplementationShortcuts(
    solution,
    moduleIdx,
    modules,
    handleComplete,
    handlePrevious
  );
  
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
  
  // Keep track of user's interaction with the module
  useEffect(() => {
    // Reset interaction state when module changes
    setModuleInteraction(false);
  }, [moduleIdx, setModuleInteraction]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!solution || !currentModule) {
    const error = "Solution or module not found";
    logError("Implementation not found", { error, solution_id: solution?.id });
    return <ImplementationNotFound />;
  }
  
  // Log any content rendering errors
  const handleContentError = (error: any) => {
    logError("Error rendering module content", error);
  };
  
  // Use fixed total of 6 modules
  const totalModules = 6;
  
  return (
    <>
      <div className="pb-20 min-h-screen bg-slate-50">
        {/* Header section */}
        <ImplementationHeader
          solution={solution}
          moduleIdx={moduleIdx}
          modulesLength={totalModules}
          completedModules={completedModules}
          isCompleting={isCompleting}
        />
        
        {/* Module content */}
        <div className="container mt-6 bg-white p-6 rounded-lg shadow-sm">
          <ModuleContent 
            module={currentModule} 
            onComplete={() => setModuleInteraction(true)} 
            onError={handleContentError}
          />
        </div>
        
        {/* Navigation footer */}
        <ImplementationFooter
          moduleIdx={moduleIdx}
          modulesLength={totalModules}
          completedModules={completedModules}
          handlePrevious={handlePrevious}
          handleComplete={handleComplete}
          handleMarkAsCompleted={handleMarkAsCompleted}
          isCompleting={isCompleting}
          hasInteracted={hasInteracted}
        />
      </div>
      
      {/* Confirmation modal for completing the entire solution */}
      {solution && (
        <ImplementationConfirmationModal 
          solution={solution}
          isOpen={showConfirmationModal}
          isSubmitting={isCompleting}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleConfirmImplementation}
        />
      )}
    </>
  );
};

export default SolutionImplementation;
