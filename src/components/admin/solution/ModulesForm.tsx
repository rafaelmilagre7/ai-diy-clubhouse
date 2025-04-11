
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { useModulesForm } from "./useModulesForm";
import ModuleEditor from "./ModuleEditor";
import ModuleNavigation from "./ModuleNavigation";
import ModulesList from "./ModulesList";
import NoSolutionPrompt from "./NoSolutionPrompt";
import { Button } from "@/components/ui/button";
import ModuleTypeSelector from "./ModuleTypeSelector";

interface ModulesFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ModulesForm = ({ solutionId, onSave, saving }: ModulesFormProps) => {
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
    return (
      <div className="flex flex-col gap-6">
        <ModuleNavigation 
          selectedModuleIndex={selectedModuleIndex}
          totalModules={modules.length}
          onNavigate={handleNavigateModule}
          onBackToList={handleBackToList}
        />
        
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
                <Button onClick={handleConfirmModuleCreation}>
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
                        className="mt-4"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Módulo
                      </Button>
                    )}
                    
                    {modules.length === 0 && !isLoading && (
                      <Button 
                        onClick={() => handleCreateDefaultModules()} 
                        className="mt-4"
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
