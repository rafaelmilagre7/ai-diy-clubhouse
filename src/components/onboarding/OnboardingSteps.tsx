
import { useState } from "react";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { AIExperienceStep } from "./steps/AIExperienceStep";
import { TrailMagicExperience } from "./TrailMagicExperience";
import { Progress } from "@/components/ui/progress";
import { OnboardingData } from "@/types/onboarding";
import { usePersonalInfoStep } from "@/hooks/onboarding/usePersonalInfoStep";
import { useAIExperienceStep } from "@/hooks/onboarding/useAIExperienceStep";
import MilagrinhoAssistant from "./MilagrinhoAssistant";
import { useNavigate } from "react-router-dom";

export const OnboardingSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { completeOnboarding, progress } = useOnboardingSteps();
  
  const personalInfoHook = usePersonalInfoStep();
  const aiExperienceHook = useAIExperienceStep();

  const steps = [
    {
      id: "personal_info",
      title: "Informações Pessoais",
      description: "Vamos começar conhecendo você melhor"
    },
    {
      id: "ai_experience", 
      title: "Experiência com IA",
      description: "Conte-nos sobre sua jornada com IA"
    },
    {
      id: "trail_generation",
      title: "Sua Trilha Personalizada",
      description: "Criando sua trilha de implementação única"
    }
  ];

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  const handlePersonalInfoSubmit = async () => {
    const success = await personalInfoHook.handleSubmit();
    if (success) {
      setCurrentStep(1);
    }
  };

  const handleAIExperienceSubmit = async () => {
    const success = await aiExperienceHook.handleSubmit();
    if (success) {
      setCurrentStep(2);
    }
  };

  const handleTrailComplete = async () => {
    try {
      await completeOnboarding();
      navigate("/onboarding/completed");
    } catch (error) {
      console.error("Erro ao finalizar onboarding:", error);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="animate-fade-in">
            <MilagrinhoAssistant
              userName={progress?.personal_info?.name?.split(' ')[0]}
              message="Para começar, vou precisar de algumas informações pessoais para personalizar sua experiência no VIVER DE IA Club."
            />
            <PersonalInfoStep
              onSubmit={handlePersonalInfoSubmit}
              isSubmitting={personalInfoHook.isSubmitting}
              formData={personalInfoHook.formData}
              errors={personalInfoHook.errors}
              onChange={personalInfoHook.handleChange}
              initialData={personalInfoHook.formData}
              onPrevious={undefined}
            />
          </div>
        );
      
      case 1:
        return (
          <div className="animate-fade-in">
            <MilagrinhoAssistant
              userName={progress?.personal_info?.name?.split(' ')[0]}
              message="Agora me conte sobre sua experiência com IA para eu poder recomendar as melhores soluções para você!"
            />
            <AIExperienceStep
              onSubmit={handleAIExperienceSubmit}
              isSubmitting={aiExperienceHook.isSubmitting}
              initialData={aiExperienceHook.formData}
              personalInfo={progress?.personal_info}
              onPrevious={handlePrevious}
            />
          </div>
        );
      
      case 2:
        return (
          <div className="animate-fade-in">
            <MilagrinhoAssistant
              userName={progress?.personal_info?.name?.split(' ')[0]}
              message="Agora vou criar sua trilha personalizada de implementação de IA! Com base no seu perfil, vou selecionar as melhores soluções para transformar seu negócio."
            />
            <TrailMagicExperience onFinish={handleTrailComplete} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-white">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-400">
            {steps[currentStep].description}
          </p>
          <p className="text-sm text-gray-500">
            Passo {currentStep + 1} de {steps.length}
          </p>
        </div>
      </div>
      
      <div className="w-full">
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
        {renderCurrentStep()}
      </div>
    </div>
  );
};
