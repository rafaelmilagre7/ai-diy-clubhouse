
import React from 'react';
import { useOnboardingCompletion } from '@/hooks/onboarding/useOnboardingCompletion';
import { OnboardingBlocker } from '@/components/onboarding/OnboardingBlocker';
import LoadingScreen from '@/components/common/LoadingScreen';

// Simulando o componente do networking (será implementado futuramente)
const NetworkingContent = () => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🤝 Networking Inteligente
        </h1>
        <p className="text-gray-600">
          Conecte-se com outros empreendedores do VIVER DE IA Club!
        </p>
      </div>
    </div>
  );
};

const NetworkingPage = () => {
  const { data: completionData, isLoading } = useOnboardingCompletion();

  if (isLoading) {
    return <LoadingScreen message="Verificando acesso..." />;
  }

  const isOnboardingComplete = completionData?.isCompleted || false;

  if (!isOnboardingComplete) {
    return (
      <OnboardingBlocker
        feature="Networking Inteligente"
        description="Para participar do networking e conectar-se com outros membros, você precisa completar seu onboarding primeiro. Isso nos permite fazer conexões mais relevantes baseadas no seu perfil."
        buttonText="Completar Onboarding"
        redirectTo="/onboarding"
      />
    );
  }

  return <NetworkingContent />;
};

export default NetworkingPage;
