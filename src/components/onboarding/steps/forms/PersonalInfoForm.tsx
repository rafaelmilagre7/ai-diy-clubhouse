
import React from "react";
import { Button } from "@/components/ui/button";
import { PersonalInfoInputs } from "../PersonalInfoInputs";
import { PersonalInfoData } from "@/types/onboarding";

interface PersonalInfoFormProps {
  formData: PersonalInfoData;
  onChange: (field: keyof PersonalInfoData, value: string) => void;
  errors: Record<string, string>;
  isSubmitting: boolean;
  onSubmit?: () => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  formData,
  onChange,
  errors,
  isSubmitting,
  onSubmit
}) => {
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <PersonalInfoInputs
        formData={formData}
        onChange={onChange}
        disabled={isSubmitting}
        errors={errors}
      />
      
      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          onClick={onSubmit ? handleFormSubmit : undefined}
        >
          {isSubmitting ? "Salvando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
};
