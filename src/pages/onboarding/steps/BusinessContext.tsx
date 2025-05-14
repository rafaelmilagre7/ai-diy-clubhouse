
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
  const isSaving = useRef(false);

  useEffect(() => {
    if (!hasLoadedData.current) {
      console.log("[BusinessContext] Carregando dados atualizados na página de contexto de negócio");
      refreshProgress().then(() => {
        hasLoadedData.current = true;
      });
    }
  }, [refreshProgress]);

  // Função melhorada para obter dados iniciais unificados
  const getInitialData = () => {
    if (!progress) return {};
    
    // Verificar business_context primeiro (formato preferencial)
    if (progress.business_context && Object.keys(progress.business_context).length > 0) {
      console.log("[BusinessContext] Usando dados de business_context:", progress.business_context);
      return progress.business_context;
    }
    
    // Fallback para business_data (formato legado)
    if (progress.business_data && Object.keys(progress.business_data).length > 0) {
      console.log("[BusinessContext] Usando dados de business_data (legado):", progress.business_data);
      return progress.business_data;
    }
    
    // Nenhum dado encontrado
    console.log("[BusinessContext] Nenhum dado de contexto de negócio encontrado");
    return {};
  };

  const handleSave = async (data: any): Promise<void> => {
    // Evitar múltiplas submissões simultâneas
    if (isSaving.current) {
      console.log("[BusinessContext] Operação de salvamento já em andamento, ignorando nova solicitação");
      return;
    }
    
    isSaving.current = true;
    
    try {
      console.log("[BusinessContext] Salvando dados do contexto de negócio:", data);
      
      // Importante: Usar "business_context" como ID da etapa explicitamente
      // para evitar qualquer ambiguidade no sistema de salvamento
      await saveStepData("business_context", data);
      
      // Atualizar os dados locais para confirmar a gravação
      const updatedProgress = await refreshProgress();
      
      if (updatedProgress) {
        console.log("[BusinessContext] Dados atualizados recuperados após salvar:", 
          updatedProgress.business_context || updatedProgress.business_data);
        toast.success("Informações do contexto de negócio salvas com sucesso!");
      } else {
        // Tratar caso em que refreshProgress não retorna dados
        console.warn("[BusinessContext] refreshProgress não retornou dados atualizados");
        toast.success("Informações salvas, mas não foi possível confirmar atualização");
      }
      
    } catch (error) {
      console.error("[BusinessContext] Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Tente novamente.");
    } finally {
      isSaving.current = false;
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
