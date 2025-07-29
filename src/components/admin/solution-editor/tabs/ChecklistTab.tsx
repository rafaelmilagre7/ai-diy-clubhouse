
import React from "react";
import UnifiedImplementationChecklist from "@/components/admin/solution/form/UnifiedImplementationChecklist";

interface ChecklistTabProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({
  solutionId,
  onSave,
  saving,
}) => {
  return (
    <UnifiedImplementationChecklist 
      solutionId={solutionId} 
      onSave={onSave} 
      saving={saving} 
    />
  );
};

export default ChecklistTab;
