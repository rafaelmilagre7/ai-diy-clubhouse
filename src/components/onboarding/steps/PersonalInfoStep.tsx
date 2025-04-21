
import React from "react";
import { MilagrinhoMessage } from "../MilagrinhoMessage";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { usePersonalInfoForm } from "@/hooks/onboarding/usePersonalInfoForm";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface PersonalInfoStepProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData
}) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    errors,
    touchedFields,
    validation
  } = usePersonalInfoForm(initialData);

  const onFormSubmit = async (data: any) => {
    try {
      await onSubmit({
        personal_info: {
          ...data,
          ...validation.values
        }
      });
      toast.success("Dados pessoais salvos com sucesso!");
      navigate("/onboarding/professional-data");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar os dados. Tente novamente.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 animate-fade-in">
      <MilagrinhoMessage 
        message="Para começar, vou precisar de algumas informações pessoais para personalizar sua experiência no VIVER DE IA Club." 
      />
      
      <PersonalInfoForm
        validation={validation}
        register={register}
        errors={errors}
        touchedFields={touchedFields}
        isSubmitting={isSubmitting}
        initialData={initialData}
      />
    </form>
  );
};
