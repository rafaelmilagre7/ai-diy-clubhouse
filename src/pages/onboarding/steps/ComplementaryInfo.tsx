import React from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
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
  const [refreshCount, setRefreshCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ComplementaryInfo montado - carregando dados mais recentes");
    const loadData = async () => {
      try {
        await refreshProgress();
        console.log("Dados atualizados para ComplementaryInfo:", progress);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados. Algumas informações podem estar desatualizadas.");
      }
    };
    loadData();
  }, [refreshProgress, refreshCount]);

  const handleSaveData = async (stepId: string, data: any) => {
    setIsSubmitting(true);
    try {
      console.log("Salvando informações complementares:", data);
      await saveStepData(stepId, data, false);
      console.log("Informações complementares salvas com sucesso");
      toast.success("Dados salvos com sucesso!");
      
      await refreshProgress();
      
      navigate("/onboarding/review");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      toast.error("Erro ao salvar dados. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRetry = () => {
    setRefreshCount(prev => prev + 1);
  };
  
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
