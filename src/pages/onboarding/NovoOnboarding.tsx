
import React from 'react';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '@/components/layout/MemberLayout';

const NovoOnboarding: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <MemberLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Bem-vindo ao VIVER DE IA</h1>
            <p className="text-lg text-muted-foreground">
              Preencha este formulário para personalizarmos sua experiência na plataforma.
            </p>
          </div>
          
          <OnboardingForm onSuccess={handleSuccess} />
        </div>
      </div>
    </MemberLayout>
  );
};

export default NovoOnboarding;
