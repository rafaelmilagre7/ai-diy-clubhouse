
import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { CompanyNameField } from "./professional-inputs/CompanyNameField";
import { CompanySizeField } from "./professional-inputs/CompanySizeField";
import { CompanySectorField } from "./professional-inputs/CompanySectorField";
import { WebsiteField } from "./professional-inputs/WebsiteField";
import { CurrentPositionField } from "./professional-inputs/CurrentPositionField";
import { AnnualRevenueField } from "./professional-inputs/AnnualRevenueField";
import { NavigationButtons } from "../NavigationButtons";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { OnboardingStepProps } from "@/types/onboarding";

interface ProfessionalDataStepProps extends OnboardingStepProps {
  personalInfo?: any;
}

export const ProfessionalDataStep: React.FC<ProfessionalDataStepProps> = ({
  onSubmit,
  isSubmitting,
  initialData,
  isLastStep = false,
  onComplete,
  personalInfo
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const methods = useForm({
    defaultValues: {
      company_name: initialData?.company_name || initialData?.professional_info?.company_name || "",
      company_size: initialData?.company_size || initialData?.professional_info?.company_size || "",
      company_sector: initialData?.company_sector || initialData?.professional_info?.company_sector || "",
      company_website: initialData?.company_website || initialData?.professional_info?.company_website || "",
      current_position: initialData?.current_position || initialData?.professional_info?.current_position || "",
      annual_revenue: initialData?.annual_revenue || initialData?.professional_info?.annual_revenue || "",
    }
  });

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Organizar os dados no formato esperado pelo servidor
      const professionalData = {
        professional_info: {
          company_name: data.company_name,
          company_size: data.company_size,
          company_sector: data.company_sector,
          company_website: data.company_website,
          current_position: data.current_position,
          annual_revenue: data.annual_revenue,
        },
        // Adicionar também como campos diretos para compatibilidade
        company_name: data.company_name,
        company_size: data.company_size,
        company_sector: data.company_sector,
        company_website: data.company_website,
        current_position: data.current_position,
        annual_revenue: data.annual_revenue,
      };
      
      console.log("Enviando dados profissionais:", professionalData);
      await onSubmit("professional_data", professionalData);
    } catch (error) {
      console.error("Erro ao enviar dados profissionais:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CompanyNameField />
          <CurrentPositionField />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CompanySizeField />
          <CompanySectorField />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnnualRevenueField />
          <WebsiteField />
        </div>
        
        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            className="bg-[#0ABAB5] hover:bg-[#099388] text-white px-5 py-2"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? (
              "Salvando..."
            ) : (
              <span className="flex items-center gap-2">
                Salvar e Continuar
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
