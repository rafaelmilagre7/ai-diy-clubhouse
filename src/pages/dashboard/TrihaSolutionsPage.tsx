
import React from 'react';
import { useOnboardingCompletion } from '@/hooks/onboarding/useOnboardingCompletion';
import { OnboardingBlocker } from '@/components/onboarding/OnboardingBlocker';
import LoadingScreen from '@/components/common/LoadingScreen';

// Simulando o componente da trilha (será implementado futuramente)
const TrilhaSolutionsContent = () => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🚀 Trilha de Implementação
        </h1>
        <p className="text-gray-600">
          Sua jornada personalizada de soluções de IA será implementada em breve!
        </p>
      </div>
    </div>
  );
};

const TrilhaSolutionsPage = () => {
  const { data: completionData, isLoading } = useOnboardingCompletion();

  if (isLoading) {
    return <LoadingScreen message="Verificando acesso..." />;
  }

  const isOnboardingComplete = completionData?.isCompleted || false;

  if (!isOnboardingComplete) {
    return (
      <OnboardingBlocker
        feature="Trilha de Implementação"
        description="Para acessar sua trilha personalizada de soluções de IA, você precisa completar seu onboarding primeiro. Isso nos ajuda a criar recomendações específicas para seu negócio."
        buttonText="Completar Onboarding"
        redirectTo="/onboarding"
      />
    );
  }

  return <TrilhaSolutionsContent />;
};

export default TrilhaSolutionsPage;
