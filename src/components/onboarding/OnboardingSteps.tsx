
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { BusinessGoalsStep } from "./steps/BusinessGoalsStep";
import { BusinessContextStep } from "./steps/BusinessContextStep";
import { AIExperienceStep } from "./steps/AIExperienceStep";
import { ExperiencePersonalizationStep } from "./steps/ExperiencePersonalizationStep";
import { ComplementaryInfoStep } from "./steps/ComplementaryInfoStep";
import { ReviewStep } from "./steps/ReviewStep";
import { Progress } from "@/components/ui/progress";
import { OnboardingData } from "@/types/onboarding";
import { ProfessionalDataStep } from "./steps/ProfessionalDataStep";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const OnboardingSteps = () => {
  const {
    currentStepIndex,
    currentStep,
    steps,
    isSubmitting,
    saveStepData,
    completeOnboarding,
    progress,
    navigateToStep
  } = useOnboardingSteps();
  
  // Estado local para erros de formulário
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Estado local para dados de formulário por etapa
  const [formData, setFormData] = useState<Record<string, any>>({
    personal_info: {},
    professional_info: {},
    business_context: {},
    ai_experience: {},
    business_goals: {},
    experience_personalization: {},
    complementary_info: {}
  });
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Mapeamento consistente de caminhos para IDs de etapas
  const pathToStepId = {
    "/onboarding": "personal_info",
    "/onboarding/personal-info": "personal_info",
    "/onboarding/professional-data": "professional_info", 
    "/onboarding/business-context": "business_context",
    "/onboarding/ai-experience": "ai_experience",
    "/onboarding/club-goals": "business_goals",
    "/onboarding/customization": "experience_personalization",
    "/onboarding/complementary": "complementary_info",
    "/onboarding/review": "review",
    "/onboarding/trail-generation": "trail_generation"
  };

  // Mapeamento reverso para navegação
  const stepIdToPath = {
    "personal_info": "/onboarding/personal-info",
    "professional_info": "/onboarding/professional-data",
    "business_context": "/onboarding/business-context",
    "ai_experience": "/onboarding/ai-experience",
    "business_goals": "/onboarding/club-goals",
    "experience_personalization": "/onboarding/customization",
    "complementary_info": "/onboarding/complementary",
    "review": "/onboarding/review",
    "trail_generation": "/onboarding/trail-generation"
  };

  const currentPathStepId = pathToStepId[location.pathname as keyof typeof pathToStepId];
  
  useEffect(() => {
    // Log mais detalhado para depuração
    console.log(`[OnboardingSteps] Rota: ${location.pathname}, stepId mapeado: ${currentPathStepId}, currentStep.id: ${currentStep.id}`);
    
    // Verificar se estamos em uma rota válida de onboarding
    if (location.pathname.startsWith('/onboarding') && !currentPathStepId && location.pathname !== '/onboarding') {
      console.warn(`[OnboardingSteps] Rota de onboarding não reconhecida: ${location.pathname}`);
      // Redirecionar para a primeira etapa se estiver em uma rota inválida
      navigate('/onboarding/personal-info');
    }
  }, [location.pathname, currentPathStepId, currentStep.id, navigate]);

  // Função para navegar para a etapa anterior
  const navigateToPreviousStep = (currentStepId: string) => {
    try {
      const stepIds = Object.keys(stepIdToPath);
      const currentIndex = stepIds.indexOf(currentStepId);
      
      if (currentIndex <= 0) {
        // Se for a primeira etapa ou não encontrou a etapa atual, vamos para a primeira etapa
        navigate("/onboarding/personal-info");
        return;
      }
      
      const previousStepId = stepIds[currentIndex - 1];
      const previousPath = stepIdToPath[previousStepId as keyof typeof stepIdToPath];
      
      console.log(`[OnboardingSteps] Navegando da etapa ${currentStepId} para etapa anterior ${previousStepId} (${previousPath})`);
      navigate(previousPath);
    } catch (error) {
      console.error("[OnboardingSteps] Erro ao navegar para etapa anterior:", error);
      toast.error("Erro ao navegar para a etapa anterior");
    }
  };

  // Manipulador para alterações nos campos de formulário
  const handleFormChange = (stepId: string, fieldName: string, value: any) => {
    setFormData(prevData => ({
      ...prevData,
      [stepId]: {
        ...(prevData[stepId] || {}),
        [fieldName]: value
      }
    }));
  };

  // Atualização dos IDs de componentes para corresponder aos IDs de etapas
  const stepComponents = {
    personal_info: PersonalInfoStep,
    professional_info: ProfessionalDataStep,
    business_context: BusinessContextStep,
    ai_experience: AIExperienceStep,
    business_goals: BusinessGoalsStep,
    experience_personalization: ExperiencePersonalizationStep,
    complementary_info: ComplementaryInfoStep,
    review: () => (
      <ReviewStep 
        progress={progress} 
        onComplete={completeOnboarding} 
        isSubmitting={isSubmitting}
        navigateToStep={(stepId: string) => navigateToStep(stepId)}
      />
    ),
  };

  // Determinar qual componente renderizar com base na rota atual ou no estado
  // Priorizar o ID da etapa baseado na rota atual, com fallback para o estado
  const activeStepId = currentPathStepId || currentStep.id;
  const CurrentStepComponent = stepComponents[activeStepId as keyof typeof stepComponents];
  
  if (!CurrentStepComponent) {
    console.warn(`[OnboardingSteps] Componente não encontrado para etapa: ${activeStepId}`);
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium text-red-500">Etapa não encontrada</h3>
        <p className="mt-2">Ocorreu um erro ao carregar esta etapa do onboarding.</p>
        <button 
          className="mt-4 bg-primary text-white px-4 py-2 rounded-md"
          onClick={() => navigate("/onboarding/personal-info")}
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  // Obter os dados iniciais para a etapa atual
  const getInitialDataForCurrentStep = () => {
    if (!progress) return undefined;
    
    // Tratamento específico para cada tipo de dado
    if (activeStepId === "professional_info") {
      return progress.professional_info || {};
    }
    if (activeStepId === "business_context") {
      return progress.business_context || {};
    }
    
    // Acesso direto usando o nome da seção como chave
    const sectionKey = activeStepId as keyof OnboardingData;
    return progress[sectionKey as keyof typeof progress] || {};
  };

  // Verificar se o componente da etapa precisa de dados pessoais
  const supportsPersonalInfo = (stepId: string) => {
    return (
      stepId === "professional_info" || 
      stepId === "business_context" || 
      stepId === "ai_experience" || 
      stepId === "business_goals" || 
      stepId === "experience_personalization" || 
      stepId === "complementary_info" || 
      stepId === "review"
    );
  };

  // Preparar props para o componente da etapa atual
  const getPropsForCurrentStep = () => {
    const baseProps = {
      onSubmit: saveStepData,
      isSubmitting: isSubmitting,
      isLastStep: currentStepIndex === steps.length - 1,
      onComplete: completeOnboarding,
      initialData: getInitialDataForCurrentStep(),
      onPrevious: () => navigateToPreviousStep(activeStepId),
    };

    // Props personalizados por tipo de componente
    if (activeStepId === "personal_info") {
      const personalInfoData = formData.personal_info || {};
      return {
        ...baseProps,
        formData: personalInfoData,
        errors: formErrors,
        onChange: (field: string, value: any) => handleFormChange('personal_info', field, value)
      };
    }

    if (activeStepId === "professional_info") {
      return {
        ...baseProps,
        personalInfo: progress?.personal_info || {},
      };
    }

    if (supportsPersonalInfo(activeStepId)) {
      return {
        ...baseProps,
        personalInfo: progress?.personal_info || {},
      };
    }

    return baseProps;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-white">
            {currentStep.title}
          </h2>
          <p className="text-gray-400">
            Passo {currentStepIndex + 1} de {steps.length}
          </p>
        </div>
      </div>
      
      <div className="w-full">
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="bg-gray-800 p-6 rounded-lg">
        <CurrentStepComponent
          {...getPropsForCurrentStep()}
        />
      </div>
    </div>
  );
};
