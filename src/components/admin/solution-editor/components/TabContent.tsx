
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

interface TabContentProps {
  activeTab: string;
  currentStep: number;
  solution: Solution | null;
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
  onStepSave: (stepSaveFunction: () => Promise<void>) => void;
  onValuesChange?: (values: SolutionFormValues) => void;
}

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  currentStep,
  solution,
  currentValues,
  onSubmit,
  saving,
  onStepSave,
  onValuesChange
}) => {
  const isValid = solution && solution.id;

  // 🔍 DEBUG: Verificar se solution está carregando
  console.log('📋 [TabContent] Renderizando:', {
    currentStep,
    activeTab,
    solutionId: solution?.id,
    isValid,
    solutionLoaded: !!solution
  });

  // Verificar se a solução existe para exibir as abas que exigem ID
  if (!isValid && currentStep > 0) {
    return <Alert variant="destructive">
        <AlertTitle>Solução não encontrada</AlertTitle>
        <AlertDescription>
          É necessário salvar as informações básicas antes de prosseguir.
        </AlertDescription>
      </Alert>;
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
            onStepSave={onStepSave}
            onValuesChange={onValuesChange}
          />
        );
      case "resources":
        if (isValid) {
          return <ResourcesTab solutionId={solution?.id || null} onSave={() => onSubmit(currentValues)} saving={saving} />;
        }
        break;
      case "tools":
        if (isValid) {
          // Renderizando ToolsTab
          return <ToolsTab solutionId={solution?.id || null} onSave={onStepSave} saving={saving} />;
        }
        break;
      case "video":
        if (isValid) {
          return <VideoTab solutionId={solution?.id || null} onSave={() => onSubmit(currentValues)} saving={saving} />;
        }
        break;
      case "checklist":
        if (isValid && solution?.id) {
          console.log('✅ [TabContent] Renderizando ChecklistTab com solutionId:', solution.id);
          return <ChecklistTab solutionId={solution.id} onSave={() => onSubmit(currentValues)} saving={saving} />;
        } else {
          console.warn('⚠️ [TabContent] ChecklistTab não renderizado - solution inválida:', { isValid, solutionId: solution?.id });
        }
        break;
      case "publish":
        if (isValid) {
          return <PublishTab solutionId={solution?.id || null} solution={solution} onSave={onSubmit} saving={saving} />;
        }
        break;
    }
  } else {
    // For steps > 0, show content based on step
    switch (currentStep) {
      case 1:
        // Renderizando ToolsTab para step 1
        return <ToolsTab solutionId={solution?.id || null} onSave={onStepSave} saving={saving} />;
      case 2:
        return <ResourcesTab solutionId={solution?.id || null} onSave={() => onSubmit(currentValues)} saving={saving} />;
      case 3:
        return <VideoTab solutionId={solution?.id || null} onSave={() => onSubmit(currentValues)} saving={saving} />;
      case 4:
        if (solution?.id) {
          return <ChecklistTab solutionId={solution.id} onSave={() => onSubmit(currentValues)} saving={saving} />;
        }
        break;
      case 5:
        return <PublishTab solutionId={solution?.id || null} solution={solution} onSave={onSubmit} saving={saving} />;
    }
  }

  // Default for step 0 if no valid tab is selected
  if (currentStep === 0) {
    return (
      <BasicInfoTab 
        currentValues={currentValues} 
        onSubmit={onSubmit} 
        saving={saving} 
        onStepSave={onStepSave}
        onValuesChange={onValuesChange}
      />
    );
  }

  // Default alert for unrecognized steps
  return <Alert variant="default" className="border-operational/20 bg-card">
      <AlertTitle>Etapa não reconhecida</AlertTitle>
      <AlertDescription>
        Por favor, volte para uma etapa válida ou recarregue a página.
      </AlertDescription>
    </Alert>;
};

export default TabContent;
