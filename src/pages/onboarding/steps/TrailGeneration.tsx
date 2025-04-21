
import { TrailGuidedExperience } from "@/components/onboarding/TrailGuidedExperience";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { useEffect } from "react";

const TrailGeneration = () => {
  // Adicionar logs para debug
  useEffect(() => {
    console.log("Componente TrailGeneration montado");
    // Verificar se temos o Three.js carregado
    if (typeof THREE !== 'undefined') {
      console.log("Three.js está carregado corretamente");
    } else {
      console.warn("Three.js não está definido! Isso pode causar problemas na experiência 3D");
    }
  }, []);

  return (
    <OnboardingLayout 
      currentStep={9} 
      title="Sua Trilha Personalizada"
      backUrl="/onboarding/review"
    >
      <div className="max-w-5xl mx-auto p-4">
        <TrailGuidedExperience />
      </div>
    </OnboardingLayout>
  );
};

export default TrailGeneration;
