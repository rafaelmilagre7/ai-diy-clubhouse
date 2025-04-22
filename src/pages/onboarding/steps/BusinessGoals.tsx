
import React from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
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
  const { steps } = useOnboardingSteps();
  
  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      company_name: progress?.professional_info?.company_name || '',
      company_size: progress?.professional_info?.company_size || '',
      company_sector: progress?.professional_info?.company_sector || '',
      company_website: progress?.professional_info?.company_website || '',
      current_position: progress?.professional_info?.current_position || '',
      annual_revenue: progress?.professional_info?.annual_revenue || '',
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const professionalData = {
        company_name: data.company_name,
        company_size: data.company_size,
        company_sector: data.company_sector,
        company_website: data.company_website,
        current_position: data.current_position,
        annual_revenue: data.annual_revenue,
      };
      
      await saveStepData("professional_data", professionalData, true);
      toast.success("Informações salvas com sucesso!");
      navigate("/onboarding/business-context");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar as informações. Tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <OnboardingLayout 
        currentStep={2} 
        totalSteps={steps.length}
        title="Carregando..."
        progress={0}
        steps={steps}
        activeStep="professional_data"
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout 
      currentStep={2} 
      totalSteps={steps.length}
      title="Dados Profissionais"
      backUrl="/onboarding"
      progress={((2) / steps.length) * 100}
      steps={steps}
      activeStep="professional_data"
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
