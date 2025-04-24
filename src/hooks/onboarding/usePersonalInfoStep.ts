
import { usePersonalInfoFormState } from "./usePersonalInfoFormState";
import { usePersonalInfoFormSubmit } from "./usePersonalInfoFormSubmit";
import { useLogging } from "@/hooks/useLogging";
import { useProgress } from "./useProgress";
import { toast } from "sonner";

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
    console.log("handleSubmit chamado no usePersonalInfoStep");
    
    if (isSubmitting) {
      console.log("Já está em processo de submissão, ignorando");
      return false;
    }
    
    try {
      toast.info("Processando formulário...");
      const success = await submit({
        progress,
        user,
        formData,
        setValidationAttempted,
        setErrors,
        setIsSubmitting,
        logError,
        refreshProgress
      });
      
      return success;
    } catch (error) {
      console.error("Erro ao processar formulário:", error);
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
      return false;
    }
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
