
import { useState } from "react";
import { useForm, SubmitHandler, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { PersonalInfoData } from "@/types/onboarding";
import { 
  validateLinkedInUrl,
  validateInstagramUrl, 
  isValidBrazilianPhone as validateBrazilianPhone, 
  formatSocialUrl 
} from "@/utils/validationUtils";

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

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
      timezone: initialData?.timezone || "America/Sao_Paulo" // Define o valor padrão como Brasília
    },
    mode: "onChange"
  });
  
  // Extrair os métodos necessários para a validação
  const { register, formState, trigger, getValues } = methods;
  const { touchedFields, errors, isValid } = formState;
  
  // Função para validar manualmente o formulário
  const validateForm = (): ValidationResult => {
    const values = getValues();
    const validationErrors: Record<string, string> = {};
    
    // Campo state é obrigatório
    if (!values.state) {
      validationErrors.state = "Estado é obrigatório";
    }
    
    // Campo city é obrigatório
    if (!values.city) {
      validationErrors.city = "Cidade é obrigatória";
    }
    
    // Timezone é obrigatório
    if (!values.timezone) {
      validationErrors.timezone = "Fuso horário é obrigatório";
    }
    
    // Validar telefone se fornecido
    if (values.phone && !validateBrazilianPhone(values.phone)) {
      validationErrors.phone = "Telefone inválido";
    }
    
    // Validar LinkedIn se fornecido
    if (values.linkedin && !validateLinkedInUrl(values.linkedin)) {
      validationErrors.linkedin = "URL do LinkedIn inválida";
    }
    
    // Validar Instagram se fornecido
    if (values.instagram && !validateInstagramUrl(values.instagram)) {
      validationErrors.instagram = "Usuário do Instagram inválido";
    }
    
    return {
      isValid: Object.keys(validationErrors).length === 0,
      errors: validationErrors
    };
  };

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
      const validation = validateForm();
      if (!validation.isValid) {
        for (const [field, message] of Object.entries(validation.errors)) {
          methods.setError(field as any, { 
            type: "manual", 
            message
          });
        }
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

  // Função de validação para ser usada externamente
  const validation = {
    isValid: isValid,
    errors: {} as Record<string, string>,
    validate: () => {
      return validateForm();
    }
  };

  return {
    methods,
    register,
    handleSubmit,
    touchedFields,
    validation,
    isValid,
    validateForm,
    isSubmitting
  };
};
