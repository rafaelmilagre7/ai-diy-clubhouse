
import React from "react";
import { useModuleImplementation } from "@/hooks/useModuleImplementation";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { ImplementationFooter } from "@/components/implementation/ImplementationFooter";
import { NotFoundContent } from "@/components/implementation/NotFoundContent";

const SolutionImplementation = () => {
  const {
    solution,
    modules,
    currentModule,
    loading,
    moduleIdx,
    handleComplete,
    handlePrevious,
    calculateProgress
  } = useModuleImplementation();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!solution || !currentModule) {
    return <NotFoundContent />;
  }
  
  return (
    <div className="pb-12">
      {/* Header section */}
      <ImplementationHeader
        solution={solution}
        moduleIdx={moduleIdx}
        modulesLength={modules.length}
        calculateProgress={calculateProgress}
      />
      
      {/* Module content */}
      <div className="container mt-6">
        <ModuleContent 
          module={currentModule} 
          onComplete={handleComplete} 
        />
      </div>
      
      {/* Navigation footer */}
      <ImplementationFooter
        moduleIdx={moduleIdx}
        modulesLength={modules.length}
        handlePrevious={handlePrevious}
        handleComplete={handleComplete}
      />
    </div>
  );
};

export default SolutionImplementation;
