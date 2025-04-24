
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ComplementaryInfoStep } from "@/components/onboarding/steps/ComplementaryInfoStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ComplementaryInfo = () => {
  const { saveStepData, progress, completeOnboarding } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, refreshProgress } = useProgress();
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const navigate = useNavigate();

  // Efeito para carregar dados mais recentes ao entrar na página - com controle para evitar loops
  useEffect(() => {
    // Verificar se já tentou uma vez para não entrar em loop
    if (!refreshAttempted) {
      console.log("ComplementaryInfo montado - carregando dados mais recentes");
      refreshProgress()
        .then(() => {
          console.log("Dados atualizados para ComplementaryInfo:", progress);
          setRefreshAttempted(true); // Marcar que já tentamos atualizar
        })
        .catch(error => {
          console.error("Erro ao carregar dados:", error);
          toast.error("Erro ao carregar dados. Algumas informações podem estar desatualizadas.");
          setRefreshAttempted(true); // Marcar que já tentamos, mesmo com erro
        });
    }
  }, [refreshAttempted]); // Dependência reduzida para evitar loop

  const handleSaveData = async (stepId: string, data: any) => {
    setIsSubmitting(true);
    try {
      console.log("Salvando informações complementares:", data);
      
      // Verificar se temos dados válidos
      if (!data) {
        throw new Error("Dados complementares ausentes ou inválidos");
      }
      
      // Usar a assinatura com stepId explícito para evitar problemas
      await saveStepData(stepId, data, false);
      
      console.log("Informações complementares salvas com sucesso");
      toast.success("Dados salvos com sucesso!");
      
      // Forçar atualização dos dados após salvar
      await refreshProgress();
      
      // Navegar manualmente para a página de revisão
      navigate("/onboarding/review");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Função para tentar recarregar dados
  const handleRetry = () => {
    setRefreshAttempted(false); // Resetar para tentar novamente
    refreshProgress();
  };
  
  // Verificar se temos dados válidos para complementary_info
  const hasComplementaryInfo = progress?.complementary_info && 
    typeof progress.complementary_info === 'object' && 
    Object.keys(progress.complementary_info).length > 0;
    
  console.log("Estado das informações complementares:", {
    hasComplementaryInfo,
    complementaryInfo: progress?.complementary_info
  });

  return (
    <OnboardingLayout
      currentStep={7}
      title="Informações Complementares"
      backUrl="/onboarding/customization"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Estamos quase finalizando! Estas são as últimas informações que precisamos para completar seu perfil no VIVER DE IA Club."
        />
        {isLoading && !refreshAttempted ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          </div>
        ) : !progress ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-medium text-red-800">Erro ao carregar dados</h3>
            <p className="text-sm text-red-600 mt-2">
              Não foi possível carregar suas informações. Por favor, tente novamente.
            </p>
            <button 
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <ComplementaryInfoStep
            onSubmit={handleSaveData}
            isSubmitting={isSubmitting}
            initialData={progress}
            isLastStep={false}
            onComplete={completeOnboarding}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default ComplementaryInfo;
