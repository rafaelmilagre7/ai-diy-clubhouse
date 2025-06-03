
import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ValidationFeedbackProps {
  isValid: boolean;
  isRequired: boolean;
  hasValue: boolean;
  errorMessage?: string;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  isValid,
  isRequired,
  hasValue,
  errorMessage
}) => {
  if (!isRequired) return null;

  if (!hasValue) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
        <Clock className="h-4 w-4" />
        <span>Campo obrigatório</span>
      </div>
    );
  }

  if (!isValid && errorMessage) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-400 mt-1">
        <AlertCircle className="h-4 w-4" />
        <span>{errorMessage}</span>
      </div>
    );
  }

  if (isValid && hasValue) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400 mt-1">
        <CheckCircle className="h-4 w-4" />
        <span>Válido</span>
      </div>
    );
  }

  return null;
};
