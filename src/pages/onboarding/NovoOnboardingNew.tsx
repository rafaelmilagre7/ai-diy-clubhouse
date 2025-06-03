
import React from 'react';
import { UnifiedOnboardingFlow } from '@/components/onboarding/modern/UnifiedOnboardingFlow';
import { PageTransition } from '@/components/transitions/PageTransition';
import { FadeTransition } from '@/components/transitions/FadeTransition';

const NovoOnboardingNew = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-[#0F111A] to-[#161A2C]">
        <div className="container mx-auto px-4 py-8">
          <FadeTransition>
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Bem-vindo ao <span className="text-viverblue">VIVER DE IA</span>
                </h1>
                <p className="text-lg text-gray-300">
                  Vamos conhecer você melhor para criar sua experiência personalizada
                </p>
              </div>
              
              <UnifiedOnboardingFlow />
            </div>
          </FadeTransition>
        </div>
      </div>
    </PageTransition>
  );
};

export default NovoOnboardingNew;
