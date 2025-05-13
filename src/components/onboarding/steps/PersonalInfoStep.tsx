
import React, { useState, useEffect } from "react";
import { MilagrinhoMessage } from "../MilagrinhoMessage";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { usePersonalInfoForm } from "@/hooks/onboarding/usePersonalInfoForm";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { OnboardingStepProps, PersonalInfoData } from "@/types/onboarding";

export interface PersonalInfoStepProps extends Partial<OnboardingStepProps> {
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  formData: PersonalInfoData;
  errors: Record<string, string>;
  onChange: (field: keyof PersonalInfoData, value: string) => void;
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
  formData,
  errors,
  onChange,
  isSaving = false,
  lastSaveTime = null,
}) => {
  const [validationAttempted, setValidationAttempted] = useState(false);
  // Flag para indicar que o formulário foi carregado
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  // Estado para controlar tentativas de envio
  const [submitAttempts, setSubmitAttempts] = useState(0);
  
  // Marcar o formulário como carregado após um breve delay
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
    validateForm,
  } = usePersonalInfoForm(initialData || formData);

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationAttempted(true);
    setSubmitAttempts(prev => prev + 1);
    
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
      
      toast.error("Por favor, corrija os erros antes de continuar", {
        description: `Verifique os campos: ${errorFieldNames}`
      });
      return;
    }
    
    try {
      // Adicionar tratamento especial para caso de múltiplas tentativas
      if (submitAttempts > 2) {
        console.log("Múltiplas tentativas de envio detectadas, usando enfoque mais agressivo");
        
        // Tenta forçar a navegação para a próxima etapa após o salvamento
        // Isso é um fallback para casos onde pode haver problemas no salvamento
        const savePromise = onSubmit();
        
        // Se estamos em muitas tentativas, mostrar mensagem de espera
        toast.info("Processando sua requisição, por favor aguarde...");
        
        // Aguarde até 5 segundos e, se o salvamento não estiver concluído,
        // tente navegar diretamente para a próxima página
        setTimeout(() => {
          window.location.href = "/onboarding/professional-data";
        }, 5000);
        
        await savePromise;
      } else {
        // Caminho normal de salvamento
        await onSubmit();
      }
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar os dados", {
        description: "Verifique sua conexão e tente novamente"
      });
    }
  };

  const hasValidationErrors = validationAttempted && Object.keys(errors).length > 0;

  // Registrar no console dados relevantes para debug
  useEffect(() => {
    console.log("Dados atuais do formulário:", formData);
    console.log("Erros atuais do formulário:", errors);
  }, [formData, errors]);

  return (
    <form onSubmit={onFormSubmit} className="space-y-6 animate-fade-in">
      <MilagrinhoMessage 
        message="Para começar, vou precisar de algumas informações pessoais para personalizar sua experiência no VIVER DE IA Club." 
      />
      
      {/* Só mostrar alertas depois que o formulário estiver carregado */}
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
        initialData={initialData || formData}
        formData={formData}
        onChange={onChange}
      />
    </form>
  );
};
