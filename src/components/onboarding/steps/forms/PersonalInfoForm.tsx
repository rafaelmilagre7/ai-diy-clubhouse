
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { SubmitButton } from "../business-context/SubmitButton";
import { NameInput } from "../inputs/NameInput";
import { EmailInput } from "../inputs/EmailInput";
import { PhoneInput } from "../inputs/PhoneInput";
import { SocialInputs } from "../inputs/SocialInputs";
import { LocationInputs } from "../inputs/LocationInputs";
import { TimezoneInput } from "../inputs/TimezoneInput";
import { OnboardingProgress } from "@/types/onboarding";
import { toast } from "sonner";
import { PersonalInfoInputs } from "../PersonalInfoInputs";

interface PersonalInfoFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  initialData?: OnboardingProgress | null;
  validation?: any;
  register?: any;
  formData?: any;
  errors?: any;
  onChange?: (field: string, value: string) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  validation,
  register,
  formData,
  errors = {},
  onChange = () => {},
}) => {
  const {
    handleSubmit,
    reset,
    formState: { errors: formErrors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      ddi: "+55",
      linkedin: "",
      instagram: "",
      country: "Brasil",
      state: "",
      city: "",
      timezone: "America/Sao_Paulo",
    },
  });

  // Carregar dados iniciais quando disponíveis
  useEffect(() => {
    if (initialData?.personal_info) {
      console.log("Carregando dados iniciais:", initialData.personal_info);
      // Usar reset para evitar problemas com o controlled/uncontrolled warning do React
      reset({
        name: initialData.personal_info.name || "",
        email: initialData.personal_info.email || "",
        phone: initialData.personal_info.phone || "",
        ddi: initialData.personal_info.ddi || "+55",
        linkedin: initialData.personal_info.linkedin || "",
        instagram: initialData.personal_info.instagram || "",
        country: initialData.personal_info.country || "Brasil",
        state: initialData.personal_info.state || "",
        city: initialData.personal_info.city || "",
        timezone: initialData.personal_info.timezone || "America/Sao_Paulo",
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      toast.success("Informações pessoais salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar informações pessoais:", error);
      toast.error("Ocorreu um erro ao salvar suas informações. Por favor, tente novamente.");
    }
  };

  // Se estamos usando a abordagem de componentes controlados
  if (formData) {
    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }} className="space-y-6">
        <PersonalInfoInputs 
          formData={formData}
          onChange={onChange}
          disabled={isSubmitting}
          errors={errors}
        />
        <SubmitButton isSubmitting={isSubmitting} text="Salvar e Continuar" />
      </form>
    );
  }

  // Se estamos usando a abordagem do react-hook-form
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-6">
        {/* Implementar campos de formulário com register caso necessário */}
      </div>
      <SubmitButton isSubmitting={isSubmitting} text="Salvar e Continuar" />
    </form>
  );
};
