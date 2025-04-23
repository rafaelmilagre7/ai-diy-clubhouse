
import React from "react";
import ToolsChecklistForm from "@/components/admin/solution/form/ToolsChecklistForm";

interface ToolsTabProps {
  solution: any;
  onSubmit: (values: any) => Promise<void>;
  saving?: boolean;
}

const ToolsTab: React.FC<ToolsTabProps> = ({ solution, onSubmit, saving }) => {
  // Função de adaptação para compatibilidade com a interface de ToolsChecklistForm
  const handleSave = async () => {
    await onSubmit({});
  };

  return (
    <ToolsChecklistForm
      solutionId={solution.id}
      onSave={handleSave}
      isSaving={saving}
    />
  );
};

export default ToolsTab;
