
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface EnhancedOnboardingStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
}

export const EnhancedOnboardingStep: React.FC<EnhancedOnboardingStepProps> = ({
  title,
  subtitle,
  children,
  currentStep,
  totalSteps,
  canProceed,
  onNext,
  onPrevious,
  isLoading = false
}) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Header com progresso */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Barra de progresso */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">
              Etapa {currentStep} de {totalSteps}
            </span>
            <span className="text-viverblue font-medium">
              {Math.round(progress)}% completo
            </span>
          </div>
          <div className="w-full bg-gray-800/50 h-2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-viverblue to-viverblue-light"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Título */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-300">
              {subtitle}
            </p>
          )}
        </div>
      </motion.div>

      {/* Conteúdo principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardContent className="p-6">
            {children}
          </CardContent>
        </Card>
      </motion.div>

      {/* Navegação */}
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Button
          variant="ghost"
          onClick={onPrevious}
          disabled={currentStep === 1 || isLoading}
          className="text-gray-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index < currentStep 
                  ? 'bg-viverblue' 
                  : index === currentStep - 1
                  ? 'bg-viverblue/50'
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={onNext}
          disabled={!canProceed || isLoading}
          className="bg-viverblue hover:bg-viverblue/90 disabled:opacity-50"
        >
          {currentStep === totalSteps ? 'Finalizar' : 'Próximo'}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
};
