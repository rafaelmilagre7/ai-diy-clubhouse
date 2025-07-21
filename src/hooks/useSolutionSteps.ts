
import { useState, useMemo } from "react";
import { Solution } from "@/lib/supabase";

interface SolutionStep {
  id: number;
  title: string;
  description: string;
  type: string;
  hasContent: boolean;
}

export const useSolutionSteps = (solution: Solution | null) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");

  // Generate steps based on real solution data
  const steps = useMemo((): SolutionStep[] => {
    if (!solution) return [];

    const generatedSteps: SolutionStep[] = [];

    // Step 1: Always start with overview
    generatedSteps.push({
      id: 0,
      title: "Visão Geral",
      description: "Entenda a solução antes de começar",
      type: "overview",
      hasContent: true
    });

    // Step 2: Check if we have implementation steps
    let implementationSteps = [];
    try {
      if (solution.implementation_steps) {
        implementationSteps = typeof solution.implementation_steps === 'string'
          ? JSON.parse(solution.implementation_steps)
          : solution.implementation_steps;
      }
    } catch (e) {
      implementationSteps = [];
    }

    // Add implementation steps if they exist
    if (implementationSteps && implementationSteps.length > 0) {
      implementationSteps.forEach((step: any, index: number) => {
        generatedSteps.push({
          id: generatedSteps.length,
          title: step.title || `Passo ${index + 1}`,
          description: step.description || "Siga as instruções para implementar",
          type: "implementation",
          hasContent: true
        });
      });
    } else {
      // Add a generic implementation step if no specific steps exist
      generatedSteps.push({
        id: generatedSteps.length,
        title: "Implementação",
        description: "Implemente a solução seguindo as orientações",
        type: "implementation",
        hasContent: !!solution.overview
      });
    }

    // Step 3: Check if we have checklist items
    let checklistItems = [];
    try {
      if (solution.checklist_items) {
        checklistItems = typeof solution.checklist_items === 'string'
          ? JSON.parse(solution.checklist_items)
          : solution.checklist_items;
      }
    } catch (e) {
      checklistItems = [];
    }

    // Add checklist step only if items exist
    if (checklistItems && checklistItems.length > 0) {
      generatedSteps.push({
        id: generatedSteps.length,
        title: "Verificação",
        description: "Confirme se tudo foi implementado corretamente",
        type: "checklist",
        hasContent: true
      });
    }

    // Step 4: Always end with completion
    generatedSteps.push({
      id: generatedSteps.length,
      title: "Conclusão",
      description: "Finalize sua implementação",
      type: "completion",
      hasContent: true
    });

    return generatedSteps;
  }, [solution]);

  const totalSteps = steps.length;
  const stepTitles = steps.map(step => step.title);
  const currentStepData = steps[currentStep];

  // Helper function to get default tab for step
  const getDefaultTabForStep = (step: number): string => {
    const stepData = steps[step];
    return stepData?.type || "overview";
  };

  // Update step and tab together
  const updateStepAndTab = (newStep: number) => {
    if (newStep >= 0 && newStep < totalSteps) {
      setCurrentStep(newStep);
      setActiveTab(getDefaultTabForStep(newStep));
    }
  };

  return {
    currentStep,
    setCurrentStep: updateStepAndTab,
    activeTab,
    setActiveTab,
    totalSteps,
    stepTitles,
    steps,
    currentStepData
  };
};

export default useSolutionSteps;
