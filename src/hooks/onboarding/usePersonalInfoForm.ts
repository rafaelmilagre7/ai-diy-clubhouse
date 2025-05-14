
import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { PersonalInfoData } from "@/types/onboarding";
import { validateLinkedInUrl, validateInstagramUrl, validateBrazilianPhone, formatSocialUrl } from "@/utils/validationUtils";

export const usePersonalInfoForm = (
  initialData: Partial<PersonalInfoData> | null,
  onSubmit: (stepId: string, data: any, shouldNavigate?: boolean) => Promise<void>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const methods = useForm<PersonalInfoData>({
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      ddi: initialData?.ddi || "+55",
      linkedin: initialData?.linkedin || "",
      instagram: initialData?.instagram || "",
      country: initialData?.country || "Brasil",
      state: initialData?.state || "",
      city: initialData?.city || "",
      timezone: initialData?.timezone || "America/Sao_Paulo"
    },
    mode: "onChange"
  });

  const handleSubmit: SubmitHandler<PersonalInfoData> = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Formatar URLs sociais
      if (data.linkedin) {
        data.linkedin = formatSocialUrl(data.linkedin, 'linkedin');
      }
      
      if (data.instagram) {
        data.instagram = formatSocialUrl(data.instagram, 'instagram');
      }
      
      // Validações personalizadas
      if (data.linkedin && !validateLinkedInUrl(data.linkedin)) {
        methods.setError("linkedin", { 
          type: "manual", 
          message: "URL do LinkedIn inválida" 
        });
        setIsSubmitting(false);
        return;
      }
      
      if (data.instagram && !validateInstagramUrl(data.instagram)) {
        methods.setError("instagram", { 
          type: "manual", 
          message: "Usuário do Instagram inválido" 
        });
        setIsSubmitting(false);
        return;
      }
      
      if (data.phone && !validateBrazilianPhone(data.phone)) {
        methods.setError("phone", { 
          type: "manual", 
          message: "Telefone inválido" 
        });
        setIsSubmitting(false);
        return;
      }
      
      // Enviar dados para o backend
      await onSubmit("personal_info", {
        personal_info: data
      });
      
    } catch (error) {
      console.error("Erro ao enviar dados pessoais:", error);
      toast.error("Ocorreu um erro ao salvar seus dados");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    methods,
    handleSubmit,
    isSubmitting
  };
};
