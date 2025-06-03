
import React from "react";
import ModulesForm from "@/components/admin/solution/ModulesForm";

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
      currentModuleStep={currentModuleStep}
    />
  );
};

export default ModulesTab;
