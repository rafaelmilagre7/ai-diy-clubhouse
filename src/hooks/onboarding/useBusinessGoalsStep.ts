
import { useState, useEffect } from "react";
import { useProgress } from "./useProgress";
import { toast } from "sonner";

export const useBusinessGoalsStep = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, updateProgress } = useProgress();

  useEffect(() => {
    if (progress?.business_goals) {
      setFormData(progress.business_goals);
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
        
      const newCompletedSteps = currentCompletedSteps.includes("business_goals")
        ? currentCompletedSteps
        : [...currentCompletedSteps, "business_goals"];

      await updateProgress({
        business_goals: formData,
        current_step: "experience_personalization",
        completed_steps: newCompletedSteps,
      });

      toast.success("Objetivos salvos com sucesso!");
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
