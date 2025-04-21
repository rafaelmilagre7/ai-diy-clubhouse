
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { useNavigate } from "react-router-dom";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { BusinessModelField } from "./inputs/BusinessModelField";
import { BusinessChallengesField } from "./inputs/BusinessChallengesField";
import { ShortTermGoalsField } from "./inputs/ShortTermGoalsField";
import { KpisField } from "./inputs/KpisField";
import { AdditionalContextField } from "./inputs/AdditionalContextField";
import { SubmitButton } from "./SubmitButton";

interface BusinessContextFormProps {
  progress: any;
}

export const BusinessContextForm: React.FC<BusinessContextFormProps> = ({ progress }) => {
  const { saveStepData } = useOnboardingSteps();
  const navigate = useNavigate();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      business_model: progress?.business_context?.business_model || "",
      business_challenges: progress?.business_context?.business_challenges || [],
      short_term_goals: progress?.business_context?.short_term_goals || [],
      important_kpis: progress?.business_context?.important_kpis || [],
      additional_context: progress?.business_context?.additional_context || ""
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await saveStepData("business_context", data);
      toast.success("Informações salvas com sucesso!");
      navigate("/onboarding/ai-experience");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar as informações. Tente novamente.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <MilagrinhoMessage 
        message="Agora vamos entender melhor o contexto do seu negócio. Estas informações nos ajudarão a recomendar as soluções de IA mais adequadas para seus desafios específicos."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <BusinessModelField control={control} error={errors.business_model} />
        <BusinessChallengesField control={control} error={errors.business_challenges} />
        <ShortTermGoalsField control={control} error={errors.short_term_goals} />
        <KpisField control={control} error={errors.important_kpis} />
        <AdditionalContextField control={control} />
        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
};
