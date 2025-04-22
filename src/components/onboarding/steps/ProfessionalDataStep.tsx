
import React, { useState } from "react";
import { FormProvider } from "react-hook-form";
import { useProfessionalDataForm } from "./professional-inputs/useProfessionalDataForm";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";
import { FormValidationErrors } from "./professional-inputs/FormValidationErrors";
import { ProfessionalDataFields } from "./professional-inputs/ProfessionalDataFields";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { OnboardingStepProps } from "@/types/onboarding";

interface ProfessionalDataStepProps extends OnboardingStepProps {
  personalInfo?: any;
  onPrevious?: () => void;
}

export const ProfessionalDataStep: React.FC<ProfessionalDataStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isLastStep = false,
  onComplete,
  personalInfo,
  onPrevious
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { methods, formInitialized } = useProfessionalDataForm({ initialData });

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setValidationErrors([]);
    try {
      const errors: string[] = [];
      if (!data.company_name?.trim()) errors.push("Nome da empresa é obrigatório");
      if (!data.company_size) errors.push("Tamanho da empresa é obrigatório");
      if (!data.company_sector) errors.push("Setor de atuação é obrigatório");
      if (!data.current_position?.trim()) errors.push("Cargo atual é obrigatório");
      if (!data.annual_revenue) errors.push("Faturamento anual é obrigatório");
      if (errors.length > 0) {
        setValidationErrors(errors);
        setIsLoading(false);
        return;
      }
      await onSubmit("professional_data", data);
      toast.success("Dados salvos com sucesso!");
    } catch (error) {
      setValidationErrors(["Falha ao salvar dados. Por favor, tente novamente."]);
      toast.error("Erro ao salvar dados");
    } finally {
      setIsLoading(false);
    }
  };

  if (!formInitialized && !initialData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#0ABAB5] mr-2" />
        <span className="text-gray-300">Carregando seus dados...</span>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
        <FormValidationErrors errors={validationErrors} />
        <ProfessionalDataFields />
        <NavigationButtons 
          isSubmitting={isSubmitting || isLoading}
          submitText="Próximo Passo"
          loadingText="Salvando..."
          showPrevious={true}
          onPrevious={onPrevious}
        />
      </form>
    </FormProvider>
  );
};
