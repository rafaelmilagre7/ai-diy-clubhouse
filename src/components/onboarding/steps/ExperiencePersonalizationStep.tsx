
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useExperiencePersonalizationForm } from "./ExperiencePersonalizationSections/useExperiencePersonalizationForm";
import { InterestsSection } from "./ExperiencePersonalizationSections/InterestsSection";
import { TimePreferenceSection } from "./ExperiencePersonalizationSections/TimePreferenceSection";
import { AvailableDaysSection } from "./ExperiencePersonalizationSections/AvailableDaysSection";
import { NetworkingAvailabilitySection } from "./ExperiencePersonalizationSections/NetworkingAvailabilitySection";
import { SkillsToShareSection } from "./ExperiencePersonalizationSections/SkillsToShareSection";
import { MentorshipTopicsSection } from "./ExperiencePersonalizationSections/MentorshipTopicsSection";

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
    formState: { errors },
    isValid,
    toggleSelect
  } = useExperiencePersonalizationForm(initialData);

  const handleFormSubmit = (formData: any) => {
    console.log("Tentando enviar o formulário:", formData, "isValid:", isValid);
    onSubmit("experience_personalization", { experience_personalization: formData });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <InterestsSection watch={watch} toggleSelect={toggleSelect} errors={errors} />
      <TimePreferenceSection control={control} watch={watch} toggleSelect={toggleSelect} errors={errors} />
      <AvailableDaysSection watch={watch} toggleSelect={toggleSelect} errors={errors} />
      <NetworkingAvailabilitySection control={control} errors={errors} />
      <SkillsToShareSection watch={watch} toggleSelect={toggleSelect} errors={errors} />
      <MentorshipTopicsSection watch={watch} toggleSelect={toggleSelect} errors={errors} />
      <div className="pt-6 flex justify-end">
        <Button
          type="submit"
          className="min-w-[120px] bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
          disabled={isSubmitting || !isValid}
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
