
import React from "react";
import ImplementationChecklist from "@/components/admin/solution/form/ImplementationChecklist";

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
    <ImplementationChecklist 
      solutionId={solutionId} 
      onSave={onSave} 
      saving={saving} 
    />
  );
};

export default ChecklistTab;
