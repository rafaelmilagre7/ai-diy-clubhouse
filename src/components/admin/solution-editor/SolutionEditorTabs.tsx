
import React, { useEffect } from "react";
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
import ResourcesTab from "./tabs/ResourcesTab";
import ToolsTab from "./tabs/ToolsTab";
import VideoTab from "./tabs/VideoTab";
import ChecklistTab from "./tabs/ChecklistTab";
import PublishTab from "./tabs/PublishTab";

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
  
  // Auto-save when changing tabs
  useEffect(() => {
    // Don't trigger auto-save if we're in the process of initial loading
    if (solution && !saving) {
      // Save the current values automatically when changing tabs
      onSubmit(currentValues);
    }
  }, [activeTab]); // Only trigger on tab change
  
  // Renderiza apenas o conteúdo apropriado para a etapa atual
  const renderContent = () => {
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

    // Render different content based on active tab OR step
    if (currentStep === 0) {
      // In step 0, show tab content based on active tab
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
            <ChecklistTab 
              solutionId={solution?.id || null} 
              onSave={() => onSubmit(currentValues)} 
              saving={saving}
            />
          );
        
        case 5:
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
    
    // Default view for step 0 if no valid tab is selected
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

  // Mostra abas apenas na primeira etapa
  const shouldShowTabs = currentStep === 0;

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
    </div>
  );
};

export default SolutionEditorTabs;
