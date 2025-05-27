
import React, { useState, useEffect } from "react";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { usePersonalInfoForm } from "@/hooks/onboarding/usePersonalInfoForm";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { PersonalInfoData } from "@/types/onboarding";
import { NavigationButtons } from "../NavigationButtons";

export interface PersonalInfoStepProps {
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  formData: PersonalInfoData;
  errors: Record<string, string>;
  onChange: (field: keyof PersonalInfoData, value: string) => void;
  initialData?: any;
  onPrevious?: () => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onSubmit,
  isSubmitting,
  formData,
  errors,
  onChange,
  onPrevious,
}) => {
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  const {
    register,
    handleSubmit,
    touchedFields,
    validation,
    isValid,
  } = usePersonalInfoForm(formData);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationAttempted(true);
    setSubmitAttempts(prev => prev + 1);
    
    const fieldErrors = Object.keys(errors);
    
    if (fieldErrors.length > 0) {
      const errorFieldNames = fieldErrors.map(field => {
        switch (field) {
          case 'state': return 'Estado';
          case 'city': return 'Cidade';
          case 'phone': return 'Telefone';
          case 'linkedin': return 'LinkedIn';
          case 'instagram': return 'Instagram';
          case 'timezone': return 'Fuso Horário';
          default: return field.charAt(0).toUpperCase() + field.slice(1);
        }
      }).join(', ');
      
      toast.error("Por favor, corrija os erros antes de continuar", {
        description: `Verifique os campos: ${errorFieldNames}`
      });
      return;
    }
    
    try {
      await onSubmit();
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar os dados", {
        description: "Verifique sua conexão e tente novamente"
      });
    }
  };

  const hasValidationErrors = validationAttempted && Object.keys(errors).length > 0;

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      {isFormLoaded && hasValidationErrors && (
        <Alert variant="destructive" className="animate-fade-in bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, preencha todos os campos obrigatórios: Estado, Cidade e Fuso Horário.
          </AlertDescription>
        </Alert>
      )}

      {isFormLoaded && !hasValidationErrors && validationAttempted && isValid && (
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
        initialData={formData}
        formData={formData}
        onChange={onChange}
      />

      <NavigationButtons
        onPrevious={onPrevious}
        isSubmitting={isSubmitting}
        showPrevious={false}
        submitText="Continuar"
        loadingText="Salvando..."
      />
    </form>
  );
};
