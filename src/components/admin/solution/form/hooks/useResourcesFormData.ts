
import { useState } from "react";
import { useResourcesForm } from "./useResourcesForm";
import { useSaveResources } from "./useSaveResources";

export function useResourcesFormData(solutionId: string | null) {
  const {
    form,
    modules,
    error: formError,
    isLoading,
    isSaving: formIsSaving,
    setError,
    setIsSaving
  } = useResourcesForm(solutionId);
  
  const {
    saveResources,
    isSaving: saveIsSaving,
    error: saveError
  } = useSaveResources();

  // Calculate combined state
  const error = formError || saveError;
  const isSaving = formIsSaving || saveIsSaving;

  // Function to save all resources
  const handleSaveResources = async () => {
    setIsSaving(true);
    const values = form.getValues();
    const success = await saveResources(solutionId, values);
    setIsSaving(false);
    return success;
  };

  return {
    form,
    modules,
    error,
    isLoading,
    isSaving,
    setError,
    handleSaveResources
  };
}

// For backward compatibility, re-export from the original file
export { TEMPLATES } from "../utils/resourceTemplates";
export type { ResourceFormValues } from "../utils/resourceFormSchema";
