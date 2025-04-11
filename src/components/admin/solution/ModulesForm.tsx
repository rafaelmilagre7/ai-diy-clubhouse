
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus, AlertTriangle } from "lucide-react";
import { useModulesForm } from "./useModulesForm";
import ModuleEditor from "./ModuleEditor";
import ModuleNavigation from "./ModuleNavigation";
import ModulesList from "./ModulesList";
import NoSolutionPrompt from "./NoSolutionPrompt";
import { Button } from "@/components/ui/button";
import ModuleTypeSelector from "./ModuleTypeSelector";
import { Badge } from "@/components/ui/badge";
import ModuleGuide from "./ModuleGuide";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ModulesFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
  currentModuleStep?: number;
}

const MODULE_TYPE_MAPPING = [
  "landing",          // Etapa 2: Landing da Solução (index 0)
  "overview",         // Etapa 3: Visão Geral e Case (index 1)
  "preparation",      // Etapa 4: Preparação Express (index 2)
  "implementation",   // Etapa 5: Implementação Passo a Passo (index 3)
  "verification",     // Etapa 6: Verificação de Implementação (index 4)
  "results",          // Etapa 7: Primeiros Resultados (index 5)
  "optimization",     // Etapa 8: Otimização Rápida (index 6)
  "celebration"       // Etapa 9: Celebração e Próximos Passos (index 7)
];

const ModulesForm = ({ solutionId, onSave, saving, currentModuleStep = -1 }: ModulesFormProps) => {
  const {
    modules,
    selectedModuleIndex,
    isEditing,
    isLoading,
    handleEditModule,
    handlePreviewImplementation,
    handleBackToList,
    handleModuleSave,
    handleNavigateModule,
    handleCreateDefaultModules
  } = useModulesForm(solutionId);

  // Novo estado para controlar o seletor de tipo de módulo
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedModuleType, setSelectedModuleType] = useState("landing");

  // Estado para rastrear qual módulo está sendo editado com base no currentModuleStep
  useEffect(() => {
    if (currentModuleStep >= 0 && currentModuleStep < MODULE_TYPE_MAPPING.length) {
      const moduleType = MODULE_TYPE_MAPPING[currentModuleStep];
      const moduleIndex = modules.findIndex(m => m.type === moduleType);
      
      if (moduleIndex >= 0) {
        handleEditModule(moduleIndex);
      } else if (modules.length > 0 && solutionId) {
        // Se não encontrou o módulo mas há outros módulos, podemos criar este
        handleCreateDefaultModules([moduleType]);
      }
    } else if (currentModuleStep === -1 && isEditing) {
      // Se não há step específico e estamos editando, voltar para a lista
      handleBackToList();
    }
  }, [currentModuleStep, modules, solutionId, handleEditModule, handleBackToList, handleCreateDefaultModules, isEditing]);

  // Função para lidar com a criação de um novo módulo
  const handleCreateModule = () => {
    setShowTypeSelector(true);
  };

  // Função para criar o módulo após a seleção do tipo
  const handleConfirmModuleCreation = () => {
    handleCreateDefaultModules([selectedModuleType]);
    setShowTypeSelector(false);
  };

  // Render module editor if in editing mode
  if (isEditing && selectedModuleIndex !== null && modules.length > 0) {
    const moduleType = modules[selectedModuleIndex]?.type;
    const moduleStep = MODULE_TYPE_MAPPING.indexOf(moduleType || "");
    
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="px-3 py-1">
            Módulo {moduleStep + 2}: {modules[selectedModuleIndex]?.title}
          </Badge>
          
          <Button variant="outline" size="sm" onClick={handleBackToList}>
            Voltar para lista
          </Button>
        </div>
        
        {moduleType && (
          <div className="mb-4">
            <ModuleGuide moduleType={moduleType} />
          </div>
        )}
        
        <ModuleEditor 
          module={modules[selectedModuleIndex]} 
          onSave={handleModuleSave} 
        />
      </div>
    );
  }

  // Render modules list or no solution prompt
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="p-6">
          {showTypeSelector ? (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Selecione o tipo de módulo</h3>
              <ModuleTypeSelector 
                selectedType={selectedModuleType}
                onSelectType={setSelectedModuleType}
              />
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTypeSelector(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleConfirmModuleCreation}
                  className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
                >
                  Criar Módulo
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Módulos da Solução</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                {solutionId ? 
                  "Gerencie os módulos da sua solução abaixo ou adicione novos módulos." :
                  "Primeiramente, salve as informações básicas da solução antes de configurar os módulos detalhados."}
              </p>
              
              {currentModuleStep >= 0 && !modules.find(m => m.type === MODULE_TYPE_MAPPING[currentModuleStep]) && (
                <Alert variant="default" className="mt-4 bg-amber-50 border-amber-200 text-left">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Módulo ainda não criado</AlertTitle>
                  <AlertDescription>
                    O módulo "{MODULE_TYPE_MAPPING[currentModuleStep]}" ainda não foi criado. 
                    Clique em "Criar Estrutura Padrão" para criar todos os módulos ou crie este módulo específico.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-6">
                {solutionId ? (
                  <>
                    <ModulesList 
                      modules={modules}
                      onEditModule={handleEditModule}
                      onPreview={handlePreviewImplementation}
                      isLoading={isLoading}
                    />
                    
                    {modules.length < 8 && (
                      <Button 
                        onClick={handleCreateModule} 
                        className="mt-4 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Módulo
                      </Button>
                    )}
                    
                    {modules.length === 0 && !isLoading && (
                      <Button 
                        onClick={() => handleCreateDefaultModules()} 
                        className="mt-4 bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
                      >
                        Criar Estrutura Padrão (8 Módulos)
                      </Button>
                    )}
                  </>
                ) : (
                  <NoSolutionPrompt onSave={onSave} saving={saving} />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModulesForm;
