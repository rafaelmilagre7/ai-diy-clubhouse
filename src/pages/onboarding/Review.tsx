import React, { useEffect } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { MilagrinhoMessage } from "@/components/onboarding/MilagrinhoMessage";
import { CheckCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { Button } from "@/components/ui/button";
import { ReviewStep } from "@/components/onboarding/steps/ReviewStep";
import { toast } from "sonner";

const Review: React.FC = () => {
  const navigate = useNavigate();
  const { currentStepIndex, steps, completeOnboarding } = useOnboardingSteps();
  const { progress, isLoading, refreshProgress } = useProgress();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const reviewStepIndex = steps.findIndex(step => step.id === "review");
  const progressPercentage = Math.round(((reviewStepIndex + 1) / steps.length) * 100);
  
  useEffect(() => {
    const loadFreshData = async () => {
      try {
        console.log("Recarregando dados mais recentes para a revisão...");
        await refreshProgress();
        console.log("Dados atualizados para revisão:", progress);
      } catch (error) {
        console.error("Erro ao recarregar dados para revisão:", error);
        toast.error("Falha ao carregar dados atualizados. Tente recarregar a página.");
      }
    };
    
    loadFreshData();
  }, [refreshProgress]);
  
  useEffect(() => {
    if (progress) {
      console.log("Dados de progresso na tela de revisão:", progress);
      
      const validateField = (fieldName: string, value: any) => {
        if (typeof value === 'string' && fieldName !== 'current_step' && fieldName !== 'user_id' && fieldName !== 'id') {
          console.warn(`Campo ${fieldName} está como string em vez de objeto: "${value}"`);
          
          try {
            if (value !== "{}" && value !== "") {
              const parsed = JSON.parse(value);
              (progress as any)[fieldName] = parsed;
              console.log(`Campo ${fieldName} convertido automaticamente de string para objeto:`, parsed);
            }
          } catch (e) {
            console.error(`Falha ao analisar string para objeto no campo ${fieldName}:`, e);
          }
        }
      };
      
      ['ai_experience', 'business_goals', 'experience_personalization', 'complementary_info', 
       'professional_info', 'business_data', 'business_context'].forEach(field => {
        validateField(field, progress[field as keyof typeof progress]);
      });
    }
  }, [progress]);
  
  const handleNavigateToStep = (index: number) => {
    navigate(steps[index].path);
  };
  
  const handleComplete = async () => {
    if (!progress) return;
    
    try {
      setIsSubmitting(true);
      await completeOnboarding();
    } catch (error) {
      console.error("Erro ao finalizar onboarding:", error);
      toast.error("Erro ao finalizar o onboarding. Por favor, tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditStep = async (step: string, updatedData: any) => {
    try {
      setIsSubmitting(true);
      await saveStepData(step, updatedData, false, true /* allowEdit */);
      toast.success("Alteração salva com sucesso!");
      await refreshProgress();
    } catch (error) {
      toast.error("Erro ao salvar alteração. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading || !progress) {
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

  return (
    <OnboardingLayout
      currentStep={reviewStepIndex + 1}
      totalSteps={steps.length}
      title="Revisar Informações"
      backUrl="/onboarding/complementary"
      progress={progressPercentage}
    >
      <div className="space-y-6">
        <MilagrinhoMessage
          message="Vamos revisar as informações que você compartilhou conosco. Se algo estiver incorreto, clique em editar e ajuste nesta tela."
        />
        <div className="bg-gray-50 rounded-lg p-6">
          <ReviewStep 
            progress={progress}
            onComplete={handleComplete}
            isSubmitting={isSubmitting}
            navigateToStep={handleNavigateToStep}
            onEditStep={handleEditStep}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default Review;
