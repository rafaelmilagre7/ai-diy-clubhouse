
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Sparkles, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressCircle } from './components/ProgressCircle';
import { GamificationBadge, createProfileBadges } from './components/GamificationBadge';
import { MotivationalMessage } from './components/MotivationalMessage';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  userData?: any; // Para calcular badges baseadas nos dados
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  userData = {}
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const completedSteps = currentStep - 1;
  const badges = createProfileBadges(userData);

  // Show celebration when reaching milestones
  useEffect(() => {
    if (currentStep === Math.ceil(totalSteps / 2) || currentStep === totalSteps) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, totalSteps]);

  const getMilestoneMessage = () => {
    if (currentStep === Math.ceil(totalSteps / 2)) {
      return "Você chegou na metade! Continue assim!";
    }
    if (currentStep === totalSteps) {
      return "Perfil completado! Sua jornada começa agora!";
    }
    return "";
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Cada etapa te aproxima do domínio da IA",
      "Você está construindo algo incrível",
      "Sua transformação já começou",
      "Parabéns pelo seu progresso!",
      "Falta pouco para decolar!"
    ];
    return messages[Math.min(currentStep - 1, messages.length - 1)];
  };

  return (
    <div className="w-full space-y-6">
      {/* Header com progresso circular e motivação */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-gradient-to-r from-viverblue/10 to-strategy/10 rounded-2xl border border-viverblue/20 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          {/* Progress Circle */}
          <div className="relative">
            <ProgressCircle 
              percentage={progressPercentage}
              size={80}
              strokeWidth={6}
              animate={true}
              showPercentage={true}
            />
            {showCelebration && (
              <div className="absolute -top-2 -right-2 animate-bounce">
                <div className="w-6 h-6 bg-gradient-viver rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            )}
          </div>
          
          {/* Progress Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">
                Etapa {currentStep} de {totalSteps}
              </h2>
              {completedSteps > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                  <Trophy className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-medium text-green-400">
                    {completedSteps} concluída{completedSteps > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-viverblue-light font-medium">
              {getMotivationalMessage()}
            </p>
            
            {showCelebration && (
              <div className="text-sm font-semibold text-yellow-400 animate-pulse">
                {getMilestoneMessage()}
              </div>
            )}
          </div>
        </div>

        {/* Achievement Stats com badges */}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-viverblue">{completedSteps}</div>
            <div className="text-xs text-slate-400">Completas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-strategy">{totalSteps - currentStep + 1}</div>
            <div className="text-xs text-slate-400">Restantes</div>
          </div>
          {/* Badges conquistadas */}
          <div className="flex gap-1">
            {badges.filter(b => b.earned).slice(0, 3).map(badge => (
              <GamificationBadge 
                key={badge.id} 
                badge={badge} 
                size="sm" 
                animated={true} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step indicators with enhanced design */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isNext = stepNumber === currentStep + 1;
          
          return (
            <div
              key={stepNumber}
              className={cn(
                "group relative flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 cursor-pointer",
                "hover:scale-105 hover:shadow-lg",
                isCurrent && [
                  "bg-gradient-to-br from-viverblue/20 to-viverblue/10",
                  "border-2 border-viverblue",
                  "shadow-lg shadow-viverblue/25",
                  "animate-pulse-glow"
                ],
                isCompleted && [
                  "bg-gradient-to-br from-green-500/20 to-green-400/10", 
                  "border border-green-500/50",
                  "hover:from-green-500/30 hover:to-green-400/20"
                ],
                isNext && [
                  "bg-gradient-to-br from-strategy/10 to-strategy/5",
                  "border border-strategy/30",
                  "hover:border-strategy/50"
                ],
                !isCurrent && !isCompleted && !isNext && [
                  "bg-slate-800/40 border border-slate-700",
                  "hover:bg-slate-800/60 hover:border-slate-600"
                ]
              )}
            >
              {/* Step Icon */}
              <div className={cn(
                "flex-shrink-0 relative",
                isCurrent && "animate-pulse"
              )}>
                {isCompleted ? (
                  <div className="relative">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
                  </div>
                ) : isCurrent ? (
                  <div className="relative">
                    <Target className="w-5 h-5 text-viverblue" />
                    <div className="absolute inset-0 rounded-full bg-viverblue/20 animate-ping" />
                  </div>
                ) : (
                  <Circle className={cn(
                    "w-5 h-5 transition-colors",
                    isNext ? "text-strategy" : "text-slate-500"
                  )} />
                )}
              </div>
              
              {/* Step Title */}
              <div className="flex-1 min-w-0">
                <span className={cn(
                  "text-sm font-medium transition-colors leading-tight",
                  isCurrent && "text-viverblue",
                  isCompleted && "text-green-400", 
                  isNext && "text-strategy",
                  !isCurrent && !isCompleted && !isNext && "text-slate-400"
                )}>
                  {title}
                </span>
                
                {/* Status indicator */}
                <div className="mt-1">
                  {isCompleted && (
                    <span className="text-xs text-green-300">✓ Concluído</span>
                  )}
                  {isCurrent && (
                    <span className="text-xs text-viverblue-light animate-pulse">Em andamento...</span>
                  )}
                  {isNext && (
                    <span className="text-xs text-strategy-light">→ Próximo</span>
                  )}
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-viverblue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Mensagem motivacional */}
      <MotivationalMessage 
        step={currentStep}
        completedSteps={completedSteps}
        totalSteps={totalSteps}
        className="mt-4"
      />
    </div>
  );
};
