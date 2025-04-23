
import React from "react";
import ImplementationChecklist from "@/components/admin/solution/form/ImplementationChecklist";

interface ChecklistFormProps {
  solutionId: string;
  onSave: () => Promise<void>;
  saving: boolean;
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({ solutionId, onSave, saving }) => {
  return (
    <ImplementationChecklist
      solutionId={solutionId}
      onSave={onSave}
      saving={saving}
    />
  );
};

export default ChecklistForm;
