import React from "react";
import { useForm, Controller } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { OnboardingData } from "@/types/onboarding";
import { AIKnowledgeLevelField } from "./ai-experience/AIKnowledgeLevelField";
import { AIToolsField } from "./ai-experience/AIToolsField";
import { AIImplementedSolutionsField } from "./ai-experience/AIImplementedSolutionsField";
import { AIDesiredSolutionsField } from "./ai-experience/AIDesiredSolutionsField";
import { AIPreviousAttemptsField } from "./ai-experience/AIPreviousAttemptsField";
import { AIFormationQuestions } from "./ai-experience/AIFormationQuestions";
import { AINPSField } from "./ai-experience/AINPSField";
import { AISuggestionsField } from "./ai-experience/AISuggestionsField";

interface AIExperienceFormStepProps {
  initialData?: OnboardingData["ai_experience"];
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep?: boolean;
  onComplete?: () => void;
}

export const AIExperienceFormStep: React.FC<AIExperienceFormStepProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  isLastStep,
  onComplete,
}) => {
  const { control, handleSubmit, watch } = useForm({
    defaultValues: {
      knowledge_level: initialData?.knowledge_level || "",
      previous_tools: initialData?.previous_tools || [],
      implemented_solutions: initialData?.implemented_solutions || [],
      desired_solutions: initialData?.desired_solutions || [],
      previous_attempts: initialData?.previous_attempts || "",
      completed_formation: initialData?.completed_formation || false,
      is_member_for_month: initialData?.is_member_for_month || false,
      nps_score: initialData?.nps_score || 5,
      improvement_suggestions: initialData?.improvement_suggestions || "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit("ai_exp", { ai_experience: data })
      )}
      className="space-y-10"
    >
      <AIKnowledgeLevelField control={control} />
      <AIToolsField control={control} />
      <AIImplementedSolutionsField control={control} />
      <AIDesiredSolutionsField control={control} />
      <AIPreviousAttemptsField control={control} />
      <AIFormationQuestions control={control} />
      <AINPSField control={control} />
      <AISuggestionsField control={control} />

      <Button
        type="submit"
        className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Salvando..." : isLastStep ? "Finalizar" : "Continuar"}
      </Button>
    </form>
  );
};
