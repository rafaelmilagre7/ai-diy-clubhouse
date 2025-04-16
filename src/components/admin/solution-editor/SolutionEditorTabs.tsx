
import React, { useEffect } from "react";
import { Solution } from "@/lib/supabase";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import TabHeader from "./TabHeader";
import TabBasedNavigation from "./components/TabBasedNavigation";
import StepBasedContent from "./components/StepBasedContent";

interface SolutionEditorTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  solution: Solution | null;
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
  currentStep: number;
}

const SolutionEditorTabs = ({
  activeTab,
  setActiveTab,
  solution,
  currentValues,
  onSubmit,
  saving,
  currentStep,
}: SolutionEditorTabsProps) => {
  const isValid = solution && solution.id;
  
  // Auto-save when changing tabs (silently, without toast)
  useEffect(() => {
    // Don't trigger auto-save if we're in the process of initial loading
    if (solution && !saving) {
      // Save the current values automatically when changing tabs
      onSubmit(currentValues);
    }
  }, [activeTab]); // Only trigger on tab change
  
  // Mostra abas apenas na primeira etapa
  const shouldShowTabs = currentStep === 0;

  return (
    <div className="space-y-6">
      <TabHeader currentStep={currentStep} />
      
      {shouldShowTabs ? (
        <TabBasedNavigation 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          solution={solution}
          currentValues={currentValues}
          onSubmit={onSubmit}
          saving={saving}
        />
      ) : (
        <StepBasedContent
          activeTab={activeTab}
          currentStep={currentStep}
          solution={solution}
          currentValues={currentValues}
          onSubmit={onSubmit}
          saving={saving}
        />
      )}
    </div>
  );
};

export default SolutionEditorTabs;
