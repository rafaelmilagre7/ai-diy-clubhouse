
import { useState, useEffect, useCallback } from "react";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { NavigationButtons } from "./NavigationButtons";

export const PersonalInfoFormController = () => {
  const { progress, updateProgress, isLoading, refreshProgress } = useProgress();
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formDataLoaded, setFormDataLoaded] = useState(false);

  // Preencher nome e email do perfil e dados já salvos
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

  // Logs para debug
  useEffect(() => {
    if (progress?.personal_info) {
      console.log("PersonalInfoFormController: Dados carregados do progresso:", progress.personal_info);
      console.log("PersonalInfoFormController: Estado:", progress.personal_info.state);
      console.log("PersonalInfoFormController: Cidade:", progress.personal_info.city);
    }
  }, [progress]);

  // Usar useCallback para evitar recriações desnecessárias
  const updateFormData = useCallback(() => {
    if (!isLoading && (profile || progress?.personal_info)) {
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
        
        console.log("PersonalInfoFormController: Atualizando formData com cidade:", newData.city);
        return newData;
      });
      setFormDataLoaded(true);
    }
  }, [profile, progress?.personal_info, user, isLoading]);

  useEffect(() => {
    // Só atualizamos os dados quando eles estiverem carregados
    if (!isLoading) {
      updateFormData();
    }
  }, [updateFormData, isLoading, progress]);

  // Recarregar os dados ao montar o componente
  useEffect(() => {
    const fetchData = async () => {
      if (!isLoading && !formDataLoaded) {
        await refreshProgress();
      }
    };
    
    fetchData();
  }, [refreshProgress, isLoading, formDataLoaded]);

  const handleChange = (field: string, value: string) => {
    // Impede edição em nome e e-mail (proteção extra contra tentativa de edição)
    if (field === "name" || field === "email") return;
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Reset dependent fields when country changes
      if (field === "country") {
        newData.state = "";
        newData.city = "";
      }

      // Reset city when state changes
      if (field === "state") {
        newData.city = "";
      }
      
      console.log(`PersonalInfoFormController: Campo ${field} atualizado para ${value}`);
      return newData;
    });
    
    // Limpar erro do campo quando o usuário digitar novamente nele
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Validar telefone (obrigatório e formato correto)
    if (!formData.phone.trim()) {
      errors.phone = "O telefone é obrigatório";
    } else if (!/^[0-9]{8,15}$/.test(formData.phone.replace(/\D/g, ""))) {
      errors.phone = "Formato de telefone inválido";
    }
    
    // Cidade e estado são obrigatórios
    if (!formData.state.trim()) {
      errors.state = "O estado é obrigatório";
    }
    
    if (!formData.city.trim()) {
      errors.city = "A cidade é obrigatória";
    }
    
    // LinkedIn e Instagram são opcionais, mas se preenchidos devem ter formato válido
    if (formData.linkedin && !formData.linkedin.includes("linkedin.com")) {
      errors.linkedin = "URL do LinkedIn inválida";
    }
    
    if (formData.instagram && !formData.instagram.includes("instagram.com")) {
      errors.instagram = "URL do Instagram inválida";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Garantir que utilizamos o nome e email corretos
      const fullName = profile?.name || user?.user_metadata?.name || formData.name;
      const email = profile?.email || user?.email || formData.email;

      // Incluímos todos os campos no objeto pessoal_info
      const personalInfo = {
        ...formData,
        name: fullName,
        email: email,
      };
      
      console.log("PersonalInfoFormController: Dados pessoais sendo salvos:", personalInfo);

      await updateProgress({
        personal_info: personalInfo,
        current_step: "professional_data",
        completed_steps: [...(progress?.completed_steps || []), "personal"],
      });

      toast.success("Dados salvos com sucesso!");
      navigate("/onboarding/professional-data", { replace: true });
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se estiver carregando, mostramos um indicador
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0ABAB5]"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      <PersonalInfoInputs 
        formData={formData} 
        onChange={handleChange} 
        disabled={isSubmitting}
        readOnly 
        errors={formErrors}
      />
      <NavigationButtons isSubmitting={isSubmitting} />
    </form>
  );
};
