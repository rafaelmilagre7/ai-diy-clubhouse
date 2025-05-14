
import React, { useEffect, useRef } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { BusinessContextStep } from "@/components/onboarding/steps/BusinessContextStep";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { toast } from "sonner";

const BusinessContext = () => {
  const { progress, isLoading, refreshProgress } = useProgress();
  const { saveStepData, currentStepIndex, steps } = useOnboardingSteps();
  const hasLoadedData = useRef(false);

  useEffect(() => {
    if (!hasLoadedData.current) {
      console.log("[BusinessContext] Carregando dados atualizados na página de contexto de negócio");
      refreshProgress().then(() => {
        hasLoadedData.current = true;
      });
    }
  }, [refreshProgress]);

  const progressPercentage = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  const getInitialData = () => {
    if (!progress) return {};
    
    // Verificar ambas as fontes de dados possíveis (para compatibilidade)
    const fromContext = progress.business_context || {};
    const fromData = progress.business_data || {};
    
    // Combinar dados das duas fontes (business_context tem precedência)
    return {
      ...fromData,
      ...fromContext
    };
  };

  const handleSave = async (data: any): Promise<void> => {
    try {
      console.log("[BusinessContext] Salvando dados do contexto de negócio:", data);
      
      // CORREÇÃO: Enviar dados diretamente sem aninhamento adicional
      // Isso corrige o problema de duplo aninhamento de dados
      await saveStepData("business_context", data);
      
      // Atualizar os dados locais para confirmar a gravação
      await refreshProgress();
      
      toast.success("Informações do contexto de negócio salvas com sucesso!");
      
      // Removido o setTimeout e a navegação manual
      // O hook useStepPersistenceCore agora cuida da navegação centralmente
    } catch (error) {
      console.error("[BusinessContext] Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
    }
  };

  if (isLoading && !hasLoadedData.current) {
    return (
      <OnboardingLayout
        currentStep={3}
        totalSteps={steps.length}
        title="Contexto do Negócio"
      >
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0ABAB5]"></div>
          <p className="text-gray-500">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  const initialData = getInitialData();
  console.log("[BusinessContext] Dados iniciais para o formulário de contexto:", initialData);

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={steps.length}
      title="Contexto do Negócio"
      backUrl="/onboarding/professional-data"
    >
      <BusinessContextStep
        onSubmit={handleSave}
        isSubmitting={false}
        initialData={initialData}
      />
    </OnboardingLayout>
  );
};

export default BusinessContext;
