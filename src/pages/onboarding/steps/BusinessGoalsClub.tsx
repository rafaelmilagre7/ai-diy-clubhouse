
import React, { useState, useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ExpectativasObjetivosStep } from "@/components/onboarding/steps/ExpectativasObjetivosStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const BusinessGoalsClub = () => {
  const { saveStepData, completeOnboarding } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, isLoading, refreshProgress } = useProgress();
  const [refreshCount, setRefreshCount] = useState(0);
  const [localDataReady, setLocalDataReady] = useState(false);
  const navigate = useNavigate();

  // Efeito para carregar dados mais recentes ao entrar na página
  useEffect(() => {
    const loadData = async () => {
      setLocalDataReady(false);
      try {
        console.log("Carregando dados atualizados para BusinessGoalsClub...");
        await refreshProgress();
        
        // Verificações detalhadas sobre a estrutura dos dados
        if (progress) {
          console.log("Tipo de business_goals:", typeof progress.business_goals);
          console.log("Conteúdo de business_goals:", JSON.stringify(progress.business_goals, null, 2));
          
          // Verificar se o objeto business_goals está vazio
          const isEmpty = !progress.business_goals || 
                         (typeof progress.business_goals === 'object' && Object.keys(progress.business_goals).length === 0) ||
                         (typeof progress.business_goals === 'string' && (progress.business_goals === '{}' || progress.business_goals === ''));
                         
          console.log("business_goals está vazio?", isEmpty);
          
          // Verificar dados importantes
          if (!isEmpty && typeof progress.business_goals === 'object') {
            const requiredFields = ['primary_goal', 'priority_solution_type', 'how_implement', 'week_availability'];
            const missingFields = requiredFields.filter(field => !progress.business_goals[field]);
            
            if (missingFields.length > 0) {
              console.warn(`Campos obrigatórios ausentes em business_goals: ${missingFields.join(', ')}`);
            } else {
              console.log("Todos os campos obrigatórios estão presentes em business_goals");
            }
          }
        }
        
        // Marcar dados como prontos
        setLocalDataReady(true);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        // Removemos o toast de erro para evitar toasts duplicados
        setLocalDataReady(true); // Mesmo com erro, permitir a renderização
      }
    };
    loadData();
  }, [refreshProgress, refreshCount]);

  const handleSaveData = async (stepId: string, data: any) => {
    console.log(`Iniciando salvamento de dados para passo ${stepId}:`, JSON.stringify(data, null, 2));
    setIsSubmitting(true);
    try {
      // Verificações detalhadas antes de salvar
      if (!data.business_goals) {
        console.error("Dados inválidos: business_goals não encontrado no objeto");
        toast.error("Erro ao salvar: dados incompletos");
        setIsSubmitting(false);
        return;
      }
      
      // Verificar campos obrigatórios
      const businessGoalsData = data.business_goals;
      
      const requiredFields = ['primary_goal', 'priority_solution_type', 'how_implement', 'week_availability'];
      const missingFields = requiredFields.filter(field => !businessGoalsData[field]);
      
      if (missingFields.length > 0) {
        console.warn("Campos obrigatórios não preenchidos:", missingFields);
        toast.warning("Por favor, preencha todos os campos obrigatórios");
        setIsSubmitting(false);
        return;
      }
      
      // Garantir que temos expected_outcomes como array
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
      
      // Garantir que os campos obrigatórios são strings
      requiredFields.forEach(field => {
        if (businessGoalsData[field] !== undefined && typeof businessGoalsData[field] !== 'string') {
          businessGoalsData[field] = String(businessGoalsData[field]);
        }
      });
      
      // Log de dados antes de salvar
      console.log("Dados finais formatados antes de salvar:", JSON.stringify(data, null, 2));
      
      // Salvar dados (apenas um toast será mostrado na função saveStepData)
      const result = await saveStepData(stepId, data, false);
      console.log("Dados salvos com sucesso");

      // Não mostrar toast aqui para evitar duplicação
      
      // Navegar manualmente para a próxima página após um breve atraso
      setTimeout(() => {
        navigate("/onboarding/customization");
      }, 500);
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
  
  // Encontrar o índice correto na sequência de passos
  const stepIndex = 5; // Índice fixo para business_goals

  return (
    <OnboardingLayout
      currentStep={stepIndex}
      title="Expectativas e Objetivos com o Club"
      backUrl="/onboarding/ai-experience"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <MilagrinhoMessage
          message="Agora, gostaria de entender quais são suas expectativas e objetivos com o VIVER DE IA Club. Isso nos ajudará a personalizar sua experiência e garantir que você obtenha o máximo valor possível."
        />
        {isLoading || !localDataReady ? (
          <div className="flex justify-center py-10">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="animate-spin h-10 w-10 text-[#0ABAB5]" />
              <p className="text-sm text-gray-500">Carregando seus dados...</p>
            </div>
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
