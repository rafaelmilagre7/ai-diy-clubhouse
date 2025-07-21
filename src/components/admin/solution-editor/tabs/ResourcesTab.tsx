
import React from "react";
import ResourcesUploadForm from "@/components/admin/solution/form/ResourcesUploadForm";

interface ResourcesTabProps {
  solutionId: string | null;
  onSave: () => void;
  saving: boolean;
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({
  solutionId,
  onSave,
  saving
}) => {
  return (
    <div className="space-y-6 text-neutral-800 dark:text-white">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Materiais da Solução</h2>
        <p className="text-muted-foreground">
          Faça upload dos materiais e recursos relacionados a esta solução.
        </p>
      </div>
      
      <ResourcesUploadForm solutionId={solutionId} onSave={onSave} saving={saving} />
    </div>
  );
};

export default ResourcesTab;
