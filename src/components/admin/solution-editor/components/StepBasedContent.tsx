
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
  setActiveTab: (value: string) => void;
  onStepSave: (stepSaveFunction: () => Promise<void>) => void;
}

const StepBasedContent: React.FC<StepBasedContentProps> = ({
  activeTab,
  currentStep,
  solution,
  currentValues,
  onSubmit,
  saving,
  setActiveTab,
  onStepSave
}) => {
  return (
    <div>
      <div className="mx-6 mt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
          <TabsContent value={activeTab} className="mt-6">
            <TabContent
              activeTab={activeTab}
              currentStep={currentStep}
              solution={solution}
              currentValues={currentValues}
              onSubmit={onSubmit}
              saving={saving}
              onStepSave={onStepSave}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StepBasedContent;
