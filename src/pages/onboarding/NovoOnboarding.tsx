
import React from 'react';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';
import { MoticonAnimation } from '@/components/onboarding/MoticonAnimation';

const NovoOnboarding: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <MemberLayout>
      <div className="bg-gradient-to-b from-[#0F111A] to-[#161A2C] min-h-[calc(100vh-80px)]">
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 text-center">
              <div className="flex justify-center mb-6">
                <MoticonAnimation />
              </div>
              <h1 className="text-4xl font-heading font-bold mb-3 text-white bg-clip-text bg-gradient-to-r from-white to-white/70">
                Bem-vindo ao VIVER DE IA
              </h1>
              <p className="text-xl text-viverblue-light max-w-2xl mx-auto">
                Preencha este formulário para personalizarmos sua experiência na plataforma.
              </p>
            </div>
            
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl shadow-xl p-8">
              <OnboardingForm onSuccess={handleSuccess} />
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default NovoOnboarding;
