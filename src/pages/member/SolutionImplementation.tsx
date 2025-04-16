
import React from "react";
import { useModuleImplementation } from "@/hooks/useModuleImplementation";
import LoadingScreen from "@/components/common/LoadingScreen";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { ImplementationHeader } from "@/components/implementation/ImplementationHeader";
import { ImplementationFooter } from "@/components/implementation/ImplementationFooter";
import { NotFoundContent } from "@/components/implementation/NotFoundContent";
import { useImplementationShortcuts } from "@/hooks/useImplementationShortcuts";

const SolutionImplementation = () => {
  const {
    solution,
    modules,
    currentModule,
    loading,
    moduleIdx,
    handleComplete,
    handlePrevious,
    calculateProgress,
    isCompleting
  } = useModuleImplementation();
  
  // Setup keyboard shortcuts
  useImplementationShortcuts(
    solution,
    moduleIdx,
    modules,
    handleComplete,
    handlePrevious
  );
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!solution || !currentModule) {
    return <NotFoundContent />;
  }
  
  return (
    <ImplementationContainer 
      solution={solution}
      currentModule={currentModule}
      moduleIdx={moduleIdx}
      modules={modules}
      handleComplete={handleComplete}
      handlePrevious={handlePrevious}
      calculateProgress={calculateProgress}
      isCompleting={isCompleting}
    />
  );
};

// Separate container component to reduce complexity of the main component
const ImplementationContainer = ({
  solution,
  currentModule,
  moduleIdx,
  modules,
  handleComplete,
  handlePrevious,
  calculateProgress,
  isCompleting
}) => {
  return (
    <div className="pb-20 min-h-screen bg-slate-50">
      {/* Header section */}
      <ImplementationHeader
        solution={solution}
        moduleIdx={moduleIdx}
        modulesLength={modules.length}
        calculateProgress={calculateProgress}
      />
      
      {/* Module content */}
      <div className="container mt-6 bg-white p-6 rounded-lg shadow-sm">
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
        isCompleting={isCompleting}
      />
    </div>
  );
};

export default SolutionImplementation;
