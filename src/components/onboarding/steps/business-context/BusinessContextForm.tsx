
import React from "react";
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
      business_model: progress?.business_context?.business_model || progress?.business_data?.business_model || "",
      business_challenges: progress?.business_context?.business_challenges || progress?.business_data?.business_challenges || [],
      short_term_goals: progress?.business_context?.short_term_goals || progress?.business_data?.short_term_goals || [],
      medium_term_goals: progress?.business_context?.medium_term_goals || progress?.business_data?.medium_term_goals || [],
      important_kpis: progress?.business_context?.important_kpis || progress?.business_data?.important_kpis || [],
      additional_context: progress?.business_context?.additional_context || progress?.business_data?.additional_context || ""
    }
  });

  const onSubmit = async (data: any) => {
    try {
      // Formatando os dados para o formato esperado pelo saveStepData
      const businessContextData = {
        business_context: data
      };
      
      await saveStepData("business_context", businessContextData, true);
      toast.success("Informações salvas com sucesso!");
      
      // Forçar navegação para a próxima tela após sucesso
      setTimeout(() => {
        console.log("Verificando navegação após envio do contexto de negócio...");
        const currentPath = window.location.pathname;
        
        if (currentPath === "/onboarding/business-context") {
          console.log("Navegação não ocorreu automaticamente, forçando redirecionamento para experiência com IA");
          navigate("/onboarding/ai-experience");
        }
      }, 500);
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
        <MediumTermGoalsField control={control} error={errors.medium_term_goals} />
        <KpisField control={control} error={errors.important_kpis} />
        <AdditionalContextField control={control} />
        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
};
