
import { useState, useEffect } from "react";
import { useProgress } from "./useProgress";
import { toast } from "sonner";
import { PersonalInfoData } from "@/types/onboarding";
import { validatePersonalInfoForm } from "@/utils/validatePersonalInfoForm";

export const usePersonalInfoStep = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const { progress, updateProgress, refreshProgress } = useProgress();
  const [formData, setFormData] = useState<PersonalInfoData>({
    name: "",
    email: "",
    phone: "",
    ddi: "+55",
    linkedin: "",
    instagram: "",
    country: "Brasil",
    state: "",
    city: "",
    timezone: "GMT-3",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados iniciais
  useEffect(() => {
    if (progress?.personal_info) {
      setFormData({
        ...formData,
        ...progress.personal_info,
        timezone: progress.personal_info.timezone || "GMT-3"
      });
    }
  }, [progress?.personal_info]);

  // Salvamento automático após 1.5 segundos de inatividade
  useEffect(() => {
    const autoSave = async () => {
      if (!isSubmitting) {
        const validationErrors = validatePersonalInfoForm(formData);
        if (Object.keys(validationErrors).length === 0) {
          try {
            setIsSaving(true);
            await updateProgress({
              personal_info: formData,
            });
            setLastSaveTime(Date.now());
            console.log("Salvamento automático realizado");
          } catch (error) {
            console.error("Erro no salvamento automático:", error);
          } finally {
            setIsSaving(false);
          }
        }
      }
    };

    const timer = setTimeout(autoSave, 1500);
    return () => clearTimeout(timer);
  }, [formData, isSubmitting]);

  const handleChange = (field: keyof PersonalInfoData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando ele é alterado
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const validationErrors = validatePersonalInfoForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProgress({
        personal_info: formData,
        current_step: "professional_data",
        completed_steps: [...(progress?.completed_steps || []), "personal"],
      });

      return true;
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    isSaving,
    lastSaveTime,
    handleChange,
    handleSubmit
  };
};
