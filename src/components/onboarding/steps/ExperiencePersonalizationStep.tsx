
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useExperiencePersonalizationForm } from "./ExperiencePersonalizationSections/useExperiencePersonalizationForm";
import { InterestsSection } from "./ExperiencePersonalizationSections/InterestsSection";
import { TimePreferenceSection } from "./ExperiencePersonalizationSections/TimePreferenceSection";
import { AvailableDaysSection } from "./ExperiencePersonalizationSections/AvailableDaysSection";
import { NetworkingAvailabilitySection } from "./ExperiencePersonalizationSections/NetworkingAvailabilitySection";
import { SkillsToShareSection } from "./ExperiencePersonalizationSections/SkillsToShareSection";
import { MentorshipTopicsSection } from "./ExperiencePersonalizationSections/MentorshipTopicsSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ExperiencePersonalizationStepProps {
  onSubmit: (stepId: string, data: any) => void;
  isSubmitting: boolean;
  initialData?: any;
  isLastStep?: boolean;
  onComplete?: () => void;
}

export const ExperiencePersonalizationStep: React.FC<ExperiencePersonalizationStepProps> = ({
  onSubmit, isSubmitting, initialData = {}, isLastStep = false, onComplete
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
    isValid,
    toggleSelect
  } = useExperiencePersonalizationForm(initialData);

  const [attemptedSubmit, setAttemptedSubmit] = React.useState(false);

  const handleFormSubmit = (formData: any) => {
    if (isValid) {
      onSubmit("experience_personalization", { experience_personalization: formData });
    } else {
      setAttemptedSubmit(true);
    }
  };

  // Esta variável determina se mostramos os erros de validação
  // Mostraremos se o usuário tentou enviar o formulário OU se algum campo já foi modificado
  const showValidationErrors = attemptedSubmit;

  // Logs para depuração
  useEffect(() => {
    console.log("isValid:", isValid);
    console.log("initialData:", initialData);
    console.log("Current form values:", watch());
  }, [isValid, initialData, watch]);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {attemptedSubmit && !isValid && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Por favor, preencha todos os campos obrigatórios para continuar.
          </AlertDescription>
        </Alert>
      )}

      <InterestsSection 
        watch={watch} 
        toggleSelect={toggleSelect} 
        errors={errors} 
        showErrors={showValidationErrors} 
      />
      
      <TimePreferenceSection 
        control={control} 
        watch={watch} 
        toggleSelect={toggleSelect} 
        errors={errors} 
        showErrors={showValidationErrors} 
      />
      
      <AvailableDaysSection 
        watch={watch} 
        toggleSelect={toggleSelect} 
        errors={errors} 
        showErrors={showValidationErrors} 
      />
      
      <NetworkingAvailabilitySection 
        control={control} 
        errors={errors} 
        showErrors={showValidationErrors} 
      />
      
      <SkillsToShareSection 
        watch={watch} 
        toggleSelect={toggleSelect} 
        errors={errors} 
        showErrors={showValidationErrors} 
      />
      
      <MentorshipTopicsSection 
        watch={watch} 
        toggleSelect={toggleSelect} 
        errors={errors} 
        showErrors={showValidationErrors} 
      />
      
      <div className="pt-6 flex justify-end">
        <Button
          type="submit"
          className="min-w-[120px] bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          disabled={isSubmitting || (!isValid && attemptedSubmit)}
        >
          {isSubmitting ? (
            "Salvando..."
          ) : (
            <span className="flex items-center gap-2">
              {isLastStep ? "Finalizar" : "Próximo"}
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
