
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ToolsChecklistForm from "@/components/admin/solution/form/ToolsChecklistForm";

interface ToolsTabProps {
  solutionId: string;
  onSave: () => Promise<void>;
  saving: boolean;
}

const ToolsTab: React.FC<ToolsTabProps> = ({ solutionId, onSave, saving }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <ToolsChecklistForm 
          solutionId={solutionId}
          onSave={onSave}
          saving={saving}
        />
      </CardContent>
    </Card>
  );
};

export default ToolsTab;
