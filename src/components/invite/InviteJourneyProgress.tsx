
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, User, UserCheck, BookOpen } from 'lucide-react';

interface InviteJourneyProgressProps {
  currentPhase: 'detecting' | 'registering' | 'accepting' | 'onboarding' | 'complete';
  userEmail?: string;
  roleName?: string;
  percentage: number;
}

const phaseConfig = {
  detecting: {
    icon: Clock,
    title: 'Verificando Convite',
    description: 'Processando informações do convite...'
  },
  registering: {
    icon: User,
    title: 'Criando Conta',
    description: 'Complete seu registro para continuar'
  },
  accepting: {
    icon: UserCheck,
    title: 'Aceitando Convite',
    description: 'Aplicando permissões e configurações...'
  },
  onboarding: {
    icon: BookOpen,
    title: 'Personalizando Perfil',
    description: 'Complete seu perfil para uma experiência personalizada'
  },
  complete: {
    icon: CheckCircle,
    title: 'Bem-vindo!',
    description: 'Sua conta está configurada e pronta para uso'
  }
};

export const InviteJourneyProgress: React.FC<InviteJourneyProgressProps> = ({
  currentPhase,
  userEmail,
  roleName,
  percentage
}) => {
  const phases = Object.keys(phaseConfig) as Array<keyof typeof phaseConfig>;
  const currentIndex = phases.indexOf(currentPhase);
  const currentConfig = phaseConfig[currentPhase];
  const CurrentIcon = currentConfig.icon;

  return (
    <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <CurrentIcon className="h-8 w-8 text-viverblue" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentConfig.title}
            </h3>
            <p className="text-sm text-gray-600">
              {currentConfig.description}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progresso</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between items-center">
          {phases.map((phase, index) => {
            const PhaseIcon = phaseConfig[phase].icon;
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isUpcoming = index > currentIndex;

            return (
              <div key={phase} className="flex flex-col items-center space-y-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-viverblue border-viverblue text-white animate-pulse' : ''}
                  ${isUpcoming ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                `}>
                  <PhaseIcon className="h-4 w-4" />
                </div>
                <span className={`
                  text-xs text-center max-w-16 leading-tight
                  ${isCompleted ? 'text-green-600' : ''}
                  ${isCurrent ? 'text-viverblue font-medium' : ''}
                  ${isUpcoming ? 'text-gray-400' : ''}
                `}>
                  {phaseConfig[phase].title.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* User Info */}
        {(userEmail || roleName) && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {userEmail && (
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Email:</span>
                  <span>{userEmail}</span>
                </div>
              )}
              {roleName && (
                <div className="flex items-center space-x-1">
                  <span className="font-medium">Função:</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {roleName}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
