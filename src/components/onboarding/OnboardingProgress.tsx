
import React from 'react';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

export const OnboardingProgress = ({ 
  currentStep, 
  totalSteps, 
  stepTitles 
}: OnboardingProgressProps) => {
  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">
            Configuração da Conta
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            Personalize sua experiência no VIVER DE IA Club
          </p>
        </div>
        <div className="bg-[#1A1E2E]/60 backdrop-blur-sm border border-viverblue/30 rounded-lg px-4 py-2">
          <span className="text-viverblue font-semibold text-sm">
            {currentStep} de {totalSteps}
          </span>
        </div>
      </div>

      {/* Indicadores de etapas para desktop */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Linha de conexão */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10 -z-10"></div>
          <div 
            className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-viverblue to-viverblue-light transition-all duration-500 -z-10"
            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          ></div>
          
          {/* Steps */}
          <div className="flex items-start justify-between">
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              
              return (
                <div key={stepNumber} className="flex flex-col items-center max-w-[140px]">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "relative w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all duration-300 z-10 shadow-lg",
                      isCompleted 
                        ? "bg-viverblue border-viverblue text-[#0F111A] shadow-viverblue/30"
                        : isCurrent 
                          ? "border-viverblue bg-[#1A1E2E] text-viverblue shadow-viverblue/20"
                          : "border-white/20 bg-[#151823] text-slate-400"
                    )}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      stepNumber
                    )}
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="mt-3 text-center"
                  >
                    <span className={cn(
                      "text-xs font-medium leading-tight block",
                      isCompleted || isCurrent 
                        ? "text-white" 
                        : "text-slate-400"
                    )}>
                      {title}
                    </span>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Indicador simplificado para mobile/tablet */}
      <div className="lg:hidden">
        <div className="bg-[#1A1E2E]/60 backdrop-blur-sm border border-viverblue/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-semibold shadow-lg",
              "bg-viverblue border-viverblue text-[#0F111A] shadow-viverblue/30"
            )}>
              {currentStep}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">
                {stepTitles[currentStep - 1]}
              </h3>
              <p className="text-slate-300 text-xs">
                Etapa {currentStep} de {totalSteps}
              </p>
            </div>
            <div className="text-right">
              <div className="w-16 bg-white/10 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-viverblue to-viverblue-light transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-300 mt-1 block">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
