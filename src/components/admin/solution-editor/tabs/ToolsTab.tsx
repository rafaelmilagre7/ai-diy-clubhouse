
import React from "react";
import ToolsChecklistForm from "@/components/admin/solution/form/ToolsChecklistForm";

interface ToolsTabProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ToolsTab: React.FC<ToolsTabProps> = ({
  solutionId,
  onSave,
  saving,
}) => {
  console.log("🔧 ToolsTab: Renderizando com solutionId =", solutionId);
  
  return (
    <ToolsChecklistForm 
      solutionId={solutionId} 
      onSave={onSave} 
      saving={saving} 
    />
  );
};

export default ToolsTab;
