
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, UserPlus, Settings, CheckCircle } from 'lucide-react';

interface LoadingStateProps {
  type: 'verification' | 'preparation' | 'initialization' | 'completion';
  message?: string;
}

export const OnboardingLoadingState: React.FC<LoadingStateProps> = ({ 
  type, 
  message 
}) => {
  const configs = {
    verification: {
      icon: <Loader2 className="w-8 h-8 text-viverblue animate-spin" />,
      title: 'Verificando convite...',
      description: 'Validando suas credenciais de acesso',
      defaultMessage: 'Aguarde enquanto verificamos seu convite'
    },
    preparation: {
      icon: <Settings className="w-8 h-8 text-viverblue animate-spin" />,
      title: 'Preparando dados...',
      description: 'Configurando sua experiência personalizada',
      defaultMessage: 'Organizando informações para o seu perfil'
    },
    initialization: {
      icon: <UserPlus className="w-8 h-8 text-viverblue animate-pulse" />,
      title: 'Configurando sua conta...',
      description: 'Inicializando seu ambiente de trabalho',
      defaultMessage: 'Criando sua área personalizada'
    },
    completion: {
      icon: <CheckCircle className="w-8 h-8 text-green-400" />,
      title: 'Finalizando configuração...',
      description: 'Últimos ajustes para uma experiência perfeita',
      defaultMessage: 'Quase pronto! Salvando suas preferências'
    }
  };

  const config = configs[type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F111A] to-[#151823] flex items-center justify-center">
      <Card className="w-full max-w-md bg-[#1A1E2E]/90 backdrop-blur-sm border-white/20">
        <CardContent className="p-6 text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-viverblue/20 rounded-full flex items-center justify-center">
            {config.icon}
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">
              {config.title}
            </h2>
            <p className="text-neutral-300 text-sm">
              {config.description}
            </p>
          </div>

          <div className="bg-[#252842]/50 rounded-lg p-4">
            <p className="text-neutral-400 text-sm">
              {message || config.defaultMessage}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="w-full bg-[#252842] rounded-full h-2">
            <div className="bg-viverblue h-2 rounded-full animate-pulse" style={{
              width: type === 'verification' ? '25%' : 
                     type === 'preparation' ? '50%' : 
                     type === 'initialization' ? '75%' : '100%'
            }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
