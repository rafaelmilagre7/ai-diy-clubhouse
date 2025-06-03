
import { useState, useEffect, useCallback } from "react";
import { useProgress } from "./useProgress";
import { toast } from "sonner";
import { PersonalInfoData } from "@/types/onboarding";
import { validatePersonalInfoForm } from "@/utils/validatePersonalInfoForm";
import { useAuth } from "@/contexts/auth";

export const usePersonalInfoStep = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const { progress, updateProgress, refreshProgress } = useProgress();
  const { user, profile } = useAuth();
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
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Função para carregar dados iniciais do banco
  const loadInitialData = useCallback(() => {
    const userName = profile?.name || user?.user_metadata?.name || "";
    const userEmail = profile?.email || user?.email || "";

    if (progress?.personal_info) {
      let ddi = progress.personal_info.ddi || "+55";
      if (ddi) {
        ddi = "+" + ddi.replace(/\+/g, '').replace(/\D/g, '');
      }
      setFormData({
        name: userName || progress.personal_info.name || "",
        email: userEmail || progress.personal_info.email || "",
        phone: progress.personal_info.phone || "",
        ddi: ddi,
        linkedin: progress.personal_info.linkedin || "",
        instagram: progress.personal_info.instagram || "",
        country: progress.personal_info.country || "Brasil",
        state: progress.personal_info.state || "",
        city: progress.personal_info.city || "",
        timezone: progress.personal_info.timezone || "GMT-3"
      });
    } else {
      setFormData(prev => ({
        ...prev,
        name: userName,
        email: userEmail,
        ddi: "+55"
      }));
    }
    setInitialDataLoaded(true);
  }, [progress, profile, user]);

  // Inicializar com dados vazios se não houver progresso após 3 segundos
  useEffect(() => {
    if (!initialDataLoaded) {
      const timer = setTimeout(() => {
        if (!initialDataLoaded) {
          console.log("[DEBUG] Tempo limite atingido, inicializando com dados vazios");
          setFormData(prev => ({
            ...prev,
            name: profile?.name || user?.user_metadata?.name || "",
            email: profile?.email || user?.email || "",
            ddi: "+55"
          }));
          setInitialDataLoaded(true);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [initialDataLoaded, profile, user]);

  // Carregar dados iniciais quando o progresso for carregado
  useEffect(() => {
    if (progress && !initialDataLoaded) {
      loadInitialData();
    }
  }, [progress, initialDataLoaded, loadInitialData]);

  const handleChange = (field: keyof PersonalInfoData, value: string) => {
    console.log(`Campo alterado: ${field}, Valor: ${value}`);
    
    if (field === 'ddi') {
      value = "+" + value.replace(/\+/g, '').replace(/\D/g, '');
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return false;

    setValidationAttempted(true);
    const validationErrors = validatePersonalInfoForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      const errorFields = Object.keys(validationErrors).map(field => 
        field.charAt(0).toUpperCase() + field.slice(1)
      ).join(', ');
      
      toast.error("Por favor, corrija os erros no formulário", {
        description: `Verifique os campos: ${errorFields}`
      });
      
      return false;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
      };
      
      if (dataToSubmit.ddi) {
        dataToSubmit.ddi = "+" + dataToSubmit.ddi.replace(/\+/g, '').replace(/\D/g, '');
      }
      
      console.log("[DEBUG] Submetendo dados formatados:", dataToSubmit);
      
      const currentCompletedSteps = Array.isArray(progress?.completed_steps) 
        ? progress.completed_steps 
        : [];
        
      const newCompletedSteps = currentCompletedSteps.includes("personal_info")
        ? currentCompletedSteps
        : [...currentCompletedSteps, "personal_info"];
      
      await updateProgress({
        personal_info: dataToSubmit,
        current_step: "ai_experience",
        completed_steps: newCompletedSteps,
      });

      toast.success("Dados pessoais salvos com sucesso!", {
        description: "Avançando para a próxima etapa..."
      });
      
      return true;
    } catch (error) {
      console.error("[ERRO] Erro ao salvar dados:", error);
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
    validationAttempted,
    progress,
    handleChange,
    handleSubmit,
    loadInitialData
  };
};
