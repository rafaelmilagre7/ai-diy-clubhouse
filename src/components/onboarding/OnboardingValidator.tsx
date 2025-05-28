
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuickOnboardingValidation } from '@/hooks/onboarding/useQuickOnboardingValidation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

interface OnboardingValidatorProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  redirectTo?: string;
}

export const OnboardingValidator: React.FC<OnboardingValidatorProps> = ({
  children,
  requireOnboarding = true,
  redirectTo = '/onboarding-new'
}) => {
  const navigate = useNavigate();
  const { validateOnboardingCompletion } = useQuickOnboardingValidation();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!requireOnboarding) {
        setIsValid(true);
        setIsValidating(false);
        return;
      }

      try {
        const isComplete = await validateOnboardingCompletion();
        setIsValid(isComplete);
      } catch (error) {
        console.error('Erro ao validar onboarding:', error);
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    checkOnboarding();
  }, [requireOnboarding, validateOnboardingCompletion]);

  if (isValidating) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="pt-6 flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 text-viverblue animate-spin" />
          <p className="text-neutral-300">Verificando seus dados...</p>
        </CardContent>
      </Card>
    );
  }

  if (!isValid && requireOnboarding) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <h3 className="text-lg font-semibold text-white">
            Complete seu perfil
          </h3>
          <p className="text-neutral-300">
            Para acessar esta área, você precisa completar seu onboarding primeiro.
          </p>
          <Button 
            onClick={() => navigate(redirectTo)}
            className="bg-viverblue hover:bg-viverblue/90"
          >
            Completar Onboarding
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
