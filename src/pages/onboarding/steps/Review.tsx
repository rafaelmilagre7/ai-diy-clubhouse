
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
  
  // Encontrar o índice correto do passo de revisão e calcular progresso arredondado
  const reviewStepIndex = steps.findIndex(step => step.id === "review");
  const progressPercentage = Math.round(((reviewStepIndex + 1) / steps.length) * 100);
  
  // Efeito para atualizar dados ao entrar na página
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
  
  // Validar e normalizar dados de progresso
  useEffect(() => {
    if (progress) {
      console.log("Dados de progresso na tela de revisão:", progress);
      
      // Função para normalizar campos que podem estar como string
      const normalizeField = (fieldName: string, value: any) => {
        if (typeof value === 'string' && fieldName !== 'current_step' && fieldName !== 'user_id' && fieldName !== 'id') {
          console.log(`Tentando normalizar campo ${fieldName} que está como string: "${value}"`);
          
          // Tentativa de converter string para objeto
          try {
            if (value && value !== "{}" && value !== "") {
              const parsed = JSON.parse(value);
              console.log(`Campo ${fieldName} convertido de string para objeto:`, parsed);
              return parsed;
            }
          } catch (e) {
            console.error(`Falha ao converter string para objeto no campo ${fieldName}:`, e);
          }
        }
        return value;
      };
      
      // Criar uma cópia do progresso para não modificar o original
      const normalizedProgress = { ...progress };
      
      // Verificar e normalizar campos principais
      const fieldsToNormalize = [
        'ai_experience', 
        'business_goals', 
        'experience_personalization', 
        'complementary_info',
        'professional_info', 
        'business_data', 
        'business_context',
        'personal_info'
      ];
      
      // Aplicar normalização a todos os campos listados
      fieldsToNormalize.forEach(field => {
        if (progress[field as keyof typeof progress]) {
          const normalizedValue = normalizeField(field, progress[field as keyof typeof progress]);
          (normalizedProgress as any)[field] = normalizedValue;
        }
      });
      
      // Atualiza referência local temporária (não altera o estado global)
      Object.keys(normalizedProgress).forEach(key => {
        (progress as any)[key] = (normalizedProgress as any)[key];
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
  
  // Verificar se temos dados para mostrar
  if (isLoading) {
    return (
      <OnboardingLayout
        currentStep={reviewStepIndex + 1}
        totalSteps={steps.length}
        title="Revisar Informações"
        progress={progressPercentage}
      >
        <div className="text-center py-8">
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-gray-500" />
          <p className="mt-2 text-gray-500">Carregando seus dados...</p>
        </div>
      </OnboardingLayout>
    );
  }

  // Verificação adicional para garantir que temos dados válidos
  if (!progress) {
    return (
      <OnboardingLayout
        currentStep={reviewStepIndex + 1}
        totalSteps={steps.length}
        title="Revisar Informações"
        progress={progressPercentage}
      >
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
          <h3 className="text-lg font-medium text-amber-800">Dados não disponíveis</h3>
          <p className="mt-2 text-amber-700">
            Não foi possível carregar seus dados. Por favor, tente recarregar a página ou volte para as etapas anteriores.
          </p>
          <div className="mt-4 flex gap-3">
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
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
      progress={progressPercentage}
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
