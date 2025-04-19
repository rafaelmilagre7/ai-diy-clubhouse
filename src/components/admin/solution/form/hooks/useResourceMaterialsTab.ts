
import { UseFormReturn } from "react-hook-form";
import { ResourceFormValues } from "./useResourcesFormData";
import { useMaterialsState } from "./useMaterialsState";
import { useMaterialsOperations } from "./useMaterialsOperations";

export const useResourceMaterialsTab = (
  form: UseFormReturn<ResourceFormValues>,
  solutionId: string | null
) => {
  const {
    materials,
    setMaterials,
    loading,
  } = useMaterialsState(solutionId);

  const {
    savingResources,
    setSavingResources,
    handleUploadComplete,
    handleRemoveResource
  } = useMaterialsOperations(solutionId, setMaterials);

  return {
    materials,
    loading,
    savingResources,
    setSavingResources,
    handleUploadComplete,
    handleRemoveResource
  };
};
