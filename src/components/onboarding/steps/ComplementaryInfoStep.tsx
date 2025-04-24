
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormMessage } from "@/components/ui/form-message";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { OnboardingStepProps } from "@/types/onboarding";
import { DiscoverySourceSection } from "./complementary-info/DiscoverySourceSection";
import { PriorityTopicsSection } from "./complementary-info/PriorityTopicsSection";
import { PermissionsSection } from "./complementary-info/PermissionsSection";
import { complementaryInfoSchema, type ComplementaryInfoFormData } from "@/schemas/complementaryInfoSchema";
import { normalizeComplementaryInfo } from "@/hooks/onboarding/persistence/utils/complementaryInfoNormalization";

export const ComplementaryInfoStep = ({ 
  onSubmit, 
  isSubmitting, 
  initialData 
}: OnboardingStepProps) => {
  // Processamento seguro dos dados iniciais
  const processInitialData = () => {
    let complementaryInfo = {};
    
    if (initialData?.complementary_info) {
      complementaryInfo = normalizeComplementaryInfo(initialData.complementary_info);
    }
    
    return {
      how_found_us: complementaryInfo?.how_found_us || "",
      referred_by: complementaryInfo?.referred_by || "",
      authorize_case_usage: Boolean(complementaryInfo?.authorize_case_usage),
      interested_in_interview: Boolean(complementaryInfo?.interested_in_interview),
      priority_topics: Array.isArray(complementaryInfo?.priority_topics) ? 
        complementaryInfo.priority_topics : []
    };
  };
  
  const initialValues = processInitialData();
  
  console.log("Valores iniciais para ComplementaryInfoStep:", initialValues);
  
  const form = useForm<ComplementaryInfoFormData>({
    resolver: zodResolver(complementaryInfoSchema),
    defaultValues: initialValues
  });

  const handleFormSubmit = (data: ComplementaryInfoFormData) => {
    console.log("Enviando dados complementary_info:", { complementary_info: data });
    onSubmit('complementary_info', {
      complementary_info: data
    });
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

      {/* Botões de navegação */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Voltar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            "Processando..."
          ) : (
            <span className="flex items-center gap-2">
              Finalizar Onboarding
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
