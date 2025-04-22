
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
  const { isSubmitting, setIsSubmitting, handleSubmit: submit } = usePersonalInfoFormSubmit();
  const { refreshProgress } = useProgress();
  const { logError } = useLogging();

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
    handleChange,
    handleSubmit,
    loadInitialData,
  };
};
