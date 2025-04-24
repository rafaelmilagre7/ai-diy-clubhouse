import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ResourceFormValues } from "../hooks/useResourcesFormData";
import { formatFileSize } from "../utils/resourceUtils";
import { useResourceMaterialsTab } from "../hooks/useResourceMaterialsTab";
import MaterialUploadSection from "./MaterialUploadSection";
import MaterialsList from "./MaterialsList";

interface ResourceMaterialsTabProps {
  form: UseFormReturn<ResourceFormValues>;
  solutionId: string | null;
}

const ResourceMaterialsTab: React.FC<ResourceMaterialsTabProps> = ({ 
  form, 
  solutionId 
}) => {
  const {
    materials,
    loading,
    handleUploadComplete,
    handleRemoveResource
  } = useResourceMaterialsTab(form, solutionId);

  return (
    <div className="space-y-6">
      <MaterialUploadSection 
        solutionId={solutionId} 
        onUploadComplete={handleUploadComplete} 
      />

      <MaterialsList 
        materials={materials} 
        loading={loading} 
        onRemove={handleRemoveResource} 
      />
      
      {/* Hidden input to keep form working */}
      <input type="hidden" {...form.register('materials')} />
    </div>
  );
};

export default ResourceMaterialsTab;
