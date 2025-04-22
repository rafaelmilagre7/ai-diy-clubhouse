
import { useState, useEffect, useCallback } from "react";
import { useProgress } from "./useProgress";
import { toast } from "sonner";
import { PersonalInfoData } from "@/types/onboarding";
import { validatePersonalInfoForm } from "@/utils/validatePersonalInfoForm";
import { useAuth } from "@/contexts/auth";
import { savePersonalInfoData } from "./persistence/services/personalInfoService";
import { markStepAsCompleted } from "./persistence/services/progressService";
import { useLogging } from "@/hooks/useLogging";

export const usePersonalInfoStep = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const { progress, updateProgress, refreshProgress } = useProgress();
  const { user, profile } = useAuth();
  const { logError } = useLogging();
  
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
    // Garantir que sempre carrega só do personal_info
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
        email: userEmail
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
            email: profile?.email || user?.email || ""
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
      if (!progress?.id || !user?.id) {
        throw new Error("Dados de progresso ou usuário não disponíveis");
      }
      
      // 1. Salvar dados na tabela dedicada
      const saveResult = await savePersonalInfoData(
        progress.id, 
        user.id, 
        formData,
        logError
      );
      
      if (!saveResult.success) {
        throw new Error("Falha ao salvar dados pessoais");
      }
      
      // 2. Marcar etapa como concluída e atualizar progresso
      const updateResult = await markStepAsCompleted(
        progress.id,
        "personal",
        "professional_data",
        logError
      );
      
      if (!updateResult.success) {
        console.warn("Aviso: Dados salvos, mas falha ao atualizar status do progresso");
      }

      // 3. Atualizar dados locais
      await refreshProgress();
      
      // Única notificação de sucesso com informação combinada
      toast.success("Dados pessoais salvos com sucesso!", {
        description: "Avançando para a próxima etapa..."
      });
      
      return true;
    } catch (error) {
      console.error("[ERRO] Erro ao salvar dados:", error);
      logError("personal_info_submit_error", {
        error: error instanceof Error ? error.message : String(error)
      });
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
    handleSubmit,
    loadInitialData
  };
};
