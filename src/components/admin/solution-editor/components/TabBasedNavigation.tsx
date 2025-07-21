
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import TabNav from "../TabNav";
import TabContent from "./TabContent";
import { Solution } from "@/lib/supabase";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";

interface TabBasedNavigationProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  solution: Solution | null;
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
  onStepSave: (stepSaveFunction: () => Promise<void>) => void;
}

const TabBasedNavigation: React.FC<TabBasedNavigationProps> = ({
  activeTab,
  setActiveTab,
  solution,
  currentValues,
  onSubmit,
  saving,
  onStepSave
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <div className="mx-6">
        <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      <TabsContent value={activeTab} className="space-y-6 mt-6 px-6 pb-6">
        <TabContent
          activeTab={activeTab}
          currentStep={0}
          solution={solution}
          currentValues={currentValues}
          onSubmit={onSubmit}
          saving={saving}
          onStepSave={onStepSave}
        />
      </TabsContent>
    </Tabs>
  );
};

export default TabBasedNavigation;
