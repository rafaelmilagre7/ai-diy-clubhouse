import React, { useEffect } from "react";
import { useModuleImplementation } from "@/hooks/useModuleImplementation";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { ImplementationFooter } from "@/components/implementation/ImplementationFooter";
import { ImplementationNotFound } from "@/components/implementation/ImplementationNotFound";
import { useImplementationShortcuts } from "@/hooks/useImplementationShortcuts";
import { ImplementationConfirmationModal } from "@/components/implementation/ImplementationConfirmationModal";

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
  
  // Setup keyboard shortcuts
  useImplementationShortcuts(
    solution,
    moduleIdx,
    modules,
    handleComplete,
    handlePrevious
  );
  
  // Keep track of user's interaction with the module
  useEffect(() => {
    // Reset interaction state when module changes
    setModuleInteraction(false);
  }, [moduleIdx, setModuleInteraction]);
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!solution || !currentModule) {
    return <ImplementationNotFound />;
  }
  
  return (
    <>
      <div className="pb-20 min-h-screen bg-slate-50">
        {/* Header section */}
        <ImplementationHeader
          solution={solution}
          moduleIdx={moduleIdx}
          modulesLength={modules.length}
          completedModules={completedModules}
          isCompleting={isCompleting}
        />
        
        {/* Module content */}
        <div className="container mt-6 bg-white p-6 rounded-lg shadow-sm">
          <ModuleContent 
            module={currentModule} 
            onComplete={() => setModuleInteraction(true)} 
          />
        </div>
        
        {/* Navigation footer */}
        <ImplementationFooter
          moduleIdx={moduleIdx}
          modulesLength={modules.length}
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
