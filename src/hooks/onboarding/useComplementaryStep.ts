
import { useState, useEffect } from "react";
import { useProgress } from "./useProgress";
import { toast } from "sonner";

export const useComplementaryStep = () => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, updateProgress } = useProgress();

  useEffect(() => {
    if (progress?.complementary_info) {
      setFormData(progress.complementary_info);
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
        
      const newCompletedSteps = currentCompletedSteps.includes("complementary_info")
        ? currentCompletedSteps
        : [...currentCompletedSteps, "complementary_info"];

      await updateProgress({
        complementary_info: formData,
        current_step: "review",
        completed_steps: newCompletedSteps,
      });

      toast.success("Informações complementares salvas com sucesso!");
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
