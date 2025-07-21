
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionSteps } from "@/hooks/implementation/useSolutionSteps";
import { useProgressTracking } from "@/hooks/implementation/useProgressTracking";
import { useImplementationNavigation } from "@/hooks/implementation/useImplementationNavigation";
import { WizardHeader } from "./WizardHeader";
import { WizardStepContent } from "./WizardStepContent";
import { WizardNavigation } from "./WizardNavigation";
import { WizardStepProgress } from "@/components/implementation/WizardStepProgress";
import LoadingScreen from "@/components/common/LoadingScreen";
import { toast } from "sonner";

const SolutionImplementationWizard = () => {
  const { id, moduleIdx } = useParams<{ id: string; moduleIdx: string }>();
  const navigate = useNavigate();
  const currentStepIndex = parseInt(moduleIdx || "0");
  
  // Solution data
  const { solution, loading: solutionLoading, progress } = useSolutionData(id);
  const steps = useSolutionSteps(solution);
  
  // State management
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Navigation
  const { handleComplete, handlePrevious, handleNavigateToModule } = useImplementationNavigation();
  
  // Progress tracking
  const {
    isCompleting,
    hasInteracted,
    showConfirmationModal,
    setShowConfirmationModal,
    handleMarkAsCompleted,
    handleConfirmImplementation,
    calculateProgress,
    setModuleInteraction
  } = useProgressTracking(progress, completedSteps, setCompletedSteps, steps.length);
  
  // Debug logs
  useEffect(() => {
    console.log("🎯 SOLUTION IMPLEMENTATION CARREGADO:");
    console.log("- Solution ID:", id);
    console.log("- Step Index:", currentStepIndex);
    console.log("- URL Params:", { id, moduleIdx });
  }, [id, moduleIdx, currentStepIndex]);

  useEffect(() => {
    console.log("📊 SOLUTION DATA:", {
      solution: solution?.title || "loading",
      solutionLoading,
      progress: progress ? "exists" : "none"
    });
  }, [solution, solutionLoading, progress]);

  useEffect(() => {
    console.log("🔧 STEPS DATA:", {
      totalSteps: steps.length,
      stepTypes: steps.map(s => s.type),
      hasImplementationSteps: solution?.implementation_steps ? "yes" : "no"
    });
  }, [steps, solution]);

  useEffect(() => {
    const currentStep = steps[currentStepIndex];
    console.log("📍 CURRENT STEP:", {
      index: currentStepIndex,
      step: currentStep ? {
        id: currentStep.id,
        type: currentStep.type,
        title: currentStep.title
      } : "not found"
    });
  }, [currentStepIndex, steps]);

  useEffect(() => {
    console.log("📈 RENDER STATE:", {
      currentStepIndex,
      totalSteps: steps.length,
      completedSteps,
      progressPercentage: calculateProgress(),
      hasInteracted,
      isCompleting
    });
  }, [currentStepIndex, steps.length, completedSteps, hasInteracted, isCompleting, calculateProgress]);

  // Loading state
  if (solutionLoading) {
    return <LoadingScreen message="Carregando implementação da solução..." />;
  }

  // Error states
  if (!solution) {
    toast.error("Solução não encontrada");
    navigate("/solutions");
    return null;
  }

  if (steps.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Solução sem etapas de implementação</h2>
          <p className="text-slate-300 mb-6">Esta solução ainda não possui etapas de implementação configuradas.</p>
          <button 
            onClick={() => navigate(`/solution/${id}`)}
            className="bg-viverblue hover:bg-viverblue/90 px-6 py-2 rounded-lg text-white font-medium"
          >
            Voltar à Solução
          </button>
        </div>
      </div>
    );
  }

  if (currentStepIndex >= steps.length) {
    toast.error("Etapa não encontrada");
    navigate(`/implement/${id}/0`);
    return null;
  }

  const currentStep = steps[currentStepIndex];
  const stepTitles = steps.map(s => s.title);
  const progressPercentage = calculateProgress();
  const canGoNext = currentStepIndex < steps.length - 1 && (hasInteracted || completedSteps.includes(currentStepIndex));
  const canGoPrevious = currentStepIndex > 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleConfirmImplementation();
    } else {
      handleComplete();
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStepIndex || completedSteps.includes(stepIndex)) {
      handleNavigateToModule(stepIndex);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <WizardHeader
        solution={solution}
        currentStep={currentStepIndex}
        totalSteps={steps.length}
        progressPercentage={progressPercentage}
      />

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="max-w-4xl mx-auto w-full px-4 py-6 flex-1">
          {/* Progress */}
          <WizardStepProgress
            currentStep={currentStepIndex}
            totalSteps={steps.length}
            stepTitles={stepTitles}
          />

          {/* Step Content */}
          <div className="flex-1 mt-6">
            <WizardStepContent
              step={currentStep}
              onComplete={() => handleMarkAsCompleted()}
              onInteraction={() => setModuleInteraction(true)}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <WizardNavigation
        canGoNext={canGoNext}
        canGoPrevious={canGoPrevious}
        isLastStep={isLastStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentStep={currentStepIndex + 1}
        totalSteps={steps.length}
      />
    </div>
  );
};

export default SolutionImplementationWizard;
