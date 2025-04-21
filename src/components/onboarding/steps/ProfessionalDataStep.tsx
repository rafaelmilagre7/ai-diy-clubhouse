
import React, { useState, useEffect } from "react";
import { CompanyInputs } from "./business/CompanyInputs";
import { OnboardingData, ProfessionalDataInput } from "@/types/onboarding";
import { useForm } from "react-hook-form";
import { NavigationButtons } from "./NavigationButtons";
import { useNavigate } from "react-router-dom";

interface ProfessionalDataStepProps {
  onSubmit: (data: ProfessionalDataInput) => void;
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
  const navigate = useNavigate();
  
  // Extrair dados iniciais de forma mais robusta
  const extractFormData = (data: any): FormValues => {
    console.log("Extraindo dados profissionais de:", data);
    
    // Verificar onde os dados estão armazenados - podem estar em diferentes locais devido à estrutura do banco
    const profData = {
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
    
    console.log("Dados extraídos:", profData);
    return profData;
  };

  // Usar useForm com defaultValues
  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<FormValues>({
    defaultValues: initialData ? extractFormData(initialData) : {
      company_name: "",
      company_size: "",
      company_sector: "",
      company_website: "",
      current_position: "",
      annual_revenue: "",
    }
  });

  // Monitorar valores do formulário para debug
  const formValues = watch();
  console.log("Valores atuais do formulário:", formValues);

  // Atualizar formulário quando dados iniciais mudarem
  useEffect(() => {
    if (initialData) {
      console.log("Atualizando formulário com dados:", initialData);
      const extractedData = extractFormData(initialData);
      console.log("Dados extraídos para reset do formulário:", extractedData);
      reset(extractedData);
    }
  }, [initialData, reset]);

  // Função para voltar à etapa anterior
  const handlePreviousStep = () => {
    navigate("/onboarding");
  };

  const onFormSubmit = (data: FormValues) => {
    console.log("Formulário submetido com dados:", data);
    
    // Estrutura correta para salvar os dados profissionais
    const professionalData: ProfessionalDataInput = {
      professional_info: {
        company_name: data.company_name,
        company_size: data.company_size,
        company_sector: data.company_sector,
        company_website: data.company_website,
        current_position: data.current_position,
        annual_revenue: data.annual_revenue,
      },
      // Incluir como campos diretos para compatibilidade
      company_name: data.company_name,
      company_size: data.company_size,
      company_sector: data.company_sector,
      company_website: data.company_website,
      current_position: data.current_position,
      annual_revenue: data.annual_revenue
    };
    
    console.log("Enviando dados profissionais para salvar:", professionalData);
    onSubmit(professionalData);
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
            <NavigationButtons 
              isSubmitting={isSubmitting}
              onPrevious={handlePreviousStep}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
