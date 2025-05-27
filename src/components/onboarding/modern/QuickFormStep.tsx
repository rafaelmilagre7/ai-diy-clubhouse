
import React, { ReactNode } from 'react';
import { Progress } from '@/components/ui/progress';

interface QuickFormStepProps {
  title: string;
  description: string;
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  canProceed?: boolean;
  isSubmitting?: boolean;
  showBack?: boolean;
}

export const QuickFormStep: React.FC<QuickFormStepProps> = ({
  title,
  description,
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  canProceed = false,
  isSubmitting = false,
  showBack = false
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Ring Visual */}
      <div className="flex justify-center mb-8">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-700"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-viverblue"
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray={`${progressPercentage}, 100`}
              strokeLinecap="round"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-viverblue">
              {currentStep}/{totalSteps}
            </span>
          </div>
        </div>
      </div>

      {/* Card Principal */}
      <div className="bg-gradient-to-br from-[#151823]/90 to-[#1A1E2E]/90 backdrop-blur-sm rounded-2xl border border-viverblue/20 shadow-2xl p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-300">{description}</p>
        </div>

        {/* Conteúdo do Formulário */}
        <div className="space-y-6">
          {children}
        </div>

        {/* Navegação */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700/50">
          {showBack && onPrevious ? (
            <button
              onClick={onPrevious}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
          ) : (
            <div></div>
          )}

          {onNext && (
            <button
              onClick={onNext}
              disabled={!canProceed || isSubmitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                canProceed && !isSubmitting
                  ? 'bg-gradient-to-r from-viverblue to-viverblue-light text-white hover:from-viverblue-dark hover:to-viverblue shadow-lg hover:shadow-viverblue/25'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  Continuar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
