
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Solution } from "@/lib/supabase";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import BasicInfoTab from "../tabs/BasicInfoTab";
import ResourcesTab from "../tabs/ResourcesTab";
import ToolsTab from "../tabs/ToolsTab";
import VideoTab from "../tabs/VideoTab";
import ChecklistTab from "../tabs/ChecklistTab";
import PublishTab from "../tabs/PublishTab";
import ModulesTab from "../tabs/ModulesTab";

interface TabContentProps {
  activeTab: string;
  currentStep: number;
  solution: Solution | null;
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
}

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  currentStep,
  solution,
  currentValues,
  onSubmit,
  saving
}) => {
  const isValid = solution && solution.id;

  // Verificar se a solução existe para exibir as abas que exigem ID
  if (!isValid && currentStep > 0) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Solução não encontrada</AlertTitle>
        <AlertDescription>
          É necessário salvar as informações básicas antes de prosseguir.
        </AlertDescription>
      </Alert>
    );
  }

  // Render content based on step or active tab
  if (currentStep === 0) {
    // In step 0, show content based on active tab
    switch (activeTab) {
      case "basic":
        return (
          <BasicInfoTab 
            currentValues={currentValues} 
            onSubmit={onSubmit} 
            saving={saving} 
          />
        );
      case "resources":
        if (isValid) {
          return (
            <ResourcesTab 
              solutionId={solution?.id || null} 
              onSave={() => onSubmit(currentValues)} 
              saving={saving} 
            />
          );
        }
        break;
      case "tools":
        if (isValid) {
          return (
            <ToolsTab 
              solutionId={solution?.id || null} 
              onSave={() => onSubmit(currentValues)} 
              saving={saving} 
            />
          );
        }
        break;
      case "video":
        if (isValid) {
          return (
            <VideoTab 
              solutionId={solution?.id || null} 
              onSave={() => onSubmit(currentValues)} 
              saving={saving} 
            />
          );
        }
        break;
      case "modules":
        if (isValid) {
          return (
            <ModulesTab
              solutionId={solution?.id || null}
              onSave={() => onSubmit(currentValues)}
              saving={saving}
              currentModuleStep={0}
            />
          );
        }
        break;
      case "checklist":
        if (isValid) {
          return (
            <ChecklistTab 
              solutionId={solution?.id || null} 
              onSave={() => onSubmit(currentValues)} 
              saving={saving} 
            />
          );
        }
        break;
      case "publish":
        if (isValid) {
          return (
            <PublishTab 
              solutionId={solution?.id || null}
              solution={solution}
              onSave={onSubmit}
              saving={saving}
            />
          );
        }
        break;
    }
  } else {
    // For steps > 0, show content based on step
    switch (currentStep) {
      case 1:
        return (
          <ToolsTab 
            solutionId={solution?.id || null} 
            onSave={() => onSubmit(currentValues)} 
            saving={saving}
          />
        );
      
      case 2:
        return (
          <ResourcesTab 
            solutionId={solution?.id || null} 
            onSave={() => onSubmit(currentValues)} 
            saving={saving} 
          />
        );
      
      case 3:
        return (
          <VideoTab 
            solutionId={solution?.id || null} 
            onSave={() => onSubmit(currentValues)} 
            saving={saving}
          />
        );
      
      case 4:
        return (
          <ModulesTab
            solutionId={solution?.id || null}
            onSave={() => onSubmit(currentValues)}
            saving={saving}
            currentModuleStep={currentStep}
          />
        );
      
      case 5:
        return (
          <ChecklistTab 
            solutionId={solution?.id || null} 
            onSave={() => onSubmit(currentValues)} 
            saving={saving}
          />
        );
      
      case 6:
        return (
          <PublishTab 
            solutionId={solution?.id || null}
            solution={solution}
            onSave={onSubmit}
            saving={saving}
          />
        );
    }
  }
  
  // Default for step 0 if no valid tab is selected
  if (currentStep === 0) {
    return (
      <BasicInfoTab 
        currentValues={currentValues} 
        onSubmit={onSubmit} 
        saving={saving} 
      />
    );
  }
  
  // Default alert for unrecognized steps
  return (
    <Alert variant="default" className="bg-amber-50 border-amber-200">
      <AlertTitle>Etapa não reconhecida</AlertTitle>
      <AlertDescription>
        Por favor, volte para uma etapa válida ou recarregue a página.
      </AlertDescription>
    </Alert>
  );
};

export default TabContent;
