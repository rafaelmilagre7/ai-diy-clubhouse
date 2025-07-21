
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionModules } from "@/hooks/implementation/useSolutionModules";
import { useProgressTracking } from "@/hooks/implementation/useProgressTracking";
import { WizardProgress } from "./WizardProgress";
import { WizardStepContent } from "./WizardStepContent";
import { WizardNavigation } from "./WizardNavigation";
import { WizardHeader } from "./WizardHeader";
import LoadingScreen from "@/components/common/LoadingScreen";
import { Card } from "@/components/ui/card";
import { useLogging } from "@/hooks/useLogging";

const SolutionImplementationWizard = () => {
  const { id, moduleIdx } = useParams<{ id: string; moduleIdx: string }>();
  const moduleIndex = parseInt(moduleIdx || "0");
  const navigate = useNavigate();
  const { log } = useLogging();
  
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  
  // Fetch solution data
  const { solution, loading: solutionLoading, progress } = useSolutionData(id);
  
  // Generate modules based on solution
  const modules = useSolutionModules(solution);
  
  // Progress tracking
  const {
    handleMarkAsCompleted,
    calculateProgress,
    setModuleInteraction,
    moduleIdx: currentModuleIdx
  } = useProgressTracking(
    progress,
    completedModules,
    setCompletedModules,
    modules.length
  );
  
  // Step titles for the wizard progress
  const stepTitles = modules.map(module => module.title);
  
  useEffect(() => {
    log("Solution Implementation Wizard loaded", {
      solutionId: id,
      moduleIndex,
      totalModules: modules.length,
      completedModules: completedModules.length
    });
  }, [id, moduleIndex, modules.length, completedModules.length, log]);
  
  if (solutionLoading) {
    return <LoadingScreen message="Carregando implementação..." />;
  }
  
  if (!solution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Solução não encontrada</h2>
          <p className="text-neutral-400">A solução que você está procurando não existe ou foi removida.</p>
        </Card>
      </div>
    );
  }
  
  if (modules.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Módulos não disponíveis</h2>
          <p className="text-neutral-400">Esta solução ainda não possui módulos de implementação configurados.</p>
        </Card>
      </div>
    );
  }
  
  const currentModule = modules[moduleIndex] || modules[0];
  const canGoNext = hasUserInteracted || completedModules.includes(moduleIndex);
  const canGoPrevious = moduleIndex > 0;
  
  const handleNext = () => {
    if (canGoNext && moduleIndex < modules.length - 1) {
      setModuleInteraction(true);
      handleMarkAsCompleted();
      navigate(`/implement/${id}/${moduleIndex + 1}`);
    }
  };
  
  const handlePrevious = () => {
    if (canGoPrevious) {
      navigate(`/implement/${id}/${moduleIndex - 1}`);
    } else {
      navigate(`/solution/${id}`);
    }
  };
  
  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps or the next step
    if (stepIndex <= moduleIndex || completedModules.includes(stepIndex)) {
      navigate(`/implement/${id}/${stepIndex}`);
    }
  };
  
  const handleModuleComplete = () => {
    setHasUserInteracted(true);
    setModuleInteraction(true);
    handleMarkAsCompleted();
    
    // Auto-navigate to next module if not the last one
    if (moduleIndex < modules.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 1000);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-viverblue/5 via-transparent to-viverblue-dark/8" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-viverblue/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-viverblue-dark/12 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Wizard Header */}
        <WizardHeader 
          solution={solution}
          currentStep={moduleIndex}
          totalSteps={modules.length}
          progressPercentage={calculateProgress()}
        />
        
        {/* Wizard Progress */}
        <div className="px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <WizardProgress
              currentStep={moduleIndex}
              totalSteps={modules.length}
              stepTitles={stepTitles}
              onStepClick={handleStepClick}
              completedSteps={completedModules}
            />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 px-4 pb-8">
          <div className="max-w-4xl mx-auto">
            <WizardStepContent
              module={currentModule}
              onComplete={handleModuleComplete}
              onInteraction={() => setHasUserInteracted(true)}
            />
          </div>
        </div>
        
        {/* Navigation */}
        <WizardNavigation
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          isLastStep={moduleIndex === modules.length - 1}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentStep={moduleIndex + 1}
          totalSteps={modules.length}
        />
      </div>
    </div>
  );
};

export default SolutionImplementationWizard;
