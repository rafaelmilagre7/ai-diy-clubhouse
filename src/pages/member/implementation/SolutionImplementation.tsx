
import React from "react";
import { useParams } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionModules } from "@/hooks/implementation/useSolutionModules";
import { useProgressTracking } from "@/hooks/implementation/useProgressTracking";
import { useImplementationNavigation } from "@/hooks/implementation/useImplementationNavigation";
import { ModuleContent } from "@/components/implementation/ModuleContent";
import { EnhancedImplementationNavigation } from "@/components/implementation/enhanced/EnhancedImplementationNavigation";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useState } from "react";

const SolutionImplementation = () => {
  const { id, moduleIdx } = useParams<{ id: string; moduleIdx: string }>();
  const moduleIndex = parseInt(moduleIdx || "0");
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  // Fetch solution data
  const { solution, loading: solutionLoading, progress } = useSolutionData(id);
  
  // Generate modules based on solution
  const modules = useSolutionModules(solution);
  
  // Navigation handlers
  const {
    handleComplete,
    handlePrevious,
    handleNavigateToModule,
    currentModuleIdx
  } = useImplementationNavigation();
  
  // Progress tracking
  const {
    handleMarkAsCompleted,
    calculateProgress,
    setModuleInteraction
  } = useProgressTracking(
    progress,
    completedModules,
    setCompletedModules,
    modules.length
  );
  
  if (solutionLoading) {
    return <LoadingScreen message="Carregando implementação..." />;
  }
  
  if (!solution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Solução não encontrada</h2>
          <p className="text-neutral-400">A solução que você está procurando não existe ou foi removida.</p>
        </div>
      </div>
    );
  }
  
  if (modules.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Módulos não disponíveis</h2>
          <p className="text-neutral-400">Esta solução ainda não possui módulos de implementação configurados.</p>
        </div>
      </div>
    );
  }
  
  const currentModule = modules[moduleIndex] || modules[0];
  const navigationModules = modules.map((module, index) => ({
    id: module.id,
    title: module.title,
    type: module.type,
    completed: completedModules.includes(index),
    current: index === moduleIndex
  }));
  
  const handleModuleComplete = () => {
    setModuleInteraction(true);
    handleMarkAsCompleted();
    
    // Auto-navigate to next module if not the last one
    if (moduleIndex < modules.length - 1) {
      setTimeout(() => {
        handleComplete();
      }, 1000);
    }
  };

  const canGoNext = hasUserInteracted || completedModules.includes(moduleIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-viverblue/5 via-transparent to-viverblue-dark/8" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-viverblue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-viverblue-dark/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      <div className="relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 p-4 min-h-screen">
          {/* Main Content */}
          <div className="xl:col-span-3 order-2 xl:order-1">
            <ModuleContent
              module={currentModule}
              onComplete={handleModuleComplete}
              onError={(error) => {
                console.error("Module error:", error);
              }}
            />
          </div>

          {/* Enhanced Navigation Sidebar */}
          <div className="xl:col-span-1 order-1 xl:order-2">
            <div className="sticky top-4">
              <EnhancedImplementationNavigation
                modules={navigationModules}
                solutionId={solution.id}
                currentModule={moduleIndex}
                onPrevious={handlePrevious}
                onNext={handleComplete}
                canGoNext={canGoNext}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionImplementation;
