
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { Button } from "@/components/ui/button";
import { ReviewStep } from "@/components/onboarding/steps/ReviewStep";
import { toast } from "sonner";

const Review: React.FC = () => {
  const navigate = useNavigate();
  const { currentStepIndex, steps, completeOnboarding } = useOnboardingSteps();
  const { progress, isLoading, refreshProgress } = useProgress();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoadAttempted, setIsInitialLoadAttempted] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  
  // Encontrar o índice correto do passo de revisão
  const reviewStepIndex = steps.findIndex(step => step.id === "review");
  
  // Efeito para garantir que os dados mais recentes sejam carregados ao entrar na página
  // Uma única vez e com melhor tratamento de erros
  useEffect(() => {
    // Evitar carregar novamente se já tentamos ou se já temos dados
    if (isInitialLoadAttempted) {
      return;
    }
    
    const loadFreshData = async () => {
      try {
        console.log("[Review] Carregando dados mais recentes para revisão...");
        
        // Forçar recarga dos dados do backend
        const refreshedData = await refreshProgress();
        console.log("[Review] Dados atualizados para revisão:", refreshedData);
        
        if (!refreshedData) {
          console.warn("[Review] Nenhum dado retornado pela função refreshProgress");
          setLoadError(new Error("Falha ao carregar seus dados. Dados não disponíveis."));
        }
      } catch (error) {
        console.error("[Review] Erro ao recarregar dados para revisão:", error);
        setLoadError(error instanceof Error ? error : new Error("Erro desconhecido ao carregar dados"));
        toast.error("Falha ao carregar dados atualizados. Tente recarregar a página.", {
          id: "review-data-load-error",
        });
      } finally {
        setIsInitialLoadAttempted(true);
      }
    };
    
    loadFreshData();
  }, [refreshProgress]); // Dependência apenas em refreshProgress
  
  const handleNavigateToStep = (index: number) => {
    navigate(steps[index].path);
  };
  
  const handleComplete = async () => {
    if (!progress) {
      toast.error("Dados incompletos. Por favor, recarregue a página antes de continuar.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await completeOnboarding();
    } catch (error) {
      console.error("[Review] Erro ao finalizar onboarding:", error);
      toast.error("Erro ao finalizar o onboarding. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Verificar se temos dados para mostrar
  if (isLoading && !isInitialLoadAttempted) {
    return (
      <OnboardingLayout
        currentStep={reviewStepIndex + 1}
        totalSteps={steps.length}
        title="Revisar Informações"
      >
        <div className="text-center py-8">
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-500" />
          <p className="mt-2 text-gray-500">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  // Verificação adicional para garantir que temos dados válidos
  if ((!progress || loadError) && isInitialLoadAttempted) {
    return (
      <OnboardingLayout
        currentStep={reviewStepIndex + 1}
        totalSteps={steps.length}
        title="Revisar Informações"
      >
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
          <h3 className="text-lg font-medium text-amber-800">Dados não disponíveis</h3>
          <p className="mt-2 text-amber-700">
            {loadError?.message || "Não foi possível carregar seus dados. Por favor, tente recarregar a página ou volte para as etapas anteriores."}
          </p>
          <div className="mt-4 flex gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                setIsInitialLoadAttempted(false); // Resetar flag para permitir nova tentativa
                setLoadError(null);
                window.location.reload();
              }}
              className="bg-white"
            >
              Recarregar página
            </Button>
            <Button
              onClick={() => navigate("/onboarding/complementary")}
              variant="default"
              className="bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
            >
              Voltar à etapa anterior
            </Button>
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout
      currentStep={reviewStepIndex + 1}
      totalSteps={steps.length}
      title="Revisar Informações"
      backUrl="/onboarding/complementary"
    >
      <div className="space-y-6">
        <MilagrinhoMessage
          message="Vamos revisar as informações que você compartilhou conosco. Se algo estiver incorreto, você pode voltar às etapas anteriores e fazer os ajustes necessários."
        />
        
        <div className="bg-gray-50 rounded-lg p-6">
          <ReviewStep 
            progress={progress}
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
            navigateToStep={handleNavigateToStep}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Review;
