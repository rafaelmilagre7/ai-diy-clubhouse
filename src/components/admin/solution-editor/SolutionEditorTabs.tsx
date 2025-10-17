
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
    <div className="w-full">
      {/* Cabeçalho com progresso se estiver em modo step */}
      {showStepProgress && (
        <div className="px-6 pt-6 pb-4 border-b border-border/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {stepTitles[currentStep]} 
                <Badge variant="secondary" className="ml-3">
                  Etapa {currentStep + 1} de {totalSteps}
                </Badge>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Complete todas as etapas para publicar sua solução
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Abas navegáveis integradas ao design */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-border/20 bg-muted/20">
          <TabsList className="w-full h-auto p-0 bg-transparent grid grid-cols-6 rounded-none">
            {tabItems.map((tab, index) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                disabled={tab.disabled}
                className="
                  relative px-4 py-4 rounded-none border-r border-border/20 last:border-r-0
                  data-[state=active]:bg-background data-[state=active]:text-foreground 
                  data-[state=active]:shadow-sm data-[state=active]:border-b-2 
                  data-[state=active]:border-b-primary data-[state=active]:border-t-0
                  data-[state=active]:border-l-0 data-[state=active]:border-r-0
                  text-muted-foreground hover:text-foreground hover:bg-background/50
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-200 font-medium text-sm
                "
              >
                {tab.label}
                {/* Indicador de aba completada */}
                {solution?.id && tab.value !== 'basic' && !tab.disabled && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-operational rounded-full" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Conteúdo da aba */}
        <div className="p-6">
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
