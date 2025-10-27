
import React from "react";
import UnifiedImplementationChecklist from "@/components/admin/solution/form/UnifiedImplementationChecklist";

interface ChecklistTabProps {
  solutionId: string;
  onSave: () => void;
  saving: boolean;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({
  solutionId,
  onSave,
  saving,
}) => {
  if (!solutionId) {
    return <div>Erro: ID da solução não fornecido</div>;
  }

  return (
    <UnifiedImplementationChecklist 
      solutionId={solutionId} 
      onSave={onSave} 
      saving={saving} 
    />
  );
};

export default ChecklistTab;
