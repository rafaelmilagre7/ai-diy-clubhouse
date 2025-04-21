
import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
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
import { NavigationButtons } from "../NavigationButtons";
import { cn } from "@/lib/utils";

interface BusinessContextFormStepProps {
  progress: any;
  onSave?: (data: any) => void;
}

type BusinessContextFormValues = {
  business_model: string;
  business_challenges: string[];
  short_term_goals: string[];
  medium_term_goals: string[];
  important_kpis: string[];
  additional_context?: string;
};

export const BusinessContextFormStep: React.FC<BusinessContextFormStepProps> = ({ progress, onSave }) => {
  const { saveStepData } = useOnboardingSteps();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // Extrair valores iniciais de forma mais robusta
  const initialValues = {
    business_model: progress?.business_context?.business_model || "",
    business_challenges: progress?.business_context?.business_challenges || [],
    short_term_goals: progress?.business_context?.short_term_goals || [],
    medium_term_goals: progress?.business_context?.medium_term_goals || [],
    important_kpis: progress?.business_context?.important_kpis || [],
    additional_context: progress?.business_context?.additional_context || "",
  };

  console.log("Valores iniciais para Business Context:", initialValues);

  const methods = useForm<BusinessContextFormValues>({
    defaultValues: initialValues,
    mode: "onSubmit"
  });
  
  const { control, handleSubmit, formState: { errors, isDirty }, reset, getValues, watch } = methods;

  // Monitorar alterações no formulário para debug
  const formValues = watch();
  useEffect(() => {
    console.log("Valores atuais do formulário:", formValues);
  }, [formValues]);

  // Atualizar o formulário quando os dados iniciais mudarem
  useEffect(() => {
    if (progress?.business_context) {
      console.log("Atualizando formulário com dados do contexto do negócio:", progress.business_context);
      reset({
        business_model: progress.business_context.business_model || "",
        business_challenges: progress.business_context.business_challenges || [],
        short_term_goals: progress.business_context.short_term_goals || [],
        medium_term_goals: progress.business_context.medium_term_goals || [],
        important_kpis: progress.business_context.important_kpis || [],
        additional_context: progress.business_context.additional_context || "",
      });
    }
  }, [progress, reset]);

  // Adicionar função para salvar periodicamente dados do formulário
  useEffect(() => {
    // Salvar a cada 30 segundos se houver dados modificados
    const interval = setInterval(() => {
      if (isDirty) {
        const currentValues = getValues();
        // Verificar se há dados para salvar
        if (currentValues.business_model || 
            currentValues.business_challenges.length > 0 || 
            currentValues.short_term_goals.length > 0 || 
            currentValues.medium_term_goals.length > 0 || 
            currentValues.important_kpis.length > 0) {
          
          console.log("Auto-salvando dados do formulário:", currentValues);
          
          // Usar o callback de salvamento customizado se fornecido
          if (onSave) {
            onSave({
              business_context: currentValues
            });
          } else {
            saveStepData("business_context", {
              business_context: currentValues
            }, false).catch(err => 
              console.error("Erro no auto-save:", err)
            );
          }
          
          setLastAutoSave(new Date());
        }
      }
    }, 30000); // A cada 30 segundos
    
    return () => clearInterval(interval);
  }, [getValues, saveStepData, isDirty, onSave]);

  const onSubmit = async (data: BusinessContextFormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Salvando dados de contexto de negócio:", data);
      
      // Usar o callback de salvamento customizado se fornecido
      if (onSave) {
        await onSave({
          business_context: {
            business_model: data.business_model,
            business_challenges: data.business_challenges,
            short_term_goals: data.short_term_goals,
            medium_term_goals: data.medium_term_goals,
            important_kpis: data.important_kpis,
            additional_context: data.additional_context,
          }
        });
      } else {
        // Salvamos com navegação automática
        await saveStepData("business_context", {
          business_context: {
            business_model: data.business_model,
            business_challenges: data.business_challenges,
            short_term_goals: data.short_term_goals,
            medium_term_goals: data.medium_term_goals,
            important_kpis: data.important_kpis,
            additional_context: data.additional_context,
          }
        }, true);
      }
      
      toast.success("Informações salvas com sucesso!");
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
        message="Beleza, agora precisamos conhecer melhor o contexto do seu negócio no VIVER DE IA. 😊 Isso vai me ajudar a identificar quais soluções de IA farão mais sentido para você. Como CEO, você vai adorar os conteúdos que temos específicos para sua área de atuação."
      />

      {lastAutoSave && (
        <div className="text-xs text-gray-500 italic">
          Último salvamento automático: {lastAutoSave.toLocaleTimeString()}
        </div>
      )}

      <FormProvider {...methods}>
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
            <AdditionalContextField control={control} />
          </section>

          {/* Navegação */}
          <NavigationButtons 
            isSubmitting={isSubmitting} 
            onPrevious={() => navigate("/onboarding/professional-data")} 
          />
        </form>
      </FormProvider>
    </div>
  );
};
