
import { useState, useMemo } from "react";
import { Solution } from "@/lib/supabase";

interface SolutionStep {
  id: number;
  title: string;
  description: string;
  type: string;
}

export const useSolutionSteps = (solution: Solution | null) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState("basic");

  // Generate steps based on solution data
  const steps = useMemo((): SolutionStep[] => {
    if (!solution) return [];

    const generatedSteps: SolutionStep[] = [];

    // Always start with basic info
    generatedSteps.push({
      id: 0,
      title: "Informações Básicas",
      description: "Visão geral da solução",
      type: "basic"
    });

    // Add tools step if tools are defined
    let toolsNeeded = [];
    try {
      if (solution.tools_needed) {
        toolsNeeded = typeof solution.tools_needed === 'string'
          ? JSON.parse(solution.tools_needed)
          : solution.tools_needed;
      }
    } catch (e) {
      // Silent error handling
    }

    if (toolsNeeded.length > 0) {
      generatedSteps.push({
        id: generatedSteps.length,
        title: "Ferramentas Necessárias",
        description: "Prepare as ferramentas para implementação", 
        type: "tools"
      });
    }

    // Add implementation steps
    let implementationSteps = [];
    try {
      if (solution.implementation_steps) {
        implementationSteps = typeof solution.implementation_steps === 'string'
          ? JSON.parse(solution.implementation_steps)
          : solution.implementation_steps;
      }
    } catch (e) {
      // Silent error handling
    }

    if (implementationSteps.length > 0) {
      implementationSteps.forEach((step: any, index: number) => {
        generatedSteps.push({
          id: generatedSteps.length,
          title: step.title || `Implementação ${index + 1}`,
          description: step.description || "Passo de implementação",
          type: "implementation"
        });
      });
    } else {
      // Add generic implementation step if no specific steps
      generatedSteps.push({
        id: generatedSteps.length,
        title: "Implementação",
        description: "Implementar a solução",
        type: "implementation"
      });
    }

    // Add checklist step if checklist items exist
    let checklistItems = [];
    try {
      if (solution.checklist_items) {
        checklistItems = typeof solution.checklist_items === 'string'
          ? JSON.parse(solution.checklist_items)
          : solution.checklist_items;
      }
    } catch (e) {
      // Silent error handling
    }

    if (checklistItems.length > 0) {
      generatedSteps.push({
        id: generatedSteps.length,
        title: "Checklist de Verificação",
        description: "Verifique os itens implementados",
        type: "checklist"
      });
    }

    // Always end with completion
    generatedSteps.push({
      id: generatedSteps.length,
      title: "Finalização",
      description: "Concluir implementação",
      type: "completion"
    });

    return generatedSteps;
  }, [solution]);

  const totalSteps = steps.length;
  const stepTitles = steps.map(step => step.title);

  // Helper function to get default tab for step
  const getDefaultTabForStep = (step: number): string => {
    const stepData = steps[step];
    return stepData?.type || "basic";
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
    steps
  };
};

export default useSolutionSteps;
