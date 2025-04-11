
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useModulesForm } from "./useModulesForm";
import ModuleEditor from "./ModuleEditor";
import ModulesList from "./ModulesList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ModuleGuide from "./ModuleGuide";
import { MODULE_TYPE_MAPPING } from "./moduleConstants";
import { ModuleProvider } from "./ModuleContext";
import ModuleEmptyState from "./ModuleEmptyState";
import ModuleCreationPanel from "./ModuleCreationPanel";

interface ModulesFormProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
  currentModuleStep?: number;
}

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

  // State to control the module type selector
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // State for tracking which module is being edited based on currentModuleStep
  useEffect(() => {
    if (currentModuleStep >= 0 && currentModuleStep < MODULE_TYPE_MAPPING.length) {
      const moduleType = MODULE_TYPE_MAPPING[currentModuleStep];
      const moduleIndex = modules.findIndex(m => m.type === moduleType);
      
      if (moduleIndex >= 0) {
        handleEditModule(moduleIndex);
      } else if (modules.length > 0 && solutionId) {
        handleCreateDefaultModules([moduleType]);
      }
    } else if (currentModuleStep === -1 && isEditing) {
      handleBackToList();
    }
  }, [currentModuleStep, modules, solutionId, handleEditModule, handleBackToList, handleCreateDefaultModules, isEditing]);

  // Create context value
  const contextValue = {
    modules,
    solutionId,
    isLoading,
    selectedModuleIndex,
    isEditing,
    handleEditModule,
    handlePreviewImplementation,
    handleBackToList,
    handleModuleSave,
    handleCreateDefaultModules
  };

  return (
    <ModuleProvider value={contextValue}>
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="p-6">
            {showTypeSelector ? (
              <ModuleCreationPanel />
            ) : isEditing && selectedModuleIndex !== null && modules.length > 0 ? (
              <RenderModuleEditor 
                modules={modules} 
                selectedModuleIndex={selectedModuleIndex} 
                handleBackToList={handleBackToList}
                handleModuleSave={handleModuleSave}
              />
            ) : (
              <RenderModulesList
                solutionId={solutionId}
                modules={modules}
                onSave={onSave}
                saving={saving}
                isLoading={isLoading}
                handleEditModule={handleEditModule}
                handlePreviewImplementation={handlePreviewImplementation}
                currentModuleStep={currentModuleStep}
                onCreateModule={() => setShowTypeSelector(true)}
                handleCreateDefaultModules={handleCreateDefaultModules}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ModuleProvider>
  );
};

// Helper component to render module editor
const RenderModuleEditor = ({ 
  modules, 
  selectedModuleIndex, 
  handleBackToList, 
  handleModuleSave 
}) => {
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
};

// Helper component to render modules list
const RenderModulesList = ({ 
  solutionId, 
  modules, 
  onSave, 
  saving,
  isLoading,
  handleEditModule,
  handlePreviewImplementation,
  currentModuleStep,
  onCreateModule
}) => {
  return (
    <div>
      {modules.length > 0 ? (
        <ModulesList 
          modules={modules}
          onEditModule={handleEditModule}
          onPreview={handlePreviewImplementation}
          isLoading={isLoading}
        />
      ) : (
        <ModuleEmptyState 
          solutionId={solutionId}
          onSave={onSave}
          saving={saving}
          onCreateModule={onCreateModule}
          currentModuleStep={currentModuleStep}
        />
      )}
    </div>
  );
};

export default ModulesForm;
