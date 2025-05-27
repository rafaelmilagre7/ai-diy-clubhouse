
import React from 'react';
import MemberLayout from '@/components/layout/MemberLayout';
import { OnboardingSteps } from '@/components/onboarding/OnboardingSteps';
import { MoticonAnimation } from '@/components/onboarding/MoticonAnimation';

const NovoOnboarding: React.FC = () => {
  return (
    <MemberLayout>
      <div className="bg-gradient-to-b from-[#0F111A] to-[#161A2C] min-h-[calc(100vh-80px)]">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <MoticonAnimation />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Bem-vindo ao VIVER DE IA Club
              </h1>
              <p className="text-viverblue-light text-lg">
                Vamos personalizar sua experiência em alguns passos simples
              </p>
            </div>
            
            <OnboardingSteps />
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default NovoOnboarding;
