
import { useState, useEffect } from "react";
import { useProgress } from "./useProgress";
import { toast } from "sonner";

export const useCustomizationStep = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, updateProgress } = useProgress();

  useEffect(() => {
    if (progress?.experience_personalization) {
      setFormData(progress.experience_personalization);
    }
  }, [progress]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const currentCompletedSteps = Array.isArray(progress?.completed_steps) 
        ? progress.completed_steps 
        : [];
        
      const newCompletedSteps = currentCompletedSteps.includes("experience_personalization")
        ? currentCompletedSteps
        : [...currentCompletedSteps, "experience_personalization"];

      await updateProgress({
        experience_personalization: formData,
        current_step: "complementary_info",
        completed_steps: newCompletedSteps,
      });

      toast.success("Personalização salva com sucesso!");
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
