
import React from 'react';
import { ModernOnboardingFlowNew } from '@/components/onboarding/modern/ModernOnboardingFlowNew';

const NovoOnboardingNew: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F111A] to-[#161A2C]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Bem-vindo ao VIVER DE IA Club
            </h1>
            <p className="text-viverblue-light text-lg">
              Vamos personalizar sua experiência em alguns passos simples
            </p>
          </div>
          
          <ModernOnboardingFlowNew />
        </div>
      </div>
    </div>
  );
};

export default NovoOnboardingNew;
