
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ModulesForm from "@/components/admin/solution/ModulesForm";

interface ModulesTabProps {
  solutionId: string;
  onSave: () => Promise<void>;
  saving: boolean;
  currentModuleStep: number;
}

const ModulesTab: React.FC<ModulesTabProps> = ({ 
  solutionId, 
  onSave, 
  saving,
  currentModuleStep
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <ModulesForm 
          solutionId={solutionId}
          onSave={onSave}
          saving={saving}
          currentModuleStep={currentModuleStep}
        />
      </CardContent>
    </Card>
  );
};

export default ModulesTab;
