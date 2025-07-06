
import React, { useState } from "react";
import ModuleTypeSelector from "./ModuleTypeSelector";
import { Button } from "@/components/ui/button";
import { useModuleContext } from "./ModuleContext";

const ModuleCreationPanel: React.FC = () => {
  const [selectedModuleType, setSelectedModuleType] = useState("landing");
  const { handleCreateDefaultModules } = useModuleContext();

  const handleConfirmModuleCreation = () => {
    handleCreateDefaultModules([selectedModuleType]);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Selecione o tipo de módulo</h3>
      <ModuleTypeSelector 
        selectedType={selectedModuleType}
        onSelectType={setSelectedModuleType}
      />
      <div className="flex justify-end space-x-2 mt-4">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleConfirmModuleCreation}
          className="bg-primary hover:bg-primary/90"
        >
          Criar Módulo
        </Button>
      </div>
    </div>
  );
};

export default ModuleCreationPanel;
