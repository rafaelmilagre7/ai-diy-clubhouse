
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSolutionData } from "@/hooks/useSolutionData";
import { useSolutionSteps } from "@/hooks/useSolutionSteps";
import { WizardHeader } from "./WizardHeader";
import WizardProgress from "./WizardProgress";
import { WizardStepContent } from "./WizardStepContent";
import { WizardNavigation } from "./WizardNavigation";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SolutionNotFound } from "@/components/solution/SolutionNotFound";
import { useLogging } from "@/hooks/useLogging";
import { PageTransition } from "@/components/transitions/PageTransition";

const SolutionImplementationWizard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { log, logError } = useLogging();
  
  // Fetch solution data
  const { solution, loading, error } = useSolutionData(id);
  
  // Initialize wizard steps
  const {
    currentStep,
    setCurrentStep,
    totalSteps,
    stepTitles,
    steps,
    currentStepData
  } = useSolutionSteps(solution);

  // Log wizard initialization
  useEffect(() => {
    if (solution) {
      log("Implementation wizard started", { 
        solution_id: solution.id, 
        solution_title: solution.title,
        total_steps: totalSteps
      });
    }
  }, [solution, totalSteps, log]);

  if (loading) {
    return <LoadingScreen message="Carregando guia de implementação..." />;
  }

  if (error || !solution) {
    logError("Solution not found for implementation", { id, error });
    return <SolutionNotFound />;
  }

  // Calculate progress percentage
  const progressPercentage = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      log("Implementation wizard step advanced", { 
        solution_id: solution.id,
        from_step: currentStep,
        to_step: currentStep + 1
      });
    } else {
      // Complete implementation
      log("Implementation wizard completed", { 
        solution_id: solution.id,
        total_steps: totalSteps
      });
      navigate(`/solution/${solution.id}`);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(`/solution/${solution.id}`);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow navigation to completed or current step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
      log("Implementation wizard step clicked", { 
        solution_id: solution.id,
        clicked_step: stepIndex
      });
    }
  };

  const canGoNext = currentStepData?.hasContent !== false;
  const canGoPrevious = currentStep > 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        {/* Fixed Header */}
        <WizardHeader
          solution={solution}
          currentStep={currentStep}
          totalSteps={totalSteps}
          progressPercentage={progressPercentage}
        />

        {/* Main Content */}
        <div className="pt-20 pb-24">
          <div className="max-w-4xl mx-auto px-4">
            {/* Progress Indicator */}
            <div className="mb-8">
              <WizardProgress
                currentStep={currentStep}
                totalSteps={totalSteps}
                stepTitles={stepTitles}
                onStepClick={handleStepClick}
              />
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
              <div className="p-8">
                <WizardStepContent
                  solution={solution}
                  stepType={currentStepData?.type || "overview"}
                  stepIndex={currentStep}
                  onNext={handleNext}
                  canGoNext={canGoNext}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Navigation */}
        <WizardNavigation
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          isLastStep={isLastStep}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentStep={currentStep + 1}
          totalSteps={totalSteps}
        />
      </div>
    </PageTransition>
  );
};

export default SolutionImplementationWizard;
