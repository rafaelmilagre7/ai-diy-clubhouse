
import React, { useState, useEffect, useRef } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import ExpectativasObjetivosStep from "@/components/onboarding/steps/ExpectativasObjetivosStep";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { normalizeBusinessGoals } from "@/hooks/onboarding/persistence/utils/dataNormalization";

const BusinessGoalsClub = () => {
  const { saveStepData, completeOnboarding } = useOnboardingSteps();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { progress, isLoading, refreshProgress } = useProgress();
  const [dataReady, setDataReady] = useState(false);
  const loadingRef = useRef(false);
  const dataLoadedRef = useRef(false);
  const navigate = useNavigate();
  const progressRef = useRef(progress);

  // Atualizar a ref do progress quando ele mudar
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  // Efeito para carregar dados apenas uma vez ao montar o componente
  useEffect(() => {
    async function loadInitialData() {
      // Se já estiver carregando ou já tiver carregado, não faz nada
      if (loadingRef.current || dataLoadedRef.current) return;
      
      try {
        loadingRef.current = true;
        console.log("[BusinessGoalsClub] Carregando dados iniciais...");
        await refreshProgress();
        dataLoadedRef.current = true;
        setDataReady(true);
      } catch (error) {
        console.error("[BusinessGoalsClub] Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados. Tente novamente.");
      } finally {
        loadingRef.current = false;
      }
    }

    loadInitialData();
    
    // Cleanup ao desmontar o componente
    return () => {
      console.log("[BusinessGoalsClub] Componente desmontado, limpando referências");
      dataLoadedRef.current = false;
      loadingRef.current = false;
    };
  }, []); // Dependências vazias para executar apenas uma vez ao montar

  const handleRetry = async () => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setDataReady(false);
      console.log("[BusinessGoalsClub] Tentando recarregar dados...");
      await refreshProgress();
      setDataReady(true);
    } catch (error) {
      console.error("[BusinessGoalsClub] Erro ao recarregar dados:", error);
      toast.error("Erro ao recarregar seus dados. Tente novamente.");
    } finally {
      loadingRef.current = false;
    }
  };

  const handleUpdateData = async (data: any) => {
    if (isSubmitting) return;
    
    console.log(`[BusinessGoalsClub] Iniciando salvamento de dados:`, data);
    setIsSubmitting(true);
    
    try {
      // Aqui está o problema: precisamos garantir que dados sejam corretamente 
      // estruturados conforme esperado pelo mecanismo de salvamento
      
      // Verificações detalhadas antes de salvar
      if (!data.business_goals) {
        console.error("[BusinessGoalsClub] Dados inválidos: business_goals não encontrado no objeto");
        toast.error("Erro ao salvar: dados incompletos");
        setIsSubmitting(false);
        return;
      }
      
      // Converter os objetivos selecionados para o formato esperado pelo modelo de dados
      const selectedGoals = data.business_goals;
      
      // Criar objeto de dados padronizado para o builder
      const formattedData = {
        business_goals: {
          primary_goal: "custom", // Valor padrão para objetivos personalizados
          expected_outcomes: Object.keys(selectedGoals).filter(key => selectedGoals[key] === true),
          timeline: "30days" // Valor padrão para timeline
        }
      };
      
      console.log("[BusinessGoalsClub] Dados formatados para salvar:", formattedData);
      
      // Salvar dados usando business_goals como stepId
      await saveStepData("business_goals", formattedData, false);
      console.log("[BusinessGoalsClub] Dados salvos com sucesso");
      
      toast.success("Informações salvas com sucesso!");
      
      // Navegar manualmente para a próxima página após um breve atraso
      setTimeout(() => {
        navigate("/onboarding/customization");
      }, 800);
    } catch (error) {
      console.error("[BusinessGoalsClub] Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Processar dados para o componente apenas quando necessário
  const processedData = React.useMemo(() => {
    if (!progress) return null;
    
    console.log("[BusinessGoalsClub] Processando dados para ExpectativasObjetivosStep");
    
    let businessGoalsData = progress.business_goals;
    
    // Normalizar business_goals se necessário
    if (typeof businessGoalsData === 'string' || !businessGoalsData) {
      businessGoalsData = normalizeBusinessGoals(businessGoalsData);
      console.log("[BusinessGoalsClub] business_goals normalizado:", businessGoalsData);
    }
    
    // Se temos expected_outcomes, converter para o formato de seleção
    let selectedGoals: Record<string, boolean> = {};
    
    if (businessGoalsData && Array.isArray(businessGoalsData.expected_outcomes)) {
      // Converter de array para objeto com booleanos para o componente de seleção
      businessGoalsData.expected_outcomes.forEach((outcome: string) => {
        if (outcome) {
          selectedGoals[outcome] = true;
        }
      });
      
      console.log("[BusinessGoalsClub] Objetivos convertidos para formato de seleção:", selectedGoals);
    }
    
    return {
      ...progress,
      business_goals: selectedGoals // Passar os objetivos no formato esperado pelo componente
    };
  }, [progress]);

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
        {isLoading || !dataReady ? (
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
            key="business-goals-step"
            onUpdateData={handleUpdateData}
            data={processedData}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default BusinessGoalsClub;
