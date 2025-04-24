
import React from "react";
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

/**
 * Componente principal para o editor de soluções baseado em abas/etapas
 * Gerencia a exibição correta do conteúdo com base na etapa atual
 */
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
  
  // Mostra abas apenas na primeira etapa
  const shouldShowTabs = currentStep === 0;

  return (
    <div className="space-y-6">
      <TabHeader currentStep={currentStep} activeTab={activeTab} />
      
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
          setActiveTab={setActiveTab} // Passando o setter do activeTab
        />
      )}
    </div>
  );
};

export default SolutionEditorTabs;
