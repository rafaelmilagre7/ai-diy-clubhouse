
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
    <div className="w-full space-y-6">
      {/* Barra de progresso principal redesenhada */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Progresso do Onboarding
          </span>
          <span className="text-lg font-bold text-viverblue bg-viverblue/10 px-3 py-1 rounded-full">
            {currentStep} de {totalSteps}
          </span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-viverblue to-viverblue-light h-full rounded-full shadow-sm"
            />
          </div>
          
          {/* Indicador de porcentagem */}
          <div className="absolute top-4 left-0 text-xs font-medium text-gray-500 dark:text-gray-400">
            {Math.round((currentStep / totalSteps) * 100)}% concluído
          </div>
        </div>
      </div>

      {/* Indicadores de etapas para desktop redesenhados */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* Linha de conexão */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700" />
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep - 1) / (stepTitles.length - 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-viverblue to-viverblue-light"
          />
          
          {/* Steps */}
          <div className="relative flex items-start justify-between">
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
                      "relative w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 z-10",
                      isCompleted 
                        ? "bg-gradient-to-r from-viverblue to-viverblue-light border-viverblue text-white shadow-lg"
                        : isCurrent 
                          ? "border-viverblue bg-white dark:bg-gray-800 text-viverblue ring-4 ring-viverblue/20 shadow-lg"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400"
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
                      "text-sm font-medium leading-tight",
                      isCompleted || isCurrent 
                        ? "text-viverblue" 
                        : "text-gray-400"
                    )}>
                      {title}
                    </span>
                    
                    {isCurrent && (
                      <div className="mt-1 w-2 h-2 bg-viverblue rounded-full mx-auto animate-pulse" />
                    )}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Indicador simplificado para mobile/tablet */}
      <div className="lg:hidden text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-4 py-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold",
            "bg-gradient-to-r from-viverblue to-viverblue-light border-viverblue text-white"
          )}>
            {currentStep}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {stepTitles[currentStep - 1]}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Passo {currentStep} de {totalSteps}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
