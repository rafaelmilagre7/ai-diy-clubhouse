
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
}

const StepBasedContent: React.FC<StepBasedContentProps> = ({
  activeTab,
  currentStep,
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  // Função para enviar o valor do tab para o componente pai
  const handleTabChange = (value: string) => {
    console.log(`Tab changed to ${value}`);
    // Esta função é apenas um espaço reservado; a navegação real é controlada pelo componente pai
  };

  return (
    <div>
      <div className="mx-6 mt-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabNav activeTab={activeTab} setActiveTab={handleTabChange} />
          <TabsContent value={activeTab} className="mt-6">
            <TabContent
              activeTab={activeTab}
              currentStep={currentStep}
              solution={solution}
              currentValues={currentValues}
              onSubmit={onSubmit}
              saving={saving}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StepBasedContent;
