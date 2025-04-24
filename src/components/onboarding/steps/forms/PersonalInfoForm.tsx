
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
  isSaving?: boolean;
  lastSaveTime?: number;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ 
  formData, 
  errors, 
  onChange, 
  isSubmitting, 
  onSubmit,
  readOnly = false,
  isSaving = false,
  lastSaveTime
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
        disabled={isSubmitting || isSaving}
        readOnly={readOnly}
        errors={errors}
      />
      
      {onSubmit && !readOnly && (
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || isSaving}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-white px-4 py-2 rounded-md"
          >
            {isSubmitting || isSaving ? "Salvando..." : "Continuar"}
          </button>
        </div>
      )}
      
      {lastSaveTime && (
        <p className="text-xs text-gray-500 text-right">
          Última atualização: {new Date(lastSaveTime).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};
