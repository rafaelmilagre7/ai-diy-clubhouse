
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FileText, Layers, Link } from "lucide-react";
import BasicInfoForm, { SolutionFormValues } from "@/components/admin/solution/BasicInfoForm";
import ModulesForm from "@/components/admin/solution/ModulesForm";
import ResourcesForm from "@/components/admin/solution/ResourcesForm";
import { Solution } from "@/lib/supabase";

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
  const getTabTitle = () => {
    switch (currentStep) {
      case 0:
        return "Etapa 1: Configuração Básica";
      case 1:
        return "Etapa 2: Landing da Solução";
      case 2:
        return "Etapa 3: Visão Geral e Case";
      case 3:
        return "Etapa 4: Preparação Express";
      case 4:
        return "Etapa 5: Implementação Passo a Passo";
      case 5:
        return "Etapa 6: Verificação de Implementação";
      case 6:
        return "Etapa 7: Primeiros Resultados";
      case 7:
        return "Etapa 8: Otimização Rápida";
      case 8:
        return "Etapa 9: Celebração e Próximos Passos";
      case 9:
        return "Etapa 10: Revisão e Publicação";
      default:
        return "Configuração da Solução";
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <div className="px-6 pt-4 pb-2 border-b">
        <h2 className="text-xl font-semibold">{getTabTitle()}</h2>
      </div>
      
      <TabsList className="grid grid-cols-3 w-full sm:w-[400px] bg-muted/50 mx-6 mt-4">
        <TabsTrigger value="basic" className="flex items-center gap-1.5">
          <FileText className="h-4 w-4" />
          <span>Informações</span>
        </TabsTrigger>
        <TabsTrigger value="modules" className="flex items-center gap-1.5">
          <Layers className="h-4 w-4" />
          <span>Módulos</span>
        </TabsTrigger>
        <TabsTrigger value="resources" className="flex items-center gap-1.5">
          <Link className="h-4 w-4" />
          <span>Recursos</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-6 mt-6 px-6 pb-6">
        <BasicInfoForm 
          defaultValues={currentValues} 
          onSubmit={onSubmit} 
          saving={saving} 
        />
      </TabsContent>
      
      <TabsContent value="modules" className="space-y-6 mt-6 px-6 pb-6">
        <ModulesForm 
          solutionId={solution?.id || null} 
          onSave={() => onSubmit(currentValues)} 
          saving={saving}
          currentModuleStep={currentStep - 1} // Adjust to 0-based index for modules
        />
      </TabsContent>
      
      <TabsContent value="resources" className="space-y-6 mt-6 px-6 pb-6">
        <ResourcesForm 
          solutionId={solution?.id || null} 
          onSave={() => onSubmit(currentValues)} 
          saving={saving} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default SolutionEditorTabs;
