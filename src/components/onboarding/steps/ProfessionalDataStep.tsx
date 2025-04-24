
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CompanyNameField } from "./professional-inputs/CompanyNameField";
import { CompanySizeField } from "./professional-inputs/CompanySizeField";
import { CompanySectorField } from "./professional-inputs/CompanySectorField";
import { WebsiteField } from "./professional-inputs/WebsiteField";
import { CurrentPositionField } from "./professional-inputs/CurrentPositionField";
import { AnnualRevenueField } from "./professional-inputs/AnnualRevenueField";
import { FormProvider } from "react-hook-form";
import { useProfessionalDataForm } from "./professional-inputs/useProfessionalDataForm";
import { OnboardingStepProps, ProfessionalDataInput } from "@/types/onboarding";
import { ArrowRight } from "lucide-react";

export const ProfessionalDataStep: React.FC<OnboardingStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isLastStep,
  onComplete
}) => {
  const { methods, formInitialized } = useProfessionalDataForm({ initialData });
  
  // Lidando com submissão do formulário
  const handleSubmit = (data: ProfessionalDataInput) => {
    console.log("Dados profissionais a serem enviados:", data);
    onSubmit("professional_data", {
      professional_info: data
    });
  };
  
  // Debug para verificar os dados iniciais
  useEffect(() => {
    console.log("ProfessionalDataStep initialData:", initialData);
  }, [initialData]);
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#15192C] mb-6">
            Dados Profissionais
          </h2>
          
          <div className="space-y-6">
            <CompanyNameField />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CompanySizeField />
              <CompanySectorField />
            </div>
            <WebsiteField />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CurrentPositionField />
              <AnnualRevenueField />
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
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
              className="bg-[#0ABAB5] hover:bg-[#099388] text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Salvando..."
              ) : (
                <span className="flex items-center gap-2">
                  {isLastStep ? "Finalizar" : "Próximo"}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
