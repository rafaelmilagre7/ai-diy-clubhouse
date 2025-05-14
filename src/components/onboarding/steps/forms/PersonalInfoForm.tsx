
import React from "react";
import { SubmitButton } from "../business-context/SubmitButton";
import { PersonalInfoInputs } from "../PersonalInfoInputs";
import { OnboardingProgress } from "@/types/onboarding";

interface PersonalInfoFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  initialData?: OnboardingProgress | null;
  formData?: any;
  errors?: any;
  onChange?: (field: string, value: string) => void;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  formData,
  errors = {},
  onChange = () => {},
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <PersonalInfoInputs 
        formData={formData}
        onChange={onChange}
        disabled={isSubmitting}
        errors={errors}
      />
      <div className="flex justify-end pt-4">
        <SubmitButton isSubmitting={isSubmitting} text="Salvar e Continuar" />
      </div>
    </form>
  );
};
