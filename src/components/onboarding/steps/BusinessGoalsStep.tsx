import React, { useState, useEffect } from "react";
import { CompanyInputs } from "./business/CompanyInputs";
import { OnboardingData, OnboardingStepProps } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useForm, FieldErrors } from "react-hook-form";
type FormValues = {
  company_name: string;
  company_size: string;
  company_sector: string;
  company_website: string;
  current_position: string;
  annual_revenue: string;
};
export const BusinessGoalsStep: React.FC<OnboardingStepProps> = ({
  onSubmit,
  isSubmitting,
  isLastStep,
  onComplete,
  initialData,
  personalInfo,
  onPrevious
}) => {
  const {
    control,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm<FormValues>({
    defaultValues: {
      company_name: initialData?.company_name || initialData?.professional_info?.company_name || "",
      company_size: initialData?.company_size || initialData?.professional_info?.company_size || "",
      company_sector: initialData?.company_sector || initialData?.professional_info?.company_sector || "",
      company_website: initialData?.company_website || initialData?.professional_info?.company_website || "",
      current_position: initialData?.current_position || initialData?.professional_info?.current_position || "",
      annual_revenue: initialData?.annual_revenue || initialData?.professional_info?.annual_revenue || ""
    }
  });
  useEffect(() => {
    // Atualizar os estados quando os dados iniciais mudarem
    if (initialData) {
      console.log("Dados iniciais de empresa:", initialData);
    }
  }, [initialData]);
  const onFormSubmit = async (data: FormValues) => {
    const professionalData: Partial<OnboardingData> = {
      professional_info: {
        company_name: data.company_name,
        company_size: data.company_size,
        company_sector: data.company_sector,
        company_website: data.company_website,
        current_position: data.current_position,
        annual_revenue: data.annual_revenue
      }
    };
    console.log("Enviando dados profissionais:", professionalData);
    await onSubmit("goals", professionalData);
  };
  return <div className="space-y-6">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="rounded-lg border border-gray-100 p-6 shadow-sm bg-gray-900">
          <h2 className="text-xl font-semibold text-[#15192C] mb-6">
            Dados Profissionais
          </h2>
          
          <CompanyInputs control={control} errors={errors} />
          
          <div className="flex justify-between mt-8">
            {onPrevious && <Button type="button" variant="outline" onClick={onPrevious} disabled={isSubmitting}>
                Voltar
              </Button>}
            
            <Button type="submit" className="bg-[#0ABAB5] hover:bg-[#099388] text-white px-5 py-2 ml-auto" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : <span className="flex items-center gap-2">
                  Próximo
                  <ArrowRight className="h-4 w-4" />
                </span>}
            </Button>
          </div>
        </div>
      </form>
    </div>;
};