
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
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">
            Configuração da Conta
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Personalize sua experiência no VIVER DE IA Club
          </p>
        </div>
        <div className="bg-[#151823] border border-white/10 rounded-lg px-4 py-2">
          <span className="text-viverblue font-semibold text-sm">
            {currentStep} de {totalSteps}
          </span>
        </div>
      </div>
      
      {/* Barra de progresso principal */}
      <div className="space-y-3">
        <div className="relative">
          <div className="w-full bg-[#151823] border border-white/10 rounded-full h-2 overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-gradient-to-r from-viverblue to-viverblue-light h-full rounded-full"
            />
          </div>
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-neutral-400">
            {Math.round((currentStep / totalSteps) * 100)}% concluído
          </span>
          <span className="text-neutral-400">
            {stepTitles[currentStep - 1]}
          </span>
        </div>
      </div>

      {/* Indicadores de etapas para desktop */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Linha de conexão */}
          <div className="absolute top-6 left-0 right-0 h-px bg-white/10" />
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep - 1) / (stepTitles.length - 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-6 left-0 h-px bg-viverblue"
          />
          
          {/* Steps */}
          <div className="relative flex items-start justify-between">
            {stepTitles.map((title, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              
              return (
                <div key={stepNumber} className="flex flex-col items-center max-w-[120px]">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "relative w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300 z-10",
                      isCompleted 
                        ? "bg-viverblue border-viverblue text-[#0F111A]"
                        : isCurrent 
                          ? "border-viverblue bg-[#151823] text-viverblue"
                          : "border-white/20 bg-[#151823] text-neutral-400"
                    )}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-5 h-5" />
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
                      "text-xs font-medium leading-tight",
                      isCompleted || isCurrent 
                        ? "text-white" 
                        : "text-neutral-400"
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
        <div className="bg-[#151823] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold",
              "bg-viverblue border-viverblue text-[#0F111A]"
            )}>
              {currentStep}
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">
                {stepTitles[currentStep - 1]}
              </h3>
              <p className="text-neutral-400 text-xs">
                Etapa {currentStep} de {totalSteps}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
