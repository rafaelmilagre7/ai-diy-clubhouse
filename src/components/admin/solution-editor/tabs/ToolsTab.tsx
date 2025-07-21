
import React from "react";
import ToolsChecklistForm from "@/components/admin/solution/form/ToolsChecklistForm";

interface ToolsTabProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
  onRegisterSaveFunction?: (saveFunction: () => Promise<void>) => void;
}

const ToolsTab: React.FC<ToolsTabProps> = ({
  solutionId,
  onSave,
  saving,
  onRegisterSaveFunction
}) => {
  return (
    <ToolsChecklistForm 
      solutionId={solutionId} 
      onSave={onSave} 
      saving={saving}
      onRegisterSaveFunction={onRegisterSaveFunction}
    />
  );
};

export default ToolsTab;
