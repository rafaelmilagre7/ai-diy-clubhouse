
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
  onStepSave: (stepSaveFunction: () => Promise<void>) => void;
  onValuesChange?: (values: SolutionFormValues) => void;
}

const SolutionEditorTabs: React.FC<SolutionEditorTabsProps> = ({
  activeTab,
  setActiveTab,
  solution,
  currentValues,
  onSubmit,
  saving,
  currentStep,
  onStepSave,
  onValuesChange
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

  // Sempre mostrar com abas navegáveis no topo
  const tabItems = [
    { value: "basic", label: "Básico", disabled: false },
    { value: "tools", label: "Ferramentas", disabled: !solution?.id },
    { value: "resources", label: "Materiais", disabled: !solution?.id },
    { value: "video", label: "Vídeos", disabled: !solution?.id },
    { value: "checklist", label: "Checklist", disabled: !solution?.id },
    { value: "publish", label: "Publicar", disabled: !solution?.id }
  ];

  // Se estiver em modo step, mostrar também o badge de progresso
  const showStepProgress = isStepMode && currentStep >= 0;

  return (
    <div className="w-full space-y-6">
      {/* Cabeçalho com progresso se estiver em modo step */}
      {showStepProgress && (
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
      )}

      {/* Abas navegáveis */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {tabItems.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value} 
              disabled={tab.disabled}
              className="relative"
            >
              {tab.label}
              {/* Indicador visual da aba ativa no modo step */}
              {showStepProgress && activeTab === tab.value && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
              )}
            </TabsTrigger>
          ))}
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
            onValuesChange={onValuesChange}
          />
        </div>
      </Tabs>
    </div>
  );
};

export default SolutionEditorTabs;
