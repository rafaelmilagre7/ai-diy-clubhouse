
import { useState, useEffect, useCallback } from "react";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";

export function usePersonalInfoFormData() {
  const { progress, updateProgress, isLoading, refreshProgress } = useProgress();
  const { profile, user } = useAuth();
  const [formDataLoaded, setFormDataLoaded] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    timezone: progress?.personal_info?.timezone || "GMT-3",
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
    }
  }, [updateFormData, isLoading, progress]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoading && !formDataLoaded) {
        console.log("Buscando novos dados do progresso para o formulário pessoal");
        await refreshProgress();
      }
    };  
    fetchData();
  }, [refreshProgress, isLoading, formDataLoaded]);

  return {
    formData, setFormData,
    formErrors, setFormErrors,
    formDataLoaded,
    updateProgress, progress, profile, user, isLoading
  };
}
