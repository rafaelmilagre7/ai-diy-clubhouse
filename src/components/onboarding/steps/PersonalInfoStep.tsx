
import React, { useState, useEffect } from "react";
import { MilagrinhoMessage } from "../MilagrinhoMessage";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { PersonalInfoData } from "@/types/onboarding";

interface PersonalInfoStepProps {
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  formData: PersonalInfoData;
  errors: Record<string, string>;
  onChange: (field: keyof PersonalInfoData, value: string) => void;
  isSaving?: boolean;
  lastSaveTime?: number | null;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onSubmit,
  isSubmitting,
  formData,
  errors = {},
  onChange,
  isSaving = false,
  lastSaveTime = null,
}) => {
  const [validationAttempted, setValidationAttempted] = useState(false);
  const [isFormLoaded, setIsFormLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFormLoaded(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationAttempted(true);

    if (Object.keys(errors || {}).length > 0) {
      return;
    }

    try {
      await onSubmit();
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  };

  const hasValidationErrors = validationAttempted && Object.keys(errors || {}).length > 0;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 animate-fade-in">
      <MilagrinhoMessage 
        message="Para começar, vou precisar de algumas informações pessoais para personalizar sua experiência no VIVER DE IA Club." 
      />
      
      {isFormLoaded && hasValidationErrors && (
        <Alert variant="destructive" className="animate-fade-in bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, preencha todos os campos obrigatórios antes de continuar.
          </AlertDescription>
        </Alert>
      )}

      {isFormLoaded && !hasValidationErrors && validationAttempted && (
        <Alert className="animate-fade-in bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            Todos os campos estão preenchidos corretamente!
          </AlertDescription>
        </Alert>
      )}
      
      <PersonalInfoForm
        formData={formData}
        onChange={onChange}
        errors={errors || {}}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />
    </form>
  );
};
