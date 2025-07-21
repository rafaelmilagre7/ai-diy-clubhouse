
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Solution } from "@/lib/supabase";
import { SolutionFormValues } from "@/components/admin/solution/form/solutionFormSchema";
import TabContent from "./components/TabContent";

interface SolutionEditorTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  solution: Solution | null;
  currentValues: SolutionFormValues;
  onSubmit: (values: SolutionFormValues) => Promise<void>;
  saving: boolean;
  currentStep: number;
  onStepSave?: (stepSaveFunction: () => Promise<void>) => void;
}

const SolutionEditorTabs: React.FC<SolutionEditorTabsProps> = ({
  activeTab,
  setActiveTab,
  solution,
  currentValues,
  onSubmit,
  saving,
  currentStep,
  onStepSave
}) => {
  const stepTitles = [
    "Informações Básicas",
    "Ferramentas",
    "Materiais",
    "Vídeos",
    "Checklist",
    "Publicar"
  ];

  const totalSteps = stepTitles.length;
  const isStepMode = currentStep >= 0;

  if (isStepMode) {
    // Modo passo-a-passo
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-xl font-semibold">
              {stepTitles[currentStep]} 
              <Badge variant="outline" className="ml-2">
                Etapa {currentStep + 1} de {totalSteps}
              </Badge>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Complete todas as etapas para publicar sua solução
            </p>
          </div>
        </div>
        
        <TabContent 
          activeTab={activeTab}
          currentStep={currentStep}
          solution={solution}
          currentValues={currentValues}
          onSubmit={onSubmit}
          saving={saving}
          onStepSave={onStepSave}
        />
      </div>
    );
  }

  // Modo abas tradicionais
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="tools" disabled={!solution?.id}>Ferramentas</TabsTrigger>
        <TabsTrigger value="resources" disabled={!solution?.id}>Materiais</TabsTrigger>
        <TabsTrigger value="video" disabled={!solution?.id}>Vídeos</TabsTrigger>
        <TabsTrigger value="checklist" disabled={!solution?.id}>Checklist</TabsTrigger>
        <TabsTrigger value="publish" disabled={!solution?.id}>Publicar</TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabContent 
          activeTab={activeTab}
          currentStep={currentStep}
          solution={solution}
          currentValues={currentValues}
          onSubmit={onSubmit}
          saving={saving}
          onStepSave={onStepSave}
        />
      </div>
    </Tabs>
  );
};

export default SolutionEditorTabs;
