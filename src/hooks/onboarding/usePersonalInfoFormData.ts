
import { useState, useEffect, useCallback, useRef } from "react";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export function usePersonalInfoFormData() {
  const { progress, updateProgress, isLoading, refreshProgress } = useProgress();
  const { profile, user } = useAuth();
  const [formDataLoaded, setFormDataLoaded] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const initialLoadCompletedRef = useRef(false);
  const loadAttemptsRef = useRef(0);

  const [formData, setFormData] = useState({
    name: profile?.name || progress?.personal_info?.name || "",
    email: profile?.email || progress?.personal_info?.email || "",
    phone: progress?.personal_info?.phone || "",
    ddi: progress?.personal_info?.ddi || "+55",
    linkedin: progress?.personal_info?.linkedin || "",
    instagram: progress?.personal_info?.instagram || "",
    country: progress?.personal_info?.country || "Brasil",
    state: progress?.personal_info?.state || "",
    city: progress?.personal_info?.city || "",
    timezone: progress?.personal_info?.timezone || "America/Sao_Paulo", // Define o valor padrão como Brasília
  });

  const updateFormData = useCallback(() => {
    if (!isLoading && (profile || progress?.personal_info)) {
      console.log("Atualizando dados do formulário com:", {
        profile,
        personalInfo: progress?.personal_info
      });
      
      setFormData(prev => {
        const newData = {
          ...prev,
          name: profile?.name || progress?.personal_info?.name || user?.user_metadata?.name || "",
          email: profile?.email || progress?.personal_info?.email || user?.email || "",
          phone: progress?.personal_info?.phone || "",
          ddi: progress?.personal_info?.ddi || "+55",
          linkedin: progress?.personal_info?.linkedin || "",
          instagram: progress?.personal_info?.instagram || "",
          country: progress?.personal_info?.country || "Brasil",
          state: progress?.personal_info?.state || "",
          city: progress?.personal_info?.city || "",
          timezone: progress?.personal_info?.timezone || "GMT-3",
        };
        console.log("Novos dados do formulário:", newData);
        return newData;
      });
      setFormDataLoaded(true);
    }
  }, [profile, progress?.personal_info, user, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      updateFormData();
      
      // Após a primeira carga bem-sucedida, marcar como completa
      if (!initialLoadCompletedRef.current) {
        initialLoadCompletedRef.current = true;
      }
    }
  }, [updateFormData, isLoading, progress]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoading && !formDataLoaded) {
        console.log("Buscando novos dados do progresso para o formulário pessoal");
        loadAttemptsRef.current += 1;
        
        try {
          const refreshedProgress = await refreshProgress();
          if (refreshedProgress) {
            console.log("Dados de progresso atualizados:", refreshedProgress);
          } else if (loadAttemptsRef.current >= 3) {
            // Após várias tentativas sem sucesso, preencha com dados mínimos
            console.log("Não foi possível carregar dados, usando defaults");
            setFormData(prev => ({
              ...prev,
              name: profile?.name || user?.user_metadata?.name || "",
              email: profile?.email || user?.email || ""
            }));
            setFormDataLoaded(true);
            
            // Notificar ao usuário
            toast.info("Usando dados básicos para continuar");
          }
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
          if (loadAttemptsRef.current >= 3) {
            toast.warning("Problemas ao carregar dados. Continuando com informações básicas.");
            setFormDataLoaded(true);
          }
        }
      }
    };  
    fetchData();
  }, [refreshProgress, isLoading, formDataLoaded, profile, user?.email, user?.user_metadata?.name]);

  // Timer para carregamento de fallback após 5 segundos
  useEffect(() => {
    if (!formDataLoaded) {
      const timer = setTimeout(() => {
        if (!formDataLoaded) {
          console.log("Timeout de carregamento - usando valores padrão");
          setFormData(prev => ({
            ...prev,
            name: profile?.name || user?.user_metadata?.name || "",
            email: profile?.email || user?.email || ""
          }));
          setFormDataLoaded(true);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [formDataLoaded, profile, user?.email, user?.user_metadata?.name]);

  // Função para gerenciar alterações no formulário sem salvamento automático
  const handleFormChange = useCallback((field: string, value: string) => {
    // Atualizar o estado do formulário imediatamente
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === "country") {
        newData.state = "";
        newData.city = "";
      }
      if (field === "state") {
        newData.city = "";
      }
      return newData;
    });
    
    // Limpar erro do campo se existir
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
    
  }, [formData, formErrors]);

  return {
    formData, 
    setFormData,
    formErrors, 
    setFormErrors,
    formDataLoaded,
    updateProgress, 
    progress, 
    profile, 
    user, 
    isLoading,
    handleFormChange,
    isSaving,
    lastSaveTime
  };
}
