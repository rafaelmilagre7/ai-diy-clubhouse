
import React from "react";
import { Button } from "@/components/ui/button";
import { PersonalInfoInputs } from "../PersonalInfoInputs";
import { PersonalInfoData } from "@/types/onboarding";

interface PersonalInfoFormProps {
  validation: any;
  register: any;
  errors: Record<string, string>;
  touchedFields: any;
  isSubmitting: boolean;
  initialData?: any;
  formData: PersonalInfoData;
  onChange: (field: keyof PersonalInfoData, value: string) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  validation,
  register,
  errors,
  touchedFields,
  isSubmitting,
  initialData,
  formData,
  onChange
}) => {
  // Combinar erros do react-hook-form e da validação personalizada
  const combinedErrors = {
    ...errors,
    ...validation.errors
  };

  // Converter PersonalInfoData opcional para o formato esperado pelos inputs
  const formDataForInputs = {
    name: formData.name || "",
    email: formData.email || "",
    phone: formData.phone || "",
    ddi: formData.ddi || "",
    linkedin: formData.linkedin || "",
    instagram: formData.instagram || "",
    country: formData.country || "",
    state: formData.state || "",
    city: formData.city || "",
    timezone: formData.timezone || ""
  };

  return (
    <div className="space-y-6">
      <PersonalInfoInputs
        formData={formDataForInputs}
        onChange={onChange}
        disabled={isSubmitting}
        errors={combinedErrors}
      />
      
      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Salvando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
};
