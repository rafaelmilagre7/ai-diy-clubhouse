
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
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";
import { normalizeExperiencePersonalization } from "@/hooks/onboarding/persistence/utils/experiencePersonalizationNormalization";

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
      console.log("[ExperiencePersonalizationStep] Dados iniciais recebidos:", initialData);
      
      // Extrair dados de experiência de personalização do initialData usando função de normalização
      const experienceData = normalizeExperiencePersonalization(initialData.experience_personalization);
      
      console.log("[ExperiencePersonalizationStep] Dados normalizados para inicialização do formulário:", 
        experienceData);
      setFormData(experienceData);
    }
  }, [initialData]);

  // Hook de formulário personalizado
  const {
    control,
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
    
    // Verificar se todos os campos requeridos estão preenchidos
    if (!isValid) {
      console.error("[ExperiencePersonalizationStep] Formulário inválido. Campos faltando:", errors);
      return;
    }

    // Construir objeto de dados para envio
    const data = {
      interests: formValues.interests || [],
      time_preference: formValues.time_preference || [],
      available_days: formValues.available_days || [],
      networking_availability: typeof formValues.networking_availability === 'number' ? 
                             formValues.networking_availability : 5,
      skills_to_share: formValues.skills_to_share || [],
      mentorship_topics: formValues.mentorship_topics || [],
    };

    console.log("[ExperiencePersonalizationStep] Enviando dados de personalização:", data);
    
    // CORREÇÃO: Garantir que os dados são enviados com a estrutura correta
    onSubmit("experience_personalization", data);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          <InterestsSection
            watch={watch}
            toggleSelect={toggleSelect}
            errors={errors}
            showErrors={hasAttemptedSubmit}
          />

          <TimePreferenceSection
            control={control}
            watch={watch}
            toggleSelect={toggleSelect}
            errors={errors}
            showErrors={hasAttemptedSubmit}
          />

          <AvailableDaysSection
            watch={watch}
            toggleSelect={toggleSelect}
            errors={errors}
            showErrors={hasAttemptedSubmit}
          />

          <NetworkingAvailabilitySection
            control={control}
            errors={errors}
            showErrors={hasAttemptedSubmit}
          />

          <SkillsToShareSection
            watch={watch}
            toggleSelect={toggleSelect}
            errors={errors}
            showErrors={hasAttemptedSubmit}
          />

          <MentorshipTopicsSection
            watch={watch}
            toggleSelect={toggleSelect}
            errors={errors}
            showErrors={hasAttemptedSubmit}
          />

          {hasAttemptedSubmit && !isValid && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              Por favor, preencha todos os campos obrigatórios para continuar.
            </div>
          )}

          <NavigationButtons
            isSubmitting={isSubmitting}
            submitText="Próximo"
            loadingText="Salvando..."
            showPrevious={true}
            className="mt-8"
          />
        </form>
      </div>
    </div>
  );
};
