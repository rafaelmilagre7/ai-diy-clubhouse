
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
  const [validationAttempted, setValidationAttempted] = useState(false);
  // Flag para controlar se já carregamos os dados iniciais
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Adicionando um useEffect para forçar o refresh de dados ao iniciar
  useEffect(() => {
    console.log("Forçando atualização dos dados do progresso ao iniciar");
    refreshProgress();
  }, [refreshProgress]);

  // Carregar dados iniciais
  useEffect(() => {
    if (progress?.personal_info && !initialDataLoaded) {
      // Formatar o DDI para garantir que tenha apenas um +
      let ddi = progress.personal_info.ddi || "+55";
      if (ddi) {
        ddi = "+" + ddi.replace(/\+/g, '').replace(/\D/g, '');
      }
      
      console.log("Dados encontrados no progresso:", progress.personal_info);
      
      setFormData({
        ...formData,
        ...progress.personal_info,
        ddi: ddi,
        name: progress.personal_info.name || "",
        email: progress.personal_info.email || "",
        phone: progress.personal_info.phone || "",
        linkedin: progress.personal_info.linkedin || "",
        instagram: progress.personal_info.instagram || "",
        country: progress.personal_info.country || "Brasil",
        state: progress.personal_info.state || "",
        city: progress.personal_info.city || "",
        timezone: progress.personal_info.timezone || "GMT-3"
      });
      
      console.log("Dados carregados do progresso:", {
        ...progress.personal_info,
        ddi: ddi,
      });
      
      setInitialDataLoaded(true);
    } else if (!progress?.personal_info && !initialDataLoaded) {
      console.log("Nenhum dado de progresso encontrado para personal_info");
    }
  }, [progress?.personal_info, formData, initialDataLoaded]);

  const handleChange = (field: keyof PersonalInfoData, value: string) => {
    // Registrar a alteração para debug
    console.log(`Campo alterado: ${field}, Valor: ${value}`);
    
    // Se for o campo DDI, garantir formatação adequada
    if (field === 'ddi') {
      // Remover + adicionais e garantir apenas um no início
      value = "+" + value.replace(/\+/g, '').replace(/\D/g, '');
    }
    
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
    if (isSubmitting) return false;

    setValidationAttempted(true);
    const validationErrors = validatePersonalInfoForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Mostrar toast com os erros
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
      // Formatação do DDI antes de salvar
      const dataToSubmit = {
        ...formData,
      };
      
      // Garantir que o DDI está formatado corretamente
      if (dataToSubmit.ddi) {
        dataToSubmit.ddi = "+" + dataToSubmit.ddi.replace(/\+/g, '').replace(/\D/g, '');
      }
      
      console.log("Submetendo dados formatados:", dataToSubmit);
      
      await updateProgress({
        personal_info: dataToSubmit,
        current_step: "professional_data",
        completed_steps: [...(progress?.completed_steps || []), "personal"],
      });

      // Única notificação de sucesso com informação combinada
      toast.success("Dados pessoais salvos com sucesso!", {
        description: "Avançando para a próxima etapa..."
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
    validationAttempted,
    handleChange,
    handleSubmit
  };
};
