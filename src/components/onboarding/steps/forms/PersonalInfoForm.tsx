
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

interface PersonalInfoFormProps {
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
  initialData?: OnboardingProgress | null;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
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

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <NameInput control={control} error={errors.name} />
      <EmailInput control={control} error={errors.email} />
      <PhoneInput control={control} error={errors.phone} />
      <SocialInputs control={control} errors={{ linkedin: errors.linkedin, instagram: errors.instagram }} />
      <LocationInputs 
        control={control} 
        errors={{ country: errors.country, state: errors.state, city: errors.city }} 
        defaultValues={{
          country: initialData?.personal_info?.country,
          state: initialData?.personal_info?.state,
          city: initialData?.personal_info?.city
        }}
      />
      <TimezoneInput control={control} error={errors.timezone} />
      <SubmitButton isSubmitting={isSubmitting} text="Salvar e Continuar" />
    </form>
  );
};
