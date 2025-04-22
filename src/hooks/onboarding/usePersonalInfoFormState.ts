
import { useState, useEffect, useCallback } from "react";
import { PersonalInfoData } from "@/types/onboarding";
import { useAuth } from "@/contexts/auth";
import { useProgress } from "./useProgress";

export const usePersonalInfoFormState = () => {
  const { progress } = useProgress();
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

  // Log para diagnóstico
  console.log("[DEBUG] usePersonalInfoFormState inicial:", { 
    userName: profile?.name || user?.user_metadata?.name || "",
    userEmail: profile?.email || user?.email || "",
    progressData: progress?.personal_info
  });

  // Função para carregar dados iniciais do banco
  const loadInitialData = useCallback(() => {
    const userName = profile?.name || user?.user_metadata?.name || "";
    const userEmail = profile?.email || user?.email || "";
    
    console.log("[DEBUG] loadInitialData chamado com:", { userName, userEmail, progress });
    
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
    console.log("[DEBUG] Dados iniciais carregados:", { userName, userEmail });
  }, [progress, profile, user]);

  // Inicializar com dados vazios se não houver progresso após 3 segundos
  useEffect(() => {
    if (!initialDataLoaded) {
      const timer = setTimeout(() => {
        if (!initialDataLoaded) {
          console.log("[DEBUG] Timeout para carregar dados, usando padrões");
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
      console.log("[DEBUG] Progresso carregado, inicializando dados");
      loadInitialData();
    }
  }, [progress, initialDataLoaded, loadInitialData]);

  // Handler de mudança de campo
  const handleChange = (field: keyof PersonalInfoData, value: string) => {
    if (field === "ddi") {
      value = "+" + value.replace(/\+/g, '').replace(/\D/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpa erro do campo, se necessário
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    validationAttempted,
    setValidationAttempted,
    initialDataLoaded,
    setInitialDataLoaded,
    handleChange,
    loadInitialData,
    user,
    profile,
    progress,
  };
};
