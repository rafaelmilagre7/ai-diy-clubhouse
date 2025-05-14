
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OnboardingStepProps } from "@/types/onboarding";
import { DynamicItemsInput } from "../common/DynamicItemsInput";
import { getBusinessContextFromProgress } from "@/hooks/onboarding/persistence/businessContextBuilder";
import { toast } from "sonner";

export const BusinessContextStep: React.FC<OnboardingStepProps> = ({ 
  onSubmit, 
  isSubmitting, 
  initialData,
  onPrevious
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Usar getBusinessContextFromProgress para normalizar dados iniciais
  const normalizedData = React.useMemo(() => {
    console.log("[BusinessContextStep] Normalizando dados iniciais:", initialData);
    return getBusinessContextFromProgress(initialData);
  }, [initialData]);
  
  const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    defaultValues: {
      business_model: "",
      business_challenges: [""],
      short_term_goals: [""],
      medium_term_goals: [""],
      important_kpis: [""],
      additional_context: ""
    }
  });

  // Preencher o formulário com os dados normalizados quando disponíveis
  useEffect(() => {
    if (normalizedData) {
      console.log("[BusinessContextStep] Preenchendo formulário com dados normalizados:", normalizedData);
      
      // Definir valores iniciais no formulário
      setValue("business_model", normalizedData.business_model || "");
      
      // Garantir que arrays estejam no formato correto (mesmo vazios)
      setValue("business_challenges", 
        Array.isArray(normalizedData.business_challenges) && normalizedData.business_challenges.length > 0 
          ? normalizedData.business_challenges 
          : [""]
      );
      
      setValue("short_term_goals", 
        Array.isArray(normalizedData.short_term_goals) && normalizedData.short_term_goals.length > 0 
          ? normalizedData.short_term_goals 
          : [""]
      );
      
      setValue("medium_term_goals", 
        Array.isArray(normalizedData.medium_term_goals) && normalizedData.medium_term_goals.length > 0 
          ? normalizedData.medium_term_goals 
          : [""]
      );
      
      setValue("important_kpis", 
        Array.isArray(normalizedData.important_kpis) && normalizedData.important_kpis.length > 0 
          ? normalizedData.important_kpis 
          : [""]
      );
      
      setValue("additional_context", normalizedData.additional_context || "");
      
      // Marcar como carregado
      setIsLoading(false);
    } else {
      console.log("[BusinessContextStep] Sem dados iniciais, usando valores padrão");
      setIsLoading(false);
    }
  }, [normalizedData, setValue]);

  const onFormSubmit = async (data: any) => {
    try {
      // Log detalhado de ação de usuário
      console.log("[BusinessContextStep] Enviando formulário com dados:", data);
      
      setIsSaving(true);
      
      // Garantir que todos os arrays tenham valores válidos (remover strings vazias)
      const cleanedData = {
        ...data,
        business_challenges: data.business_challenges?.filter((item: string) => item.trim() !== "") || [],
        short_term_goals: data.short_term_goals?.filter((item: string) => item.trim() !== "") || [],
        medium_term_goals: data.medium_term_goals?.filter((item: string) => item.trim() !== "") || [],
        important_kpis: data.important_kpis?.filter((item: string) => item.trim() !== "") || []
      };
      
      // Salvar usando o formato padronizado
      await onSubmit("business_context", cleanedData);
      console.log("[BusinessContextStep] Dados salvos com sucesso");
    } catch (error) {
      console.error("[BusinessContextStep] Erro ao enviar formulário:", error);
      toast.error("Ocorreu um erro ao salvar os dados. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // Exibir estado de carregamento enquanto os dados são preparados
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="spinner h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-300">Carregando dados...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="business_model" className="text-lg font-medium text-white">
            Qual é o modelo de negócio da sua empresa?
          </Label>
          <Controller
            name="business_model"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Descreva como sua empresa gera valor e receita..."
                className="mt-2 h-24"
              />
            )}
          />
        </div>

        <DynamicItemsInput
          control={control}
          name="business_challenges"
          label="Quais são os principais desafios do seu negócio hoje?"
          placeholder="Ex: Aumentar conversão de leads, Melhorar processo de vendas..."
          buttonText="Adicionar desafio"
          watch={watch}
        />

        <DynamicItemsInput
          control={control}
          name="short_term_goals"
          label="Quais são os objetivos de curto prazo (próximos 3 meses)?"
          placeholder="Ex: Implementar automação de marketing, Treinar equipe de vendas..."
          buttonText="Adicionar objetivo"
          watch={watch}
        />

        <DynamicItemsInput
          control={control}
          name="medium_term_goals"
          label="E os objetivos de médio prazo (6 a 12 meses)?"
          placeholder="Ex: Expandir para novos mercados, Lançar novo produto..."
          buttonText="Adicionar objetivo"
          watch={watch}
        />

        <DynamicItemsInput
          control={control}
          name="important_kpis"
          label="Quais KPIs são mais importantes para o seu negócio?"
          placeholder="Ex: Taxa de conversão, LTV, CAC..."
          buttonText="Adicionar KPI"
          watch={watch}
        />

        <div>
          <Label htmlFor="additional_context" className="text-lg font-medium text-white">
            Informações adicionais sobre o seu negócio
          </Label>
          <Controller
            name="additional_context"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder="Qualquer contexto adicional que queira compartilhar..."
                className="mt-2 h-24"
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button 
          type="button" 
          onClick={onPrevious}
          variant="outline"
          disabled={isSaving || isSubmitting}
        >
          Anterior
        </Button>
        <Button 
          type="submit" 
          disabled={isSaving || isSubmitting}
          className="bg-primary hover:bg-primary/90"
        >
          {isSaving || isSubmitting ? (
            <>
              <span className="mr-2">Salvando...</span>
              <div className="spinner h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </>
          ) : (
            "Continuar"
          )}
        </Button>
      </div>
    </form>
  );
};
