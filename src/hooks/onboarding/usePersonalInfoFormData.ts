
import { useState, useEffect, useCallback, useRef } from "react";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export function usePersonalInfoFormData() {
  const { progress, updateProgress, isLoading, refreshProgress } = useProgress();
  const { profile, user } = useAuth();
  const [formDataLoaded, setFormDataLoaded] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const autoSaveTimeoutRef = useRef<number | null>(null);

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

  // Função para auto-salvar os dados do formulário após mudanças
  const handleFormChange = useCallback(async (field: string, value: string) => {
    if (field === "name" || field === "email") return;
    
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
    
    // Cancelar qualquer timeout de auto-save pendente
    if (autoSaveTimeoutRef.current) {
      window.clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Configurar novo timeout para auto-save (após 1 segundo sem novas alterações)
    autoSaveTimeoutRef.current = window.setTimeout(async () => {
      if (!progress?.id) return;
      
      try {
        const updatedFormData = { ...formData, [field]: value };
        
        // Não enviar nome e email que são somente leitura
        const fullName = profile?.name || user?.user_metadata?.name || updatedFormData.name;
        const email = profile?.email || user?.email || updatedFormData.email;
        
        await updateProgress({
          personal_info: { 
            ...updatedFormData, 
            name: fullName, 
            email: email 
          }
        });
        
        console.log("Dados salvos automaticamente:", field, value);
      } catch (error) {
        console.error("Erro ao auto-salvar campo:", field, error);
      }
    }, 1000);
    
  }, [formData, formErrors, progress?.id, updateProgress, profile?.name, profile?.email, user?.user_metadata?.name, user?.email]);

  // Assegurar que os timeouts sejam limpos na desmontagem
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        window.clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

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
    handleFormChange
  };
}
