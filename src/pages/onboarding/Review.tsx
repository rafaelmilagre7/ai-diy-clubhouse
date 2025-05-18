import React, { useEffect, useState, useRef } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { Button } from "@/components/ui/button";
import { ReviewStep } from "@/components/onboarding/steps/ReviewStep";
import { toast } from "sonner";
import { steps } from "@/hooks/onboarding/useStepDefinitions";

const Review: React.FC = () => {
  const navigate = useNavigate();
  const { currentStepIndex, completeOnboarding } = useOnboardingSteps();
  const { progress, isLoading, refreshProgress } = useProgress();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoadAttempted, setIsInitialLoadAttempted] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const initialLoadRef = useRef(false);
  
  // Encontrar o índice correto do passo de revisão
  const reviewStepIndex = steps.findIndex(step => step.id === "review");
  
  // Efeito para carregar dados apenas uma vez, com proteção contra recarregamentos
  useEffect(() => {
    // Evitar múltiplos carregamentos
    if (initialLoadRef.current || isInitialLoadAttempted) {
      console.log("[Review] Carregamento inicial já foi tentado, ignorando");
      return;
    }
    
    initialLoadRef.current = true;
    
    const loadFreshData = async () => {
      try {
        console.log("[Review] Carregando dados para revisão...");
        
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
  }, []); // Dependência vazia garante que carregue apenas uma vez
  
  // Função melhorada para navegação por ID do passo
  const handleNavigateToStep = (stepId: string) => {
    console.log("[Review] Navegando para etapa por ID:", stepId);
    
    // Buscar o passo correspondente pelo ID
    const targetStep = steps.find(step => step.id === stepId);
    
    if (targetStep) {
      console.log(`[Review] Redirecionando para etapa ${targetStep.id} (${targetStep.path})`);
      navigate(targetStep.path);
    } else {
      // Fallback para navegação baseada em índice
      const index = parseInt(stepId, 10);
      if (!isNaN(index) && index >= 0 && index < steps.length) {
        console.log(`[Review] Navegando para índice ${index}: ${steps[index].path}`);
        navigate(steps[index].path);
      } else {
        console.error("[Review] Etapa não encontrada com ID:", stepId);
        toast.error("Erro ao navegar. Etapa não encontrada.");
      }
    }
  };
  
  const handleComplete = async () => {
    if (!progress) {
      toast.error("Dados incompletos. Por favor, recarregue a página antes de continuar.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await completeOnboarding();
      // Após completar o onboarding, navegue para a página de sucesso
      navigate('/onboarding/completed');
    } catch (error) {
      console.error("[Review] Erro ao finalizar onboarding:", error);
      toast.error("Erro ao finalizar o onboarding. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Mostrar estado de carregamento apenas na primeira carga
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
        <div className="bg-amber-950/30 p-6 rounded-lg border border-amber-700/70">
          <h3 className="text-lg font-medium text-amber-300">Dados não disponíveis</h3>
          <p className="mt-2 text-amber-200">
            {loadError?.message || "Não foi possível carregar seus dados. Por favor, tente recarregar a página ou volte para as etapas anteriores."}
          </p>
          <div className="mt-4 flex gap-3">
            <Button 
              variant="outline"
              onClick={() => {
                initialLoadRef.current = false;
                setIsInitialLoadAttempted(false); // Resetar flag para permitir nova tentativa
                setLoadError(null);
                window.location.reload();
              }}
            >
              Recarregar página
            </Button>
            <Button
              onClick={() => navigate("/onboarding/complementary")}
              variant="default"
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
        
        <div className="bg-[#151823] rounded-lg p-6 border border-neutral-700/50">
          {/* Apenas renderizar ReviewStep se tivermos dados de progresso */}
          {progress && (
            <ReviewStep 
              progress={progress}
              onComplete={handleComplete}
              isSubmitting={isSubmitting}
              navigateToStep={handleNavigateToStep}
            />
          )}
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Review;
