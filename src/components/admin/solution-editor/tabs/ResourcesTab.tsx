
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ResourcesForm from "@/components/admin/solution/ResourcesForm";

interface ResourcesTabProps {
  solutionId: string;
  onSave: () => Promise<void>;
  saving: boolean;
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({ solutionId, onSave, saving }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <ResourcesForm 
          solutionId={solutionId}
          onSave={onSave}
          saving={saving}
        />
      </CardContent>
    </Card>
  );
};

export default ResourcesTab;
