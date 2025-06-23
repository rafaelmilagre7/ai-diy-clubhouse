
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Brain, Users, Sparkles } from 'lucide-react';

interface OnboardingLoadingStateProps {
  type?: 'initialization' | 'preparation' | 'verification' | 'completion';
  message?: string;
}

export const OnboardingLoadingState: React.FC<OnboardingLoadingStateProps> = ({
  type = 'initialization',
  message
}) => {
  const loadingConfigs = {
    initialization: {
      icon: <Loader2 className="w-8 h-8 text-viverblue animate-spin" />,
      title: 'Inicializando Onboarding',
      defaultMessage: 'Preparando sua experiência personalizada...'
    },
    preparation: {
      icon: <Brain className="w-8 h-8 text-viverblue animate-pulse" />,
      title: 'Configurando Experiência',
      defaultMessage: 'Analisando seu perfil e preparando conteúdo...'
    },
    verification: {
      icon: <Users className="w-8 h-8 text-viverblue animate-bounce" />,
      title: 'Verificando Dados',
      defaultMessage: 'Validando informações do convite...'
    },
    completion: {
      icon: <Sparkles className="w-8 h-8 text-viverblue animate-pulse" />,
      title: 'Finalizando',
      defaultMessage: 'Concluindo seu onboarding...'
    }
  };

  const config = loadingConfigs[type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
        <CardContent className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center">
            {config.icon}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {config.title}
            </h2>
            <p className="text-neutral-300">
              {message || config.defaultMessage}
            </p>
          </div>
          
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div className="bg-viverblue h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
