
import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface StepValidationFeedbackProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isSaving?: boolean;
}

export const StepValidationFeedback: React.FC<StepValidationFeedbackProps> = ({
  currentStep,
  totalSteps,
  canProceed,
  isSaving = false
}) => {
  const getStepStatus = () => {
    if (isSaving) {
      return {
        icon: <Clock className="h-4 w-4 text-yellow-400 animate-spin" />,
        message: 'Salvando...',
        className: 'text-yellow-400'
      };
    }
    
    if (canProceed) {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-400" />,
        message: 'Pronto para continuar',
        className: 'text-green-400'
      };
    }
    
    return {
      icon: <AlertCircle className="h-4 w-4 text-orange-400" />,
      message: 'Preencha os campos obrigatórios',
      className: 'text-orange-400'
    };
  };

  const status = getStepStatus();

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
      <div className="flex items-center gap-2 text-sm">
        {status.icon}
        <span className={status.className}>{status.message}</span>
      </div>
      
      <div className="text-sm text-gray-400">
        Etapa {currentStep} de {totalSteps}
      </div>
    </div>
  );
};
