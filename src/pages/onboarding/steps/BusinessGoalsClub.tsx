
import React, { useState, useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ExpectativasObjetivosStep } from "@/components/onboarding/steps/ExpectativasObjetivosStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BusinessGoalsClub = () => {
  const { saveStepData, progress, completeOnboarding } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoading, refreshProgress } = useProgress();
  const [refreshCount, setRefreshCount] = useState(0);
  const navigate = useNavigate();

  // Efeito para carregar dados mais recentes ao entrar na página
  useEffect(() => {
    console.log("BusinessGoalsClub montado - carregando dados mais recentes");
    const loadData = async () => {
      try {
        await refreshProgress();
        console.log("Dados atualizados para BusinessGoalsClub:", progress);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados. Algumas informações podem estar desatualizadas.");
      }
    };
    loadData();
  }, [refreshProgress, refreshCount]);

  const handleSaveData = async (data: any) => {
    setIsSubmitting(true);
    try {
      console.log("Verificando dados recebidos para objetivos:", data);
      
      // Garantir que estamos enviando os dados no formato correto
      let formattedData;
      
      // Se os dados já estiverem no formato correto (com business_goals), apenas usar como está
      if (data.business_goals) {
        formattedData = data;
      } else {
        // Encapsular os dados em um objeto business_goals
        formattedData = {
          business_goals: {
            ...data
          }
        };
      }
      
      console.log("Salvando dados de objetivos formatados:", formattedData);
      
      // Garantir que estamos enviando com o stepId correto
      await saveStepData("business_goals", formattedData, false); // Mudado para false para não redirecionar automaticamente
      
      console.log("Dados de objetivos salvos com sucesso");
      toast.success("Dados salvos com sucesso!");
      
      // Forçar atualização dos dados após salvar
      await refreshProgress();
      
      // Navegar manualmente para a próxima página
      navigate("/onboarding/customization");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para tentar recarregar dados
  const handleRetry = () => {
    setRefreshCount(prev => prev + 1);
  };

  // Verificar se temos dados válidos para business_goals
  const hasBusinessGoals = progress?.business_goals && 
    (typeof progress.business_goals === 'object' && 
    Object.keys(progress.business_goals).length > 0);

  console.log("Estado atual dos business_goals:", {
    hasBusinessGoals,
    businessGoals: progress?.business_goals,
    progressType: progress ? typeof progress.business_goals : 'undefined'
  });

  return (
    <OnboardingLayout
      currentStep={5}
      title="Expectativas e Objetivos com o Club"
      backUrl="/onboarding/ai-experience"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Agora, gostaria de entender quais são suas expectativas e objetivos com o VIVER DE IA Club. Isso nos ajudará a personalizar sua experiência e garantir que você obtenha o máximo valor possível."
        />
        {isLoading ? (
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
          <ExpectativasObjetivosStep
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

export default BusinessGoalsClub;
