
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ProfessionalData = () => {
  const { progress, isLoading, refreshProgress } = useProgress();
  const { saveStepData } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("ProfessionalData montado - carregando dados mais recentes");
    // Garantir que temos os dados mais recentes ao montar o componente
    refreshProgress();
  }, [refreshProgress]);

  const handleSubmit = async (stepId: string, data: any) => {
    setIsSubmitting(true);
    try {
      console.log("ProfessionalData - Salvando dados:", data);
      
      // Garantir navegação para a próxima página (force = true)
      await saveStepData(stepId, data, true);
      
      // Navegar para a próxima página após salvar
      setTimeout(() => {
        navigate("/onboarding/business-context");
      }, 500);
    } catch (error) {
      console.error("Erro ao salvar dados profissionais:", error);
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          </div>
        ) : (
          <ProfessionalDataStep
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            initialData={progress}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default ProfessionalData;
