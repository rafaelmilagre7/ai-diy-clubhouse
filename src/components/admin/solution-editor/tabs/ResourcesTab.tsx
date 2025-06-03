
import React from "react";
import ResourcesForm from "@/components/admin/solution/ResourcesForm";

interface ResourcesTabProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({
  solutionId,
  onSave,
  saving,
}) => {
  return (
    <ResourcesForm 
      solutionId={solutionId} 
      onSave={onSave} 
      saving={saving} 
    />
  );
};

export default ResourcesTab;
