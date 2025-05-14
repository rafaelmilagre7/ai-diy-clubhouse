
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
  
  // Valores padrão para formulário
  const defaultFormData = {
    name: profile?.name || user?.user_metadata?.name || "",
    email: profile?.email || user?.email || "",
    phone: "",
    ddi: "+55",
    linkedin: "",
    instagram: "",
    country: "Brasil",
    state: "",
    city: "",
    timezone: "America/Sao_Paulo", // Define o valor padrão como Brasília
  };
  
  const [formData, setFormData] = useState<PersonalInfoData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Função para carregar dados iniciais do banco
  const loadInitialData = useCallback(() => {
    console.log("[usePersonalInfoStep] Carregando dados iniciais");
    
    // Garantir que sempre carrega só do personal_info
    const userName = profile?.name || user?.user_metadata?.name || "";
    const userEmail = profile?.email || user?.email || "";

    if (progress?.personal_info) {
      console.log("[usePersonalInfoStep] Dados encontrados:", progress.personal_info);
      
      // Garantir que o DDI esteja formatado corretamente
      let ddi = progress.personal_info.ddi || "+55";
      if (ddi && !ddi.startsWith('+')) {
        ddi = "+" + ddi.replace(/\D/g, '');
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
        // Garantir que o timezone esteja definido
        timezone: progress.personal_info.timezone || "America/Sao_Paulo"
      });
    } else {
      console.log("[usePersonalInfoStep] Nenhum dado encontrado, usando valores padrão");
      setFormData(defaultFormData);
    }
    setInitialDataLoaded(true);
  }, [progress, profile, user, defaultFormData]);

  // Inicializar com dados padrão se não houver progresso
  useEffect(() => {
    if (!initialDataLoaded) {
      loadInitialData();
      
      // Safety timeout para garantir que temos dados mesmo sem resposta do servidor
      const timer = setTimeout(() => {
        if (!initialDataLoaded) {
          console.log("[DEBUG] Tempo limite atingido, inicializando com dados padrão");
          setFormData(defaultFormData);
          setInitialDataLoaded(true);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [initialDataLoaded, loadInitialData, defaultFormData]);

  const handleChange = (field: keyof PersonalInfoData, value: string) => {
    // Registrar a alteração para debug
    console.log(`[usePersonalInfoStep] Campo alterado: ${field}, Valor: ${value}`);
    
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
    setIsSaving(true);
    
    try {
      // Formatação do DDI antes de salvar
      const dataToSubmit = {
        ...formData,
      };
      
      // Garantir que o DDI está formatado corretamente
      if (dataToSubmit.ddi) {
        dataToSubmit.ddi = "+" + dataToSubmit.ddi.replace(/\+/g, '').replace(/\D/g, '');
      }
      
      // Garantir que o timezone está definido
      if (!dataToSubmit.timezone) {
        dataToSubmit.timezone = "America/Sao_Paulo";
      }
      
      console.log("[DEBUG] Submetendo dados formatados:", dataToSubmit);
      
      // Garantir que temos um progresso.completed_steps válido
      const currentCompletedSteps = Array.isArray(progress?.completed_steps) 
        ? progress.completed_steps 
        : [];
        
      // Verificar se "personal" já existe nos completed_steps
      const newCompletedSteps = currentCompletedSteps.includes("personal")
        ? currentCompletedSteps
        : [...currentCompletedSteps, "personal"];
      
      const result = await updateProgress({
        personal_info: dataToSubmit,
        current_step: "professional_data",
        completed_steps: newCompletedSteps,
      });

      if (result?.error) {
        // Se houver erro do servidor mas conseguimos atualizar localmente (modo offline)
        if (result.offline) {
          toast.warning("Dados salvos localmente. Sincronização com o servidor ocorrerá automaticamente quando houver conexão.");
          
          // Registrar quando salvou
          setLastSaveTime(Date.now());
          
          return true; // Permitir continuar mesmo com erro de servidor
        }
        
        throw new Error(result.error.message);
      }

      // Única notificação de sucesso com informação combinada
      toast.success("Dados pessoais salvos com sucesso!", {
        description: "Avançando para a próxima etapa..."
      });
      
      // Registrar quando salvou
      setLastSaveTime(Date.now());
      
      return true;
    } catch (error) {
      console.error("[ERRO] Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
      setIsSaving(false);
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
