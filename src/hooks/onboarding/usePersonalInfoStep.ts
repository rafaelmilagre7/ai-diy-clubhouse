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
    name: profile?.name || user?.user_metadata?.name || "",
    email: profile?.email || user?.email || "",
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
    if (!initialDataLoaded) {
      console.log("Carregando dados iniciais do usuário:", { profile, user });
      
      const userName = profile?.name || user?.user_metadata?.name || "";
      const userEmail = profile?.email || user?.email || "";

      if (progress?.personal_info) {
        console.log("Dados do progresso encontrados:", progress.personal_info);
        
        setFormData(prevData => ({
          ...prevData,
          ...progress.personal_info,
          name: userName || progress.personal_info.name || "",
          email: userEmail || progress.personal_info.email || "",
          ddi: progress.personal_info.ddi || "+55",
        }));
      } else {
        console.log("Nenhum dado de progresso encontrado, usando dados do usuário");
        setFormData(prevData => ({
          ...prevData,
          name: userName,
          email: userEmail,
        }));
      }
      
      setInitialDataLoaded(true);
    }
  }, [progress, profile, user, initialDataLoaded]);

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
      // Formatação do DDI antes de salvar
      const dataToSubmit = {
        ...formData,
      };
      
      // Garantir que o DDI está formatado corretamente
      if (dataToSubmit.ddi) {
        dataToSubmit.ddi = "+" + dataToSubmit.ddi.replace(/\+/g, '').replace(/\D/g, '');
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
      
      await updateProgress({
        personal_info: dataToSubmit,
        current_step: "professional_data",
        completed_steps: newCompletedSteps,
      });

      // Única notificação de sucesso com informação combinada
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
    handleChange,
    handleSubmit,
    loadInitialData
  };
};
