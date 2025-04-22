
import React, { useState, useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ProfessionalDataStep } from "@/components/onboarding/steps/ProfessionalDataStep";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { navigateAfterStep } from "@/hooks/onboarding/persistence/stepNavigator";
import { ProfessionalDataInput } from "@/types/onboarding";
import { Loader2 } from "lucide-react";

const ProfessionalData = () => {
  const { progress, isLoading, refreshProgress } = useProgress();
  const { saveStepData } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("ProfessionalData: carregando dados mais recentes");
    
    const loadData = async () => {
      try {
        await refreshProgress();
        setDataFetched(true);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Falha ao carregar seus dados. Tente novamente.");
      }
    };
    
    loadData();
  }, [refreshProgress]);

  const handleSubmit = async (stepId: string, data: ProfessionalDataInput) => {
    setIsSubmitting(true);
    try {
      console.log("ProfessionalData - Salvando dados:", data);
      
      // Validação básica
      if (!data.company_name || !data.company_size || !data.company_sector || !data.current_position || !data.annual_revenue) {
        toast.error("Por favor, preencha todos os campos obrigatórios");
        setIsSubmitting(false);
        return;
      }
      
      await saveStepData(stepId, data, true);
      
      // Navegar para a próxima página após salvar
      console.log("Navegando para próxima etapa após salvar dados profissionais");
      navigateAfterStep(stepId, 1, navigate, true);
      
    } catch (error) {
      console.error("Erro ao salvar dados profissionais:", error);
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    // Navegar para a etapa anterior (Dados Pessoais)
    console.log("Voltando para Dados Pessoais");
    navigate("/onboarding");
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
        
        {isLoading && !dataFetched ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-[#0ABAB5] mb-4" />
            <p className="text-gray-400">Carregando seus dados...</p>
          </div>
        ) : (
          <ProfessionalDataStep
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            initialData={progress}
            onPrevious={handlePrevious}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default ProfessionalData;
