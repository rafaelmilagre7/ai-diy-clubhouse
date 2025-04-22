
import React, { useState } from "react";
import { MilagrinhoMessage } from "../MilagrinhoMessage";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { usePersonalInfoForm } from "@/hooks/onboarding/usePersonalInfoForm";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface PersonalInfoStepProps {
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
  isLastStep?: boolean;
  onComplete?: () => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isLastStep,
  onComplete
}) => {
  const navigate = useNavigate();
  const [validationAttempted, setValidationAttempted] = useState(false);
  
  const {
    register,
    handleSubmit,
    errors,
    touchedFields,
    validation,
    isValid,
    validateForm,
    formData
  } = usePersonalInfoForm(initialData);

  const onFormSubmit = async (data: any) => {
    setValidationAttempted(true);
    
    const isFormValid = await validateForm();
    
    if (!isFormValid) {
      toast.error("Por favor, corrija os erros antes de continuar", {
        description: "Verifique os campos destacados em vermelho",
        duration: 4000
      });
      return;
    }
    
    try {
      await onSubmit({
        personal_info: {
          ...data,
          ...validation.values
        }
      });
      
      toast.success("Dados pessoais salvos com sucesso!", {
        description: "Avançando para a próxima etapa...",
        icon: <CheckCircle className="h-5 w-5 text-green-500" />
      });
      
      // A navegação é feita no componente pai após o sucesso
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar os dados", {
        description: "Verifique sua conexão e tente novamente",
        icon: <AlertCircle className="h-5 w-5 text-red-500" />
      });
    }
  };

  // Verificar se há erros de validação após a tentativa de envio
  const hasValidationErrors = validationAttempted && (
    Object.keys(errors).length > 0 || Object.keys(validation.errors).length > 0
  );

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6 animate-fade-in">
      <MilagrinhoMessage 
        message="Para começar, vou precisar de algumas informações pessoais para personalizar sua experiência no VIVER DE IA Club." 
      />
      
      {hasValidationErrors && (
        <Alert variant="destructive" className="animate-fade-in bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, corrija os erros destacados antes de prosseguir.
          </AlertDescription>
        </Alert>
      )}

      {!hasValidationErrors && validationAttempted && isValid && (
        <Alert className="animate-fade-in bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            Todos os campos estão preenchidos corretamente!
          </AlertDescription>
        </Alert>
      )}
      
      <PersonalInfoForm
        validation={validation}
        register={register}
        errors={errors}
        touchedFields={touchedFields}
        isSubmitting={isSubmitting}
        initialData={initialData}
        formData={formData}
      />
    </form>
  );
};
