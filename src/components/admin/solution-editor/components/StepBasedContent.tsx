
import React from "react";
import TabContent from "./TabContent";
import { Solution } from "@/lib/supabase";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

interface StepBasedContentProps {
  activeTab: string;
  currentStep: number;
  solution: Solution | null;
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const StepBasedContent: React.FC<StepBasedContentProps> = ({
  activeTab,
  currentStep,
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  return (
    <div className="px-6 pb-6 pt-4">
      <TabContent
        activeTab={activeTab}
        currentStep={currentStep}
        solution={solution}
        currentValues={currentValues}
        onSubmit={onSubmit}
        saving={saving}
      />
    </div>
  );
};

export default StepBasedContent;
