
import { useState, useEffect } from "react";
import { useProgress } from "./useProgress";
import { toast } from "sonner";

export const useProfessionalDataStep = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, updateProgress } = useProgress();

  useEffect(() => {
    if (progress?.professional_info) {
      setFormData(progress.professional_info);
    }
  }, [progress]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const currentCompletedSteps = Array.isArray(progress?.completed_steps) 
        ? progress.completed_steps 
        : [];
        
      const newCompletedSteps = currentCompletedSteps.includes("professional_info")
        ? currentCompletedSteps
        : [...currentCompletedSteps, "professional_info"];

      await updateProgress({
        professional_info: formData,
        current_step: "business_context",
        completed_steps: newCompletedSteps,
      });

      toast.success("Dados profissionais salvos com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar dados.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    progress
  };
};
