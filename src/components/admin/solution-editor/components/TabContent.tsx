
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
import { useToolsChecklist } from "@/hooks/useToolsChecklist";

interface TabContentProps {
  activeTab: string;
  currentStep: number;
  solution: Solution | null;
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
  onStepSave?: (stepSaveFunction: () => Promise<void>) => void;
}

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  currentStep,
  solution,
  currentValues,
  onSubmit,
  saving,
  onStepSave
}) => {
  const isValid = solution && solution.id;
  
  // Hook para ferramentas - usado apenas na etapa de ferramentas
  const { saveTools } = useToolsChecklist(currentStep === 1 ? solution?.id || null : null);

  // Registrar função de salvamento para etapa de ferramentas (currentStep 1 = "Etapa 2 de 6")
  React.useEffect(() => {
    console.log("🔧 TabContent: Verificando registro de função de salvamento");
    console.log("📍 TabContent: currentStep =", currentStep);
    console.log("🔧 TabContent: saveTools disponível =", !!saveTools);
    console.log("📝 TabContent: onStepSave disponível =", !!onStepSave);
    
    if (onStepSave && currentStep === 1 && saveTools) {
      console.log("✅ TabContent: REGISTRANDO função de salvamento para etapa de ferramentas");
      onStepSave(saveTools);
    } else {
      console.log("⚠️ TabContent: Não registrando função - condições não atendidas");
    }
  }, [currentStep, saveTools, onStepSave]);

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
        return <BasicInfoTab currentValues={currentValues} onSubmit={onSubmit} saving={saving} />;
      case "resources":
        if (isValid) {
          return <ResourcesTab solutionId={solution?.id || null} onSave={() => onSubmit(currentValues)} saving={saving} />;
        }
        break;
      case "tools":
        if (isValid) {
          return <ToolsTab solutionId={solution?.id || null} onSave={() => onSubmit(currentValues)} saving={saving} />;
        }
        break;
      case "video":
        if (isValid) {
          return <VideoTab solutionId={solution?.id || null} onSave={() => onSubmit(currentValues)} saving={saving} />;
        }
        break;
      case "checklist":
        if (isValid) {
          return <ChecklistTab solutionId={solution?.id || null} onSave={() => onSubmit(currentValues)} saving={saving} />;
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
        console.log("🔧 TabContent: Renderizando ToolsTab para currentStep 1");
        console.log("🔧 TabContent: solutionId =", solution?.id);
        return <ToolsTab solutionId={solution?.id || null} onSave={() => {}} saving={saving} />;
      case 2:
        return <ResourcesTab solutionId={solution?.id || null} onSave={() => onSubmit(currentValues)} saving={saving} />;
      case 3:
        return <VideoTab solutionId={solution?.id || null} onSave={() => onSubmit(currentValues)} saving={saving} />;
      case 4:
        return <ChecklistTab solutionId={solution?.id || null} onSave={() => onSubmit(currentValues)} saving={saving} />;
      case 5:
        return <PublishTab solutionId={solution?.id || null} solution={solution} onSave={onSubmit} saving={saving} />;
    }
  }

  // Default for step 0 if no valid tab is selected
  if (currentStep === 0) {
    return <BasicInfoTab currentValues={currentValues} onSubmit={onSubmit} saving={saving} />;
  }

  // Default alert for unrecognized steps
  return <Alert variant="default" className="border-amber-200 bg-slate-900">
      <AlertTitle>Etapa não reconhecida</AlertTitle>
      <AlertDescription>
        Por favor, volte para uma etapa válida ou recarregue a página.
      </AlertDescription>
    </Alert>;
};

export default TabContent;
