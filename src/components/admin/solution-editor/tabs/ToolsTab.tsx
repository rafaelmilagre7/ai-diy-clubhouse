
import React from "react";
import ToolsChecklistForm from "@/components/admin/solution/form/ToolsChecklistForm";

interface ToolsTabProps {
  solutionId: string | null;
  onSave: (saveFunction: () => Promise<void>) => void;
  saving: boolean;
}

const ToolsTab: React.FC<ToolsTabProps> = ({
  solutionId,
  onSave,
  saving,
}) => {
  console.log("🔧 ToolsTab: Renderizando com solutionId =", solutionId);
  console.log("🔧 ToolsTab: onSave recebido =", !!onSave);
  
  return (
    <ToolsChecklistForm 
      solutionId={solutionId} 
      onSave={onSave} 
      saving={saving} 
    />
  );
};

export default ToolsTab;
