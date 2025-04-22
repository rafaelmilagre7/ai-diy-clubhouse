
import React from "react";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { PersonalInfoInputs } from "./PersonalInfoInputs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PersonalInfoFormProps {
  formData: any;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  isSubmitting: boolean;
  onSubmit?: () => void;
  readOnly?: boolean;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ 
  formData, 
  errors, 
  onChange, 
  isSubmitting, 
  readOnly = false
}) => {
  const hasErrors = Object.keys(errors).length > 0;
  
  // Adicionar log para depuração
  console.log("[DEBUG] PersonalInfoForm props:", { isSubmitting, readOnly, formData });

  return (
    <div className="space-y-6">
      <MilagrinhoMessage 
        message="Para começar, vou precisar de algumas informações pessoais para personalizar sua experiência no VIVER DE IA Club." 
      />
      
      {hasErrors && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, preencha todos os campos obrigatórios antes de continuar.
          </AlertDescription>
        </Alert>
      )}
      
      <PersonalInfoInputs 
        formData={formData} 
        onChange={onChange} 
        disabled={isSubmitting}
        readOnly={readOnly}
        errors={errors}
      />
    </div>
  );
};
