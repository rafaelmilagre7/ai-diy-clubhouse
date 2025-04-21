
import React, { useState, useEffect } from "react";
import { CompanyInputs } from "./business/CompanyInputs";
import { OnboardingData } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";

interface ProfessionalDataStepProps {
  onSubmit: (stepId: string, data: Partial<OnboardingData>) => void;
  isSubmitting: boolean;
  isLastStep: boolean;
  onComplete: () => void;
  initialData?: any;
  personalInfo?: OnboardingData["personal_info"];
}

type FormValues = {
  company_name: string;
  company_size: string;
  company_sector: string;
  company_website: string;
  current_position: string;
  annual_revenue: string;
};

export const ProfessionalDataStep = ({
  onSubmit,
  isSubmitting,
  initialData,
  onComplete,
}: ProfessionalDataStepProps) => {
  const [formData, setFormData] = useState<FormValues>({
    company_name: "",
    company_size: "",
    company_sector: "",
    company_website: "",
    current_position: "",
    annual_revenue: "",
  });

  // Função para extrair dados relevantes do objeto initialData
  const extractFormData = (data: any): FormValues => {
    // Primeiro, tentamos pegar os dados do objeto principal
    // Depois, verificamos dentro de professional_info
    return {
      company_name: 
        data?.company_name || 
        data?.professional_info?.company_name || 
        "",
      company_size: 
        data?.company_size || 
        data?.professional_info?.company_size || 
        "",
      company_sector: 
        data?.company_sector || 
        data?.professional_info?.company_sector || 
        "",
      company_website: 
        data?.company_website || 
        data?.professional_info?.company_website || 
        "",
      current_position: 
        data?.current_position || 
        data?.professional_info?.current_position || 
        "",
      annual_revenue: 
        data?.annual_revenue || 
        data?.professional_info?.annual_revenue || 
        "",
    };
  };

  useEffect(() => {
    if (initialData) {
      console.log("Dados iniciais recebidos:", initialData);
      setFormData(extractFormData(initialData));
    }
  }, [initialData]);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    defaultValues: formData
  });

  // Atualizar o formulário quando os dados mudarem
  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  const onFormSubmit = (data: FormValues) => {
    const professionalData: Partial<OnboardingData> = {
      professional_info: {
        company_name: data.company_name,
        company_size: data.company_size,
        company_sector: data.company_sector,
        company_website: data.company_website,
        current_position: data.current_position,
        annual_revenue: data.annual_revenue,
      },
    };
    
    console.log("Enviando dados profissionais:", professionalData);
    onSubmit("professional_data", professionalData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#15192C] mb-6">
            Dados Profissionais
          </h2>
          
          <CompanyInputs 
            control={control}
            errors={errors}
          />
          
          <div className="flex justify-end mt-8">
            <Button
              type="submit"
              className="bg-[#0ABAB5] hover:bg-[#099388] text-white px-5 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Salvando..."
              ) : (
                <span className="flex items-center gap-2">
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
