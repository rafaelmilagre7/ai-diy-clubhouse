
import React from "react";
import ToolsChecklistForm from "@/components/admin/solution/form/ToolsChecklistForm";

interface ToolsTabProps {
  solution: any;
  onSubmit: (values: any) => Promise<void>;
  saving?: boolean;
}

const ToolsTab: React.FC<ToolsTabProps> = ({ solution, onSubmit, saving }) => {
  return (
    <ToolsChecklistForm
      solutionId={solution.id}
      onSave={onSubmit}
      isSaving={saving}
    />
  );
};

export default ToolsTab;
