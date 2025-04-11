
import React from "react";
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Solution } from "@/lib/supabase";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import TabHeader from "./TabHeader";
import TabNav from "./TabNav";
import BasicInfoTab from "./tabs/BasicInfoTab";
import ModulesTab from "./tabs/ModulesTab";
import ResourcesTab from "./tabs/ResourcesTab";
import ImplementationTip from "./ImplementationTip";

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
  const needsBasicInfo = currentStep === 0 || !isValid;
  const needsModules = currentStep > 0 && currentStep < 9 && isValid;
  const needsReview = currentStep === 9 && isValid;
  
  // Renderiza apenas o conteúdo apropriado para a etapa atual
  const renderContent = () => {
    if (needsBasicInfo) {
      return (
        <BasicInfoTab 
          currentValues={currentValues} 
          onSubmit={onSubmit} 
          saving={saving} 
        />
      );
    }
    
    if (needsModules) {
      return (
        <ModulesTab 
          solutionId={solution?.id || null} 
          onSave={() => onSubmit(currentValues)} 
          saving={saving}
          currentModuleStep={currentStep}
        />
      );
    }
    
    if (needsReview) {
      return (
        <ResourcesTab 
          solutionId={solution?.id || null} 
          onSave={() => onSubmit(currentValues)} 
          saving={saving} 
        />
      );
    }
    
    return (
      <Alert variant="default" className="bg-amber-50 border-amber-200">
        <AlertTitle>Etapa não reconhecida</AlertTitle>
        <AlertDescription>
          Por favor, volte para uma etapa válida ou recarregue a página.
        </AlertDescription>
      </Alert>
    );
  };

  // Mostra abas apenas na primeira etapa e etapa final
  const shouldShowTabs = currentStep === 0 || currentStep === 9;

  return (
    <div className="space-y-6">
      <TabHeader currentStep={currentStep} />
      
      {shouldShowTabs ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabNav activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <TabsContent value={activeTab} className="space-y-6 mt-6 px-6 pb-6">
            {renderContent()}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="px-6 pb-6 pt-4">
          {renderContent()}
        </div>
      )}
      
      {solution && currentStep > 0 && currentStep < 9 && (
        <div className="px-6 pb-6 border-t pt-4 mt-6">
          <ImplementationTip currentStep={currentStep} />
        </div>
      )}
    </div>
  );
};

export default SolutionEditorTabs;
