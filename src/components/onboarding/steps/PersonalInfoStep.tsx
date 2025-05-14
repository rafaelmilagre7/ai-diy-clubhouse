
import React, { useState, useEffect } from "react";
import { MilagrinhoMessage } from "../MilagrinhoMessage";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { OnboardingStepProps, PersonalInfoData } from "@/types/onboarding";

export interface PersonalInfoStepProps extends Partial<OnboardingStepProps> {
  onSubmit: (stepId?: string, data?: any) => Promise<void>;
  isSubmitting: boolean;
  formData?: PersonalInfoData;
  errors?: Record<string, any>;
  onChange?: (field: keyof PersonalInfoData, value: string) => void;
  initialData?: any;
  isLastStep?: boolean;
  onComplete?: () => void;
  isSaving?: boolean;
  lastSaveTime?: number | null;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isLastStep,
  onComplete,
  formData = {} as PersonalInfoData,
  errors = {},
  onChange = () => {},
  isSaving = false,
  lastSaveTime = null,
}) => {
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [submitAttempts, setSubmitAttempts] = useState(0);
  
  // Marcar o formulário como carregado após um breve delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationAttempted(true);
    setSubmitAttempts(prev => prev + 1);
    
    // Verificar campos obrigatórios
    if (!formData.state) {
      errors.state = "Estado é obrigatório";
    }
    
    if (!formData.city) {
      errors.city = "Cidade é obrigatória";
    }
    
    // Garantir que temos um timezone selecionado
    if (!formData.timezone) {
      formData.timezone = "America/Sao_Paulo";
    }
    
    // Verificar quais campos têm erro
    const fieldErrors = Object.keys(errors);
    
    if (fieldErrors.length > 0) {
      // Criar uma mensagem que lista os campos com erro
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
      
      console.log("[PersonalInfoStep] Erros de validação:", errors);
      return;
    }
    
    try {
      console.log("[PersonalInfoStep] Enviando dados do formulário:", formData);
      await onSubmit('personal_info', formData);
    } catch (error) {
      console.error("[PersonalInfoStep] Erro ao salvar dados:", error);
    }
  };

  const isValid = Object.keys(errors).length === 0;
  const hasValidationErrors = validationAttempted && !isValid;

  return (
    <form onSubmit={onFormSubmit} className="space-y-6 animate-fade-in">
      <MilagrinhoMessage 
        message="Para começar, vou precisar de algumas informações pessoais para personalizar sua experiência no VIVER DE IA Club." 
      />
      
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
        errors={errors}
        isSubmitting={isSubmitting}
        initialData={initialData}
        formData={formData}
        onChange={onChange}
        onSubmit={onFormSubmit}
      />
    </form>
  );
};
