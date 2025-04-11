
import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FileText, Layers, Link, Eye, CheckCircle2 } from "lucide-react";
import BasicInfoForm, { SolutionFormValues } from "@/components/admin/solution/BasicInfoForm";
import ModulesForm from "@/components/admin/solution/ModulesForm";
import ResourcesForm from "@/components/admin/solution/ResourcesForm";
import { Solution } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { moduleTypes } from "@/components/admin/solution/moduleTypes";

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
  // Função para mostrar o título da etapa atual baseado no currentStep
  const getTabTitle = () => {
    const titles = [
      "Etapa 1: Configuração Básica",
      "Etapa 2: Landing da Solução",
      "Etapa 3: Visão Geral e Case",
      "Etapa 4: Preparação Express",
      "Etapa 5: Implementação Passo a Passo",
      "Etapa 6: Verificação de Implementação",
      "Etapa 7: Primeiros Resultados",
      "Etapa 8: Otimização Rápida",
      "Etapa 9: Celebração e Próximos Passos",
      "Etapa 10: Revisão e Publicação"
    ];
    
    return titles[currentStep] || "Configuração da Solução";
  };

  const currentModuleType = currentStep > 0 && currentStep < 9 
    ? moduleTypes[currentStep - 1].type 
    : null;

  const isValid = solution && solution.id;
  const needsBasicInfo = currentStep === 0 || !isValid;
  const needsModules = currentStep > 0 && currentStep < 9 && isValid;
  const needsReview = currentStep === 9 && isValid;
  
  // Renderiza apenas o conteúdo apropriado para a etapa atual
  const renderContent = () => {
    if (needsBasicInfo) {
      return (
        <BasicInfoForm 
          defaultValues={currentValues} 
          onSubmit={onSubmit} 
          saving={saving} 
        />
      );
    }
    
    if (needsModules) {
      return (
        <ModulesForm 
          solutionId={solution?.id || null} 
          onSave={() => onSubmit(currentValues)} 
          saving={saving}
          currentModuleStep={currentStep - 1} // Ajusta para índice baseado em 0 para módulos
        />
      );
    }
    
    if (needsReview) {
      return (
        <ResourcesForm 
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
      <div className="px-6 pt-4 pb-2 border-b">
        <h2 className="text-xl font-semibold text-[#0ABAB5]">{getTabTitle()}</h2>
        {currentModuleType && (
          <p className="text-sm text-muted-foreground mt-1">
            Configurando o módulo de {moduleTypes.find(m => m.type === currentModuleType)?.title || ''}
          </p>
        )}
      </div>
      
      {shouldShowTabs ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-3 w-full sm:w-[400px] bg-muted/50 mx-6">
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
          <Card className="bg-gray-50">
            <CardContent className="p-4 flex items-center gap-3">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium mb-1">Dica de Implementação</p>
                <p className="text-sm text-muted-foreground">
                  {currentStep === 1 && "Neste módulo, destaque os benefícios principais e o valor que o membro obterá ao implementar esta solução."}
                  {currentStep === 2 && "Inclua um vídeo demonstrativo e casos reais de sucesso para inspirar os membros."}
                  {currentStep === 3 && "Liste todos os pré-requisitos e ferramentas que serão necessárias para implementação."}
                  {currentStep === 4 && "Divida o processo em passos claros e concisos, com screenshots ou vídeos."}
                  {currentStep === 5 && "Forneça uma lista de verificação para garantir que a implementação foi bem-sucedida."}
                  {currentStep === 6 && "Ajude os membros a medir e comunicar os resultados obtidos com a solução."}
                  {currentStep === 7 && "Ofereça dicas de como otimizar ainda mais a solução após a implementação inicial."}
                  {currentStep === 8 && "Reconheça a conquista e sugira próximos passos para continuar evoluindo."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SolutionEditorTabs;
