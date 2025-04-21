
import React, { useEffect, useState } from "react";
import { OnboardingStepProps } from "@/types/onboarding";
import { InterestsSection } from "./ExperiencePersonalizationSections/InterestsSection";
import { TimePreferenceSection } from "./ExperiencePersonalizationSections/TimePreferenceSection";
import { AvailableDaysSection } from "./ExperiencePersonalizationSections/AvailableDaysSection";
import { NetworkingAvailabilitySection } from "./ExperiencePersonalizationSections/NetworkingAvailabilitySection";
import { SkillsToShareSection } from "./ExperiencePersonalizationSections/SkillsToShareSection";
import { MentorshipTopicsSection } from "./ExperiencePersonalizationSections/MentorshipTopicsSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useExperiencePersonalizationForm } from "./ExperiencePersonalizationSections/useExperiencePersonalizationForm";

export const ExperiencePersonalizationStep: React.FC<OnboardingStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isLastStep,
  onComplete,
}) => {
  // Estado para controlar se o formulário foi validado com erro alguma vez
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  // Inicializar dados do formulário com base nos dados iniciais
  useEffect(() => {
    if (initialData) {
      console.log("Dados iniciais de personalização:", initialData);
      setFormData(initialData.experience_personalization || {});
    }
  }, [initialData]);

  // Hook de formulário personalizado
  const {
    setValue,
    watch,
    handleSubmit,
    toggleSelect,
    isValid,
    formState: { errors }
  } = useExperiencePersonalizationForm(formData);

  // Valores atuais do formulário
  const formValues = watch();

  // Handler para envio do formulário
  const onFormSubmit = () => {
    setHasAttemptedSubmit(true);
    
    if (!isValid) {
      console.error("Formulário inválido. Campos faltando:", formValues);
      return;
    }

    const data = {
      experience_personalization: {
        interests: formValues.interests,
        time_preference: formValues.time_preference,
        available_days: formValues.available_days,
        networking_availability: formValues.networking_availability,
        skills_to_share: formValues.skills_to_share,
        mentorship_topics: formValues.mentorship_topics,
      },
    };

    console.log("Enviando dados de personalização:", data);
    onSubmit("experience_personalization", data);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          <InterestsSection
            selected={formValues.interests}
            onToggle={(value) => toggleSelect("interests", value)}
            hasError={hasAttemptedSubmit && (!formValues.interests || formValues.interests.length === 0)}
          />

          <TimePreferenceSection
            selected={formValues.time_preference}
            onToggle={(value) => toggleSelect("time_preference", value)}
            hasError={hasAttemptedSubmit && (!formValues.time_preference || formValues.time_preference.length === 0)}
          />

          <AvailableDaysSection
            selected={formValues.available_days}
            onToggle={(value) => toggleSelect("available_days", value)}
            hasError={hasAttemptedSubmit && (!formValues.available_days || formValues.available_days.length === 0)}
          />

          <NetworkingAvailabilitySection
            value={formValues.networking_availability}
            onChange={(value) => setValue("networking_availability", value, { shouldValidate: true })}
            hasError={hasAttemptedSubmit && formValues.networking_availability === undefined}
          />

          <SkillsToShareSection
            selected={formValues.skills_to_share}
            onToggle={(value) => toggleSelect("skills_to_share", value)}
            hasError={hasAttemptedSubmit && (!formValues.skills_to_share || formValues.skills_to_share.length === 0)}
          />

          <MentorshipTopicsSection
            selected={formValues.mentorship_topics}
            onToggle={(value) => toggleSelect("mentorship_topics", value)}
            hasError={hasAttemptedSubmit && (!formValues.mentorship_topics || formValues.mentorship_topics.length === 0)}
          />

          {hasAttemptedSubmit && !isValid && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              Por favor, preencha todos os campos obrigatórios para continuar.
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-[#0ABAB5] hover:bg-[#099388] text-white px-5 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Salvando..."
              ) : (
                <span className="flex items-center gap-2">
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
