import React, { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useNavigate } from "react-router-dom";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { PersonalInfoStep } from "@/components/onboarding/steps/PersonalInfoStep";
import { toast } from "sonner";

const PersonalInfo = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, isLoading } = useProgress();
  const { saveStepData } = useOnboardingSteps();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <OnboardingLayout currentStep={1} title="Carregando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
        </div>
      </OnboardingLayout>
    );
  }
  
  const handleSavePersonalInfo = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      console.log("Salvando dados pessoais:", data);
      await saveStepData("personal", data, true);
      console.log("Dados pessoais salvos com sucesso");
      
      toast.success("Dados salvos com sucesso!", {
        description: "Avançando para os dados profissionais..."
      });
      
      setTimeout(() => {
        navigate("/onboarding/professional-data");
      }, 750);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout currentStep={1} title="Dados Pessoais" backUrl="/">
      <PersonalInfoStep
        onSubmit={handleSavePersonalInfo}
        isSubmitting={isSubmitting}
        initialData={progress?.personal_info}
      />
    </OnboardingLayout>
  );
};

export default PersonalInfo;
