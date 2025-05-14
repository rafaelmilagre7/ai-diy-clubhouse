
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormMessage } from "@/components/ui/form-message";
import { OnboardingStepProps } from "@/types/onboarding";
import { DiscoverySourceSection } from "./complementary-info/DiscoverySourceSection";
import { PriorityTopicsSection } from "./complementary-info/PriorityTopicsSection";
import { PermissionsSection } from "./complementary-info/PermissionsSection";
import { complementaryInfoSchema, type ComplementaryInfoFormData } from "@/schemas/complementaryInfoSchema";
import { normalizeComplementaryInfo, NormalizedComplementaryInfo } from "@/hooks/onboarding/persistence/utils/complementaryInfoNormalization";
import { NavigationButtons } from "../NavigationButtons";

export const ComplementaryInfoStep = ({ 
  onSubmit, 
  isSubmitting, 
  initialData,
  onComplete
}: OnboardingStepProps) => {
  // Processamento seguro dos dados iniciais
  const processInitialData = (): ComplementaryInfoFormData => {
    try {
      console.log("[ComplementaryInfoStep] Processando dados iniciais:", initialData);
      
      // CORREÇÃO: Usar a função de normalização para garantir dados consistentes
      const normalizedData: NormalizedComplementaryInfo = normalizeComplementaryInfo(
        initialData?.complementary_info || {}
      );
      
      console.log("[ComplementaryInfoStep] Dados normalizados:", normalizedData);
      
      return {
        how_found_us: normalizedData.how_found_us || "",
        referred_by: normalizedData.referred_by || "",
        authorize_case_usage: Boolean(normalizedData.authorize_case_usage),
        interested_in_interview: Boolean(normalizedData.interested_in_interview),
        priority_topics: Array.isArray(normalizedData.priority_topics) ? 
          normalizedData.priority_topics : []
      };
    } catch (error) {
      console.error("[ComplementaryInfoStep] Erro ao processar dados iniciais:", error);
      // Retornar valores padrão em caso de erro
      return {
        how_found_us: "",
        referred_by: "",
        authorize_case_usage: false,
        interested_in_interview: false,
        priority_topics: []
      };
    }
  };
  
  const initialValues = processInitialData();
  
  console.log("[ComplementaryInfoStep] Valores iniciais:", initialValues);
  
  const form = useForm<ComplementaryInfoFormData>({
    resolver: zodResolver(complementaryInfoSchema),
    defaultValues: initialValues
  });

  const handleFormSubmit = (data: ComplementaryInfoFormData) => {
    console.log("[ComplementaryInfoStep] Enviando dados:", data);
    
    // CORREÇÃO: Garantir que os dados são enviados no formato e caminho corretos
    onSubmit('complementary_info', {
      complementary_info: data
    });
  };

  const handlePrevious = () => {
    console.log("[ComplementaryInfoStep] Navegando para a etapa anterior");
    // Navegar para a etapa anterior via URL fornecida pelo componente pai
    window.history.back();
  };

  const { formState: { errors } } = form;

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
      <div className="space-y-6">
        <DiscoverySourceSection form={form} />
        <PriorityTopicsSection form={form} />
        <PermissionsSection form={form} />
      </div>

      {/* Mostrar erros gerais do formulário */}
      {Object.keys(errors).length > 0 && (
        <div className="text-red-500 text-sm">
          {Object.entries(errors).map(([key, error]) => (
            <FormMessage key={key} type="error" message={error.message} />
          ))}
        </div>
      )}

      {/* Botões de navegação corrigidos para usar o componente NavigationButtons  */}
      <NavigationButtons
        isSubmitting={isSubmitting}
        onPrevious={handlePrevious}
        submitText="Finalizar Onboarding"
        loadingText="Processando..."
        showPrevious={true}
        previousDisabled={false}
        className="mt-6"
      />
    </form>
  );
};
