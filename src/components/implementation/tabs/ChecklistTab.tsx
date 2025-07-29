import React from "react";
import UnifiedChecklistTab from "@/components/unified-checklist/UnifiedChecklistTab";

interface ChecklistTabProps {
  solutionId: string;
  onComplete: () => void;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({ solutionId, onComplete }) => {
  return (
    <UnifiedChecklistTab 
      solutionId={solutionId}
      checklistType="implementation"
      onComplete={onComplete}
    />
  );
};

export default ChecklistTab;