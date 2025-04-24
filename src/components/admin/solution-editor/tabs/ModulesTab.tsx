
import React from "react";
import ModulesForm from "@/components/admin/solution/ModulesForm";
import { moduleTypes } from "@/components/admin/solution/moduleTypes";

interface ModulesTabProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
  currentModuleStep: number;
}

const ModulesTab: React.FC<ModulesTabProps> = ({
  solutionId,
  onSave,
  saving,
  currentModuleStep,
}) => {
  return (
    <ModulesForm 
      solutionId={solutionId} 
      onSave={onSave} 
      saving={saving}
      currentModuleStep={currentModuleStep - 1} // Adjust for 0-based index for modules
    />
  );
};

export default ModulesTab;
