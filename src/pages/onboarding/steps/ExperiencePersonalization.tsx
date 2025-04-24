
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ExperiencePersonalizationStep } from "@/components/onboarding/steps/ExperiencePersonalizationStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ExperiencePersonalization = () => {
  const { saveStepData, progress, completeOnboarding } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, refreshProgress } = useProgress();
  const [refreshAttempted, setRefreshAttempted] = useState(false);
  const navigate = useNavigate();

  // Efeito para carregar dados mais recentes ao entrar na página - com controle para evitar loops
  useEffect(() => {
    // Verificar se já tentou uma vez para não entrar em loop
    if (!refreshAttempted) {
      console.log("ExperiencePersonalization montado - carregando dados mais recentes");
      refreshProgress()
        .then(() => {
          console.log("Dados atualizados para ExperiencePersonalization:", progress);
          setRefreshAttempted(true); // Marcar que já tentamos atualizar
        })
        .catch(error => {
          console.error("Erro ao carregar dados:", error);
          toast.error("Erro ao carregar dados. Algumas informações podem estar desatualizadas.");
          setRefreshAttempted(true); // Marcar que já tentamos, mesmo com erro
        });
    }
  }, [refreshAttempted, refreshProgress]); // Adicionado refreshProgress como dependência

  const handleSaveData = async (stepId: string, data: any) => {
    setIsSubmitting(true);
    try {
      console.log("Salvando dados de personalização:", data);
      
      // Verificar se temos dados válidos
      if (!data) {
        throw new Error("Dados de personalização ausentes ou inválidos");
      }
      
      // Usar o stepId fornecido ou fallback para "experience_personalization"
      const targetStepId = stepId || "experience_personalization";
      
      // CORREÇÃO: Garantir que os dados estão na estrutura correta e registrar o formato
      console.log("Tipo de dados:", typeof data);
      console.log("Estrutura dos dados:", JSON.stringify(data, null, 2));
      
      // Enviar com o stepId recebido
      await saveStepData(targetStepId, data, false);
      
      console.log("Dados de personalização salvos com sucesso");
      toast.success("Dados salvos com sucesso!");
      
      // Navegar manualmente para a próxima página
      navigate("/onboarding/complementary");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para tentar recarregar dados
  const handleRetry = () => {
    setRefreshAttempted(false); // Resetar flag para permitir nova tentativa
  };

  // Log para depuração
  useEffect(() => {
    if (progress?.experience_personalization) {
      console.log("Dados de experience_personalization disponíveis:", progress.experience_personalization);
    } else {
      console.log("Nenhum dado de experience_personalization encontrado no progresso");
    }
  }, [progress]);

  return (
    <OnboardingLayout
      currentStep={6}
      title="Personalização da Experiência"
      backUrl="/onboarding/club-goals"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Vamos personalizar sua experiência no VIVER DE IA Club. Suas preferências nos ajudarão a entregar conteúdo e oportunidades que sejam mais relevantes para você."
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
          <ExperiencePersonalizationStep
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

export default ExperiencePersonalization;
