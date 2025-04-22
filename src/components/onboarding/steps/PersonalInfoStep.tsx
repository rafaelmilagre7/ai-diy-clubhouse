
import React from "react";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { Button } from "@/components/ui/button";
import { NavigationButtons } from "../NavigationButtons";
import { AutoSaveFeedback } from "../AutoSaveFeedback";

export interface PersonalInfoStepProps {
  formData: any;
  errors: Record<string, string>;
  isSubmitting: boolean;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  readOnly?: boolean;
  isSaving?: boolean;
  lastSaveTime?: number | null;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  formData,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  readOnly = false,
  isSaving,
  lastSaveTime
}) => {
  // Adicionar log para depuração
  console.log("[DEBUG] PersonalInfoStep props:", { isSubmitting, readOnly });

  return (
    <form onSubmit={e => {
      e.preventDefault();
      onSubmit();
    }} className="space-y-6">
      <PersonalInfoForm
        formData={formData}
        errors={errors}
        onChange={onChange}
        readOnly={readOnly}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />
      
      {isSaving !== undefined && lastSaveTime !== undefined && (
        <div className="flex justify-end mb-2">
          <AutoSaveFeedback isSaving={!!isSaving} lastSaveTime={lastSaveTime} />
        </div>
      )}
      
      {!readOnly && (
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          >
            {isSubmitting ? "Salvando..." : "Salvar e avançar"}
          </Button>
        </div>
      )}
    </form>
  );
};
