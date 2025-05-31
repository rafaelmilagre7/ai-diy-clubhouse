
import React from 'react';

interface OnboardingFinalLayoutProps {
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  isSubmitting?: boolean;
  children: React.ReactNode;
}

export const OnboardingFinalLayout: React.FC<OnboardingFinalLayoutProps> = ({
  title,
  description,
  currentStep,
  totalSteps,
  isSubmitting,
  children
}) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        i + 1 <= currentStep 
                          ? 'bg-viverblue scale-110' 
                          : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Progress percentage */}
              <div className="w-full max-w-md mx-auto bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-viverblue h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              
              <p className="text-gray-400 text-sm mt-2">
                Etapa {currentStep} de {totalSteps} ({Math.round(progressPercentage)}%)
              </p>
            </div>

            <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
            <p className="text-gray-400 text-lg">{description}</p>
          </div>

          {/* Feedback de submissão */}
          {isSubmitting && (
            <div className="mb-6 p-4 bg-viverblue/10 border border-viverblue/20 rounded-lg">
              <div className="flex items-center justify-center gap-3 text-viverblue">
                <div className="w-5 h-5 border-2 border-viverblue border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">Finalizando seu onboarding...</span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
