import React from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { ExpectativasObjetivosStep } from "@/components/onboarding/steps/ExpectativasObjetivosStep";
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
  const [refreshCount, setRefreshCount] = useState(0);
  const [localDataReady, setLocalDataReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLocalDataReady(false);
      try {
        console.log("Carregando dados atualizados para BusinessGoalsClub...");
        await refreshProgress();
        
        if (progress) {
          console.log("Tipo de business_goals:", typeof progress.business_goals);
          console.log("Conteúdo de business_goals:", JSON.stringify(progress.business_goals, null, 2));
        }
        
        setLocalDataReady(true);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar seus dados. Tente novamente.");
        setLocalDataReady(true);
      }
    };
    
    loadData();
  }, [refreshProgress, refreshCount]);

  const handleSaveData = async (stepId: string, data: any) => {
    console.log(`Iniciando salvamento de dados para passo ${stepId}:`, JSON.stringify(data, null, 2));
    setIsSubmitting(true);
    
    try {
      if (!data.business_goals) {
        console.error("Dados inválidos: business_goals não encontrado no objeto");
        toast.error("Erro ao salvar: dados incompletos");
        setIsSubmitting(false);
        return;
      }
      
      const businessGoalsData = data.business_goals;
      
      const requiredFields = ['primary_goal', 'priority_solution_type', 'how_implement', 'week_availability'];
      const missingFields = requiredFields.filter(field => !businessGoalsData[field]);
      
      if (missingFields.length > 0) {
        console.warn("Campos obrigatórios não preenchidos:", missingFields);
        toast.warning("Por favor, preencha todos os campos obrigatórios");
        setIsSubmitting(false);
        return;
      }
      
      const formattedData = {
        business_goals: {
          ...businessGoalsData,
          expected_outcomes: Array.isArray(businessGoalsData.expected_outcomes) 
            ? businessGoalsData.expected_outcomes 
            : [],
          expected_outcome_30days: businessGoalsData.expected_outcome_30days || "",
          content_formats: Array.isArray(businessGoalsData.content_formats) 
            ? businessGoalsData.content_formats 
            : [],
          live_interest: Number(businessGoalsData.live_interest || 5)
        }
      };
      
      console.log("Dados formatados para salvar:", JSON.stringify(formattedData, null, 2));
      
      await saveStepData("business_goals", formattedData, false);
      console.log("Dados salvos com sucesso");
      
      toast.success("Informações salvas com sucesso!");
      
      setTimeout(() => {
        navigate("/onboarding/customization");
      }, 800);
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    console.log("Tentando recarregar dados...");
    setRefreshCount(prev => prev + 1);
  };
  
  const processedData = React.useMemo(() => {
    if (!progress) return null;
    
    console.log("Processando dados para ExpectativasObjetivosStep");
    
    let businessGoalsData = progress.business_goals;
    
    if (typeof businessGoalsData === 'string' || !businessGoalsData) {
      businessGoalsData = normalizeBusinessGoals(businessGoalsData);
      console.log("business_goals normalizado:", businessGoalsData);
    } else {
      console.log("business_goals já é um objeto, sem necessidade de normalização");
    }
    
    return {
      ...progress,
      business_goals: businessGoalsData
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
            initialData={processedData}
            isLastStep={false}
            onComplete={completeOnboarding}
          />
        )}
      </div>
    </OnboardingLayout>
  );
};

export default BusinessGoalsClub;
