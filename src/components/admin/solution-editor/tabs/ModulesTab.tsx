
import React from "react";
import ModulesForm from "@/components/admin/solution/ModulesForm";
import { moduleTypes } from "@/components/admin/solution/moduleTypes";

interface ModulesTabProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
  currentModuleStep?: number;
}

const ModulesTab: React.FC<ModulesTabProps> = ({
  solutionId,
  onSave,
  saving,
  currentModuleStep = 0,
}) => {
  return (
    <ModulesForm 
      solutionId={solutionId} 
      onSave={onSave} 
      saving={saving}
      currentModuleStep={currentModuleStep} // Adicionando a propriedade
    />
  );
};

export default ModulesTab;
