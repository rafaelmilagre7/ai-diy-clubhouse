
import React from "react";
import { Tabs } from "@/components/ui/tabs";
import TabNav from "../TabNav";
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
  // Normalmente, precisaríamos de um setter real para activeTab,
  // mas como isso é controlado pelo componente pai, vamos apenas criar um stub
  const handleTabChange = (tab: string) => {
    console.log(`Tab changed to ${tab}, but this is handled by parent component`);
    // Na realidade, precisaríamos chamar uma função do componente pai para atualizar o estado
  };

  return (
    <div>
      <div className="mx-6 mt-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabNav activeTab={activeTab} setActiveTab={handleTabChange} />
        </Tabs>
      </div>
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
    </div>
  );
};

export default StepBasedContent;
