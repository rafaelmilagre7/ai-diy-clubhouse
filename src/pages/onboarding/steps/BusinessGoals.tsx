
import React from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { CompanyInputs } from "@/components/onboarding/steps/business/CompanyInputs";
import { toast } from "sonner";
import { OnboardingData } from "@/types/onboarding";

type FormValues = {
  company_name: string;
  company_size: string;
  company_sector: string;
  company_website: string;
  current_position: string;
  annual_revenue: string;
};

const BusinessGoals = () => {
  const { saveStepData } = useOnboardingSteps();
  const navigate = useNavigate();
  const { progress, isLoading } = useProgress();
  
  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      company_name: progress?.company_name || '',
      company_size: progress?.company_size || '',
      company_sector: progress?.company_sector || '',
      company_website: progress?.company_website || '',
      current_position: progress?.current_position || '',
      annual_revenue: progress?.annual_revenue || '',
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Transformamos os dados para o formato esperado pelo saveStepData
      const professionalData: Partial<OnboardingData> = {
        professional_info: {
          company_name: data.company_name,
          company_size: data.company_size,
          company_sector: data.company_sector,
          company_website: data.company_website,
          current_position: data.current_position,
          annual_revenue: data.annual_revenue,
        }
      };
      
      await saveStepData("goals", professionalData);
      toast.success("Informações salvas com sucesso!");
      navigate("/onboarding/business-context");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar as informações. Tente novamente.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <OnboardingLayout currentStep={2} title="Carregando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={2} 
      title="Dados Profissionais"
      backUrl="/onboarding"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage 
          message="Agora vamos conhecer um pouco sobre sua empresa e seu papel profissional. Estas informações nos ajudarão a personalizar as soluções que mais se adaptam ao seu contexto de negócio."
        />
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <CompanyInputs 
            control={control} 
            errors={errors} 
            watch={watch}
          />

          <div className="flex justify-end pt-6">
            <Button type="submit" className="bg-[#0ABAB5] hover:bg-[#09a29d]" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Continuar"}
            </Button>
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
};

export default BusinessGoals;
