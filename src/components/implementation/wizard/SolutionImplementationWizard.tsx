
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useProgressTracking } from "@/hooks/implementation/useProgressTracking";
import { useImplementationNavigation } from "@/hooks/implementation/useImplementationNavigation";
import { WizardProgress } from "./WizardProgress";
import { WizardHeader } from "./WizardHeader";
import { WizardStepContent } from "./WizardStepContent";
import { WizardNavigation } from "./WizardNavigation";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const SolutionImplementationWizard = () => {
  const { id, moduleIndex } = useParams<{ id: string; moduleIndex: string }>();
  const currentStep = parseInt(moduleIndex || "0");
  
  const { solution, loading: solutionLoading, progress } = useSolutionData(id);
  const { handleComplete, handlePrevious, handleNavigateToModule } = useImplementationNavigation();
  
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Get steps from solution data or create fallback
  const getStepsFromSolution = () => {
    if (!solution) return [];
    
    const steps = [];
    
    // Parse implementation_steps if available
    let implementationSteps = [];
    if (solution.implementation_steps) {
      try {
        implementationSteps = typeof solution.implementation_steps === 'string' 
          ? JSON.parse(solution.implementation_steps)
          : solution.implementation_steps;
      } catch (e) {
        console.warn("Erro ao parsear implementation_steps:", e);
      }
    }
    
    // Parse checklist_items if available
    let checklistItems = [];
    if (solution.checklist_items) {
      try {
        checklistItems = typeof solution.checklist_items === 'string'
          ? JSON.parse(solution.checklist_items)
          : solution.checklist_items;
      } catch (e) {
        console.warn("Erro ao parsear checklist_items:", e);
      }
    }
    
    // Create steps based on available data
    if (implementationSteps.length > 0) {
      implementationSteps.forEach((step: any, index: number) => {
        steps.push({
          id: index,
          title: step.title || `Etapa ${index + 1}`,
          description: step.description || "",
          type: "implementation"
        });
      });
    }
    
    if (checklistItems.length > 0) {
      steps.push({
        id: steps.length,
        title: "Checklist Final",
        description: "Verificação dos itens implementados",
        type: "checklist"
      });
    }
    
    // Fallback if no data
    if (steps.length === 0) {
      return [
        { id: 0, title: "Informações Básicas", description: "Configuração inicial", type: "basic" },
        { id: 1, title: "Ferramentas", description: "Ferramentas necessárias", type: "tools" },
        { id: 2, title: "Implementação", description: "Passos de implementação", type: "implementation" },
        { id: 3, title: "Verificação", description: "Checklist final", type: "checklist" },
        { id: 4, title: "Conclusão", description: "Finalização", type: "completion" }
      ];
    }
    
    return steps;
  };
  
  const steps = getStepsFromSolution();
  const totalSteps = steps.length;
  
  const {
    moduleIdx,
    handleMarkAsCompleted,
    showConfirmationModal,
    setShowConfirmationModal,
    handleConfirmImplementation,
    calculateProgress,
    setModuleInteraction
  } = useProgressTracking(progress, completedSteps, setCompletedSteps, totalSteps);

  // Update completed steps based on progress
  useEffect(() => {
    if (progress?.completed_modules && Array.isArray(progress.completed_modules)) {
      setCompletedSteps(progress.completed_modules);
    }
  }, [progress]);

  // Handle step navigation
  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to completed steps or current step
    if (completedSteps.includes(stepIndex) || stepIndex <= currentStep) {
      handleNavigateToModule(stepIndex);
    }
  };

  const canGoNext = () => {
    return currentStep < totalSteps - 1;
  };
  
  const canGoPrevious = () => {
    return currentStep > 0;
  };
  
  const isLastStep = currentStep === totalSteps - 1;
  
  const handleNext = () => {
    if (canGoNext()) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      handleComplete();
    } else if (isLastStep) {
      handleConfirmImplementation();
    }
  };

  if (solutionLoading || !solution) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-lg">Carregando implementação...</span>
        </div>
      </div>
    );
  }

  const currentStepData = steps[currentStep];
  const progressPercentage = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <WizardHeader
        solution={solution}
        currentStep={currentStep}
        totalSteps={totalSteps}
        progressPercentage={progressPercentage}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <WizardProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepTitles={steps.map(step => step.title)}
            onStepClick={handleStepClick}
            completedSteps={completedSteps}
          />
        </div>

        {/* Main Content */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {currentStepData?.title || `Etapa ${currentStep + 1}`}
              </h2>
              {currentStepData?.description && (
                <p className="text-slate-600">
                  {currentStepData.description}
                </p>
              )}
            </div>

            <WizardStepContent
              solution={solution}
              currentStep={currentStep}
              stepData={currentStepData}
              onInteraction={() => setModuleInteraction(true)}
            />
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <WizardNavigation
        canGoNext={canGoNext()}
        canGoPrevious={canGoPrevious()}
        isLastStep={isLastStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentStep={currentStep + 1}
        totalSteps={totalSteps}
      />
    </div>
  );
};

export default SolutionImplementationWizard;
