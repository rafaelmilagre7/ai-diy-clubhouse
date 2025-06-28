
import { useState } from "react";
import { useResourcesForm } from "./useResourcesForm";

export function useResourcesFormData(solutionId: string | null) {
  const {
    resources,
    loading,
    error,
    addResource,
    updateResource,
    removeResource,
    saveResources,
    loadResources,
    setResources
  } = useResourcesForm(solutionId);
  
  const [isSaving, setIsSaving] = useState(false);

  // Function to save all resources
  const handleSaveResources = async () => {
    setIsSaving(true);
    const success = await saveResources();
    setIsSaving(false);
    return success;
  };

  return {
    resources,
    loading,
    error,
    isSaving,
    addResource,
    updateResource,
    removeResource,
    handleSaveResources,
    loadResources,
    setResources
  };
}

// For backward compatibility, re-export from the original file
export { TEMPLATES } from "../utils/resourceTemplates";
export type { ResourceFormValues } from "../utils/resourceFormSchema";
