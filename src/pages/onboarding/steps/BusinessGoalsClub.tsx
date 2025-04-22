
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
        
        // Diagnóstico adicional para verificar a estrutura dos dados
        if (progress) {
          console.log("Tipo de business_goals:", typeof progress.business_goals);
          console.log("Conteúdo de business_goals:", JSON.stringify(progress.business_goals, null, 2));
          
          // Verificar se o objeto business_goals está vazio
          const isEmpty = !progress.business_goals || 
                        Object.keys(progress.business_goals).length === 0 ||
                        JSON.stringify(progress.business_goals) === '{}';
                        
          console.log("business_goals está vazio?", isEmpty);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados. Algumas informações podem estar desatualizadas.");
      }
    };
    loadData();
  }, [refreshProgress, refreshCount]);

  const handleSaveData = async (stepId: string, data: any) => {
    console.log(`Iniciando salvamento de dados para passo ${stepId}:`, data);
    setIsSubmitting(true);
    try {
      // Garantir que os dados foram formatados adequadamente
      if (!data.business_goals) {
        throw new Error("Dados inválidos para envio");
      }
      
      // Converter campos para formato correto se necessário
      const businessGoalsData = data.business_goals;
      
      // Verificar se campos obrigatórios estão presentes
      const requiredFields = ['primary_goal', 'priority_solution_type', 'how_implement', 'week_availability'];
      const missingFields = requiredFields.filter(field => !businessGoalsData[field]);
      
      if (missingFields.length > 0) {
        console.warn("Campos obrigatórios não preenchidos:", missingFields);
        toast.warning("Por favor, preencha todos os campos obrigatórios");
        setIsSubmitting(false);
        return;
      }
      
      // Garantir que temos expected_outcomes
      if (!businessGoalsData.expected_outcomes || !Array.isArray(businessGoalsData.expected_outcomes)) {
        businessGoalsData.expected_outcomes = [];
      }
      
      // Adicionar expected_outcome_30days para expected_outcomes se existir
      if (businessGoalsData.expected_outcome_30days && 
          !businessGoalsData.expected_outcomes.includes(businessGoalsData.expected_outcome_30days)) {
        businessGoalsData.expected_outcomes = [
          businessGoalsData.expected_outcome_30days,
          ...businessGoalsData.expected_outcomes.filter(Boolean)
        ];
      }
      
      // Garantir que content_formats é um array
      if (!businessGoalsData.content_formats || !Array.isArray(businessGoalsData.content_formats)) {
        businessGoalsData.content_formats = [];
      }
      
      // Garantir que live_interest é um número
      if (businessGoalsData.live_interest !== undefined) {
        businessGoalsData.live_interest = Number(businessGoalsData.live_interest);
      }
      
      // Log de dados antes de salvar
      console.log("Dados finais formatados antes de salvar:", JSON.stringify(data, null, 2));
      
      // Salvar dados
      await saveStepData(stepId, data, false);
      
      toast.success("Dados salvos com sucesso!");
      
      // Verificar se os dados foram salvos corretamente
      await refreshProgress();
      console.log("Após salvar, dados de progresso:", progress);
      console.log("business_goals após salvar:", JSON.stringify(progress?.business_goals, null, 2));
      
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
