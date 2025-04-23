
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ChecklistForm from "@/components/admin/solution/ChecklistForm";

interface ChecklistTabProps {
  solutionId: string;
  onSave: () => Promise<void>;
  saving: boolean;
}

const ChecklistTab: React.FC<ChecklistTabProps> = ({ solutionId, onSave, saving }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <ChecklistForm 
          solutionId={solutionId}
          onSave={onSave}
          saving={saving}
        />
      </CardContent>
    </Card>
  );
};

export default ChecklistTab;
