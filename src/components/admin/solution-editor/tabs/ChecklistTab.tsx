
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
  console.log('🎯 [ChecklistTab] MONTADO:', {
    solutionId,
    saving,
    timestamp: new Date().toISOString()
  });

  React.useEffect(() => {
    console.log('🔄 [ChecklistTab] useEffect disparado, solutionId:', solutionId);
  }, [solutionId]);

  if (!solutionId) {
    console.error('❌ [ChecklistTab] solutionId é undefined/null!');
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
