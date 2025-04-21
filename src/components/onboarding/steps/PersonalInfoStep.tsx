
import React from "react";
import { MilagrinhoMessage } from "../MilagrinhoMessage";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { usePersonalInfoForm } from "@/hooks/onboarding/usePersonalInfoForm";

interface PersonalInfoStepProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: any;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData
}) => {
  const {
    register,
    handleSubmit,
    onFormSubmit,
    errors,
    touchedFields,
    validation
  } = usePersonalInfoForm(initialData, onSubmit);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 animate-fade-in">
      <MilagrinhoMessage 
        message="Bem-vindo ao VIVER DE IA Club! Vamos começar coletando algumas informações pessoais para personalizar sua experiência. Não se preocupe, seus dados estão seguros conosco." 
      />
      
      <PersonalInfoForm
        validation={validation}
        register={register}
        errors={errors}
        touchedFields={touchedFields}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};
