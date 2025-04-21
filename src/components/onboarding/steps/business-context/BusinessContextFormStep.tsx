
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { useNavigate } from "react-router-dom";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { BusinessModelField } from "./inputs/BusinessModelField";
import { BusinessChallengesField } from "./inputs/BusinessChallengesField";
import { ShortTermGoalsField } from "./inputs/ShortTermGoalsField";
import { MediumTermGoalsField } from "./inputs/MediumTermGoalsField";
import { KpisField } from "./inputs/KpisField";
import { SubmitButton } from "./SubmitButton";
import { NavigationButtons } from "../NavigationButtons";
import { cn } from "@/lib/utils";

interface BusinessContextFormStepProps {
  progress: any;
}

type BusinessContextFormValues = {
  business_model: string;
  business_challenges: string[];
  short_term_goals: string[];
  medium_term_goals: string[];
  important_kpis: string[];
};

export const BusinessContextFormStep: React.FC<BusinessContextFormStepProps> = ({ progress }) => {
  const { saveStepData } = useOnboardingSteps();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<BusinessContextFormValues>({
    defaultValues: {
      business_model: progress?.business_context?.business_model || "",
      business_challenges: progress?.business_context?.business_challenges || [],
      short_term_goals: progress?.business_context?.short_term_goals || [],
      medium_term_goals: progress?.business_context?.medium_term_goals || [],
      important_kpis: progress?.business_context?.important_kpis || [],
    }
  });

  const onSubmit = async (data: BusinessContextFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Salvando dados de contexto de negócio:", data);
      
      // Salvamos sem navegação automática para permitir controle manual
      await saveStepData("business_context", {
        business_context: {
          business_model: data.business_model,
          business_challenges: data.business_challenges,
          short_term_goals: data.short_term_goals,
          medium_term_goals: data.medium_term_goals,
          important_kpis: data.important_kpis,
        }
      }, false);
      
      toast.success("Informações salvas com sucesso!");
      
      // Após salvar, podemos navegar manualmente
      navigate("/onboarding/ai-experience");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar as informações. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("max-w-4xl mx-auto space-y-10", isSubmitting ? "opacity-60 pointer-events-none" : "")}>
      <MilagrinhoMessage
        message="Beleza, agora precisamos conhecer melhor o contexto do seu negócio no Vivendo de IA. 😊 Isso vai me ajudar a identificar quais soluções de IA farão mais sentido para você. Como CEO, você vai adorar os conteúdos que temos específicos para sua área de atuação."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">

        {/* Contexto do Negócio */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="inline-block text-[#0ABAB5]">📋</span>
            Contexto do Negócio
          </h2>
          <BusinessModelField control={control} error={errors.business_model} />
        </section>

        {/* Desafios e Objetivos */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="inline-block text-[#0ABAB5]">🎯</span>
            Desafios e Objetivos
          </h2>
          <BusinessChallengesField control={control} error={errors.business_challenges} />
          <ShortTermGoalsField control={control} error={errors.short_term_goals} />
          <MediumTermGoalsField control={control} error={errors.medium_term_goals} />
        </section>

        {/* KPIs */}
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="inline-block text-[#0ABAB5]">📈</span>
            Indicadores de Performance
          </h2>
          <KpisField control={control} error={errors.important_kpis} />
        </section>

        {/* Navegação */}
        <NavigationButtons isSubmitting={isSubmitting} onPrevious={() => navigate("/onboarding/professional-data")} />
      </form>
    </div>
  );
};
