
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useModulesForm } from "./useModulesForm";
import ModuleEditor from "./ModuleEditor";
import ModuleNavigation from "./ModuleNavigation";
import ModulesList from "./ModulesList";
import NoSolutionPrompt from "./NoSolutionPrompt";

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
    handleNavigateModule
  } = useModulesForm(solutionId);

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
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold">Módulos da Solução</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Primeiramente, salve as informações básicas da solução antes de configurar os módulos detalhados.
            </p>
            <div className="mt-6">
              {solutionId ? (
                <ModulesList 
                  modules={modules}
                  onEditModule={handleEditModule}
                  onPreview={handlePreviewImplementation}
                  isLoading={isLoading}
                />
              ) : (
                <NoSolutionPrompt onSave={onSave} saving={saving} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModulesForm;
