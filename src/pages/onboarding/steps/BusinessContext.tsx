
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { toast } from "sonner";

import { BusinessModelField } from "@/components/onboarding/steps/business-context/inputs/BusinessModelField";
import { BusinessChallengesField } from "@/components/onboarding/steps/business-context/inputs/BusinessChallengesField";
import { ShortTermGoalsField } from "@/components/onboarding/steps/business-context/inputs/ShortTermGoalsField";
import { KpisField } from "@/components/onboarding/steps/business-context/inputs/KpisField";
import { AdditionalContextField } from "@/components/onboarding/steps/business-context/inputs/AdditionalContextField";

const BusinessContext = () => {
  const { saveStepData } = useOnboardingSteps();
  const navigate = useNavigate();
  const { progress, isLoading } = useProgress();

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

  if (isLoading) {
    return (
      <OnboardingLayout currentStep={3} title="Carregando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={3} 
      title="Contexto do Negócio"
      backUrl="/onboarding/business-goals"
    >
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

          <div className="flex justify-end pt-6">
            <Button type="submit" className="bg-[#0ABAB5] hover:bg-[#09a29d]" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Continuar"}
            </Button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
};

export default BusinessContext;
