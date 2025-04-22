
import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { CompanyNameField } from "./professional-inputs/CompanyNameField";
import { CompanySizeField } from "./professional-inputs/CompanySizeField";
import { CompanySectorField } from "./professional-inputs/CompanySectorField";
import { WebsiteField } from "./professional-inputs/WebsiteField";
import { CurrentPositionField } from "./professional-inputs/CurrentPositionField";
import { AnnualRevenueField } from "./professional-inputs/AnnualRevenueField";
import { NavigationButtons } from "../NavigationButtons";
import { ProfessionalDataInput } from "@/types/onboarding";

interface ProfessionalDataStepProps {
  onSubmit: (data: ProfessionalDataInput) => Promise<void>;
  isSubmitting: boolean;
  isLastStep?: boolean;
  onComplete?: () => void;
  initialData?: ProfessionalDataInput;
  personalInfo?: any;
}

export const ProfessionalDataStep: React.FC<ProfessionalDataStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
}) => {
  const methods = useForm<ProfessionalDataInput>({
    defaultValues: {
      company_name: initialData?.company_name || "",
      company_size: initialData?.company_size || "",
      company_sector: initialData?.company_sector || "",
      company_website: initialData?.company_website || "",
      current_position: initialData?.current_position || "",
      annual_revenue: initialData?.annual_revenue || "",
    },
  });

  const handleSubmit = async (data: ProfessionalDataInput) => {
    try {
      console.log("Enviando dados profissionais:", data);
      await onSubmit(data);
    } catch (error) {
      console.error("Erro ao enviar dados profissionais:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CompanyNameField />
          <CompanySizeField />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CompanySectorField />
          <WebsiteField />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CurrentPositionField />
          <AnnualRevenueField />
        </div>
        
        <NavigationButtons
          isSubmitting={isSubmitting}
          submitText="Salvar e Continuar"
          loadingText="Salvando..."
        />
      </form>
    </FormProvider>
  );
};
