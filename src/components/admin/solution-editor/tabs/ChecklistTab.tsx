
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
  // 🔍 DEBUG: Confirmar que o componente foi montado
  console.log('🎯 [ChecklistTab] Componente montado com solutionId:', solutionId);

  return (
    <UnifiedImplementationChecklist 
      solutionId={solutionId} 
      onSave={onSave} 
      saving={saving} 
    />
  );
};

export default ChecklistTab;
