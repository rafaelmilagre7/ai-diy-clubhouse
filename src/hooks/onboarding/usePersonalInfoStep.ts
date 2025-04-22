
import { usePersonalInfoFormState } from "./usePersonalInfoFormState";
import { usePersonalInfoFormSubmit } from "./usePersonalInfoFormSubmit";
import { useLogging } from "@/hooks/useLogging";
import { useProgress } from "./useProgress";

export const usePersonalInfoStep = () => {
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    validationAttempted,
    setValidationAttempted,
    initialDataLoaded,
    setInitialDataLoaded,
    handleChange,
    loadInitialData,
    user,
    profile,
    progress,
  } = usePersonalInfoFormState();
  
  const { 
    isSubmitting, 
    setIsSubmitting, 
    isSaving, 
    lastSaveTime, 
    handleSubmit: submit 
  } = usePersonalInfoFormSubmit();
  
  const { refreshProgress } = useProgress();
  const { logError } = useLogging();

  // Log para diagnóstico
  console.log("[DEBUG] usePersonalInfoStep estados:", { isSubmitting, isSaving, lastSaveTime });

  // Composição: handleSubmit orquestra as dependências conforme esperado pela nova função
  const handleSubmit = async () => {
    return submit({
      progress,
      user,
      formData,
      setValidationAttempted,
      setErrors,
      setIsSubmitting,
    });
  };

  return {
    formData,
    errors,
    isSubmitting,
    validationAttempted,
    isSaving,
    lastSaveTime,
    handleChange,
    handleSubmit,
    loadInitialData,
  };
};
