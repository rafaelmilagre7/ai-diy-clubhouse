
import React, { useEffect, useState } from "react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { TrailGuidedExperience } from "@/components/onboarding/TrailGuidedExperience";
import { useNavigate } from "react-router-dom";
import { useProgress } from "@/hooks/onboarding/useProgress";
import { useOnboardingSteps } from "@/hooks/onboarding/useOnboardingSteps";
import MilagrinhoAssistant from "@/components/onboarding/MilagrinhoAssistant";

const TrailGeneration = () => {
  const navigate = useNavigate();
  const { progress } = useProgress();
  const { completeOnboarding } = useOnboardingSteps();
  const [trailCompleted, setTrailCompleted] = useState(false);

  const handleTrailComplete = async () => {
    try {
      await completeOnboarding();
      setTrailCompleted(true);
      // Aguardar um pouco antes de navegar para mostrar o feedback
      setTimeout(() => {
        navigate("/onboarding/completed");
      }, 2000);
    } catch (error) {
      console.error("Erro ao finalizar onboarding:", error);
    }
  };

  const handlePrevious = () => {
    navigate("/onboarding/ai-experience");
  };

  return (
    <OnboardingLayout 
      currentStep={3} 
      totalSteps={3}
      title="Sua Trilha Personalizada" 
      onBackClick={handlePrevious}
      hideProgress={trailCompleted}
    >
      <div className="space-y-8">
        <MilagrinhoAssistant
          userName={progress?.personal_info?.name?.split(' ')[0]}
          message="Agora vou criar sua trilha personalizada de implementação de IA! Com base no seu perfil, vou selecionar as melhores soluções para transformar seu negócio."
        />
        
        <TrailGuidedExperience 
          autoStart={true}
        />
        
        {trailCompleted && (
          <div className="text-center py-8">
            <div className="bg-gradient-to-r from-[#0ABAB5] to-[#34D399] text-white p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">🎉 Parabéns!</h3>
              <p>Sua trilha foi gerada com sucesso! Redirecionando...</p>
            </div>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default TrailGeneration;
