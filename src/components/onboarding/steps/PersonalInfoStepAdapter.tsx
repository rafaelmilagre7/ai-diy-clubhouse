
import React, { useState, useEffect } from "react";
import { PersonalInfoStep } from "./PersonalInfoStep";
import { usePersonalInfoFormData } from "@/hooks/onboarding/usePersonalInfoFormData";
import { OnboardingStepProps } from "@/types/onboarding";

/**
 * Componente adaptador que converte as props do OnboardingSteps para o formato
 * que o PersonalInfoStep espera
 */
export const PersonalInfoStepAdapter: React.FC<OnboardingStepProps> = ({ 
  onSubmit, 
  isSubmitting, 
  initialData,
  isLastStep,
  onComplete
}) => {
  // Usar o hook para gerenciar os dados do formulário
  const { 
    formData, 
    formErrors, 
    handleFormChange,
    isLoading
  } = usePersonalInfoFormData();

  // Estado local para os dados e erros
  const [localFormData, setLocalFormData] = useState(formData);
  const [localErrors, setLocalErrors] = useState(formErrors);

  // Atualizar dados locais quando os dados externos mudarem
  useEffect(() => {
    if (initialData?.personal_info) {
      setLocalFormData({
        ...formData,
        ...initialData.personal_info
      });
    }
  }, [initialData?.personal_info]);

  // Função para gerenciar mudanças no formulário
  const handleChange = (field: string, value: string) => {
    setLocalFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    handleFormChange(field, value);
  };

  // Adaptador para a função onSubmit
  const handleSubmit = async () => {
    try {
      // Chamar onSubmit com o ID da etapa e os dados do formulário
      await onSubmit("personal", localFormData);
      // Não retornar boolean, para compatibilidade com Promise<void>
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      // Não retornar boolean, para compatibilidade com Promise<void>
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-10">Carregando...</div>;
  }

  return (
    <PersonalInfoStep
      formData={localFormData || {
        name: "",
        email: "",
        phone: "",
        linkedin: "",
        instagram: "",
        country: "Brasil",
        state: "",
        city: "",
        timezone: ""
      }}
      errors={localErrors}
      onChange={handleChange}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      initialData={initialData?.personal_info}
      isLastStep={isLastStep}
      onComplete={onComplete}
    />
  );
};
