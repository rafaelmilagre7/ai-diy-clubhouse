
import { useState, useEffect } from "react";
import { useProgress } from "./useProgress";
import { toast } from "sonner";

export const useAIExperienceStep = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, updateProgress } = useProgress();

  useEffect(() => {
    if (progress?.ai_experience) {
      setFormData(progress.ai_experience);
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
        
      const newCompletedSteps = currentCompletedSteps.includes("ai_experience")
        ? currentCompletedSteps
        : [...currentCompletedSteps, "ai_experience"];

      await updateProgress({
        ai_experience: formData,
        current_step: "business_goals",
        completed_steps: newCompletedSteps,
      });

      toast.success("Experiência com IA salva com sucesso!");
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
