
import React, { useEffect, useState, useRef } from "react";
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
  // Adicionar uma referência para controlar se o componente está montado
  const isMounted = useRef(true);
  const navigate = useNavigate();

  // Efeito para configurar e limpar montagem do componente
  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      // Marcar componente como desmontado quando for destruído
      isMounted.current = false;
    };
  }, []);

  // Efeito para carregar dados mais recentes ao entrar na página - com controle para evitar loops
  useEffect(() => {
    // Verificar se já tentou uma vez para não entrar em loop e se o componente está montado
    if (!refreshAttempted && isMounted.current) {
      console.log("[ComplementaryInfo] Carregando dados mais recentes");
      
      let isCancelled = false;
      
      refreshProgress()
        .then((refreshedData) => {
          // Verificar se o componente ainda está montado antes de atualizar state
          if (isCancelled || !isMounted.current) return;
          
          console.log("[ComplementaryInfo] Dados atualizados:", refreshedData || progress);
          setRefreshAttempted(true); // Marcar que já tentamos atualizar
        })
        .catch(error => {
          // Verificar se o componente ainda está montado antes de atualizar state
          if (isCancelled || !isMounted.current) return;
          
          console.error("[ComplementaryInfo] Erro ao carregar dados:", error);
          toast.error("Erro ao carregar dados. Algumas informações podem estar desatualizadas.");
          setRefreshAttempted(true); // Marcar que já tentamos, mesmo com erro
        });
        
      // Função de cleanup para marcar operação como cancelada se o componente for desmontado
      return () => {
        isCancelled = true;
      };
    }
  }, [refreshAttempted]); // Dependência reduzida para evitar loop

  const handleSaveData = async (stepId: string, data: any) => {
    if (!isMounted.current) return; // Verificação de segurança
    
    setIsSubmitting(true);
    try {
      console.log("[ComplementaryInfo] Salvando informações complementares:", data);
      
      // Verificar se temos dados válidos
      if (!data) {
        throw new Error("Dados complementares ausentes ou inválidos");
      }
      
      // Usar a assinatura com stepId explícito para evitar problemas
      await saveStepData(stepId, data, false);
      
      if (!isMounted.current) return; // Verificação após operação assíncrona
      
      console.log("[ComplementaryInfo] Informações complementares salvas com sucesso");
      toast.success("Dados salvos com sucesso!");
      
      // Forçar atualização dos dados após salvar, mas apenas se ainda estiver montado
      if (isMounted.current) {
        await refreshProgress();
      }
      
      // Navegar manualmente para a página de revisão
      navigate("/onboarding/review");
    } catch (error) {
      if (!isMounted.current) return; // Verificação após operação assíncrona
      
      console.error("[ComplementaryInfo] Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };
  
  // Função para tentar recarregar dados
  const handleRetry = () => {
    setRefreshAttempted(false); // Resetar para tentar novamente
    refreshProgress();
  };
  
  // Função para navegação segura para trás
  const handleNavigateBack = () => {
    console.log("[ComplementaryInfo] Navegando para a etapa anterior via hook de navegação");
    navigate("/onboarding/customization");
  };

  return (
    <OnboardingLayout
      currentStep={7}
      title="Informações Complementares"
      backUrl="/onboarding/customization"
      onBackClick={handleNavigateBack}
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
