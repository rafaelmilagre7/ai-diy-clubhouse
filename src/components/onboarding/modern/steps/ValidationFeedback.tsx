
import React from 'react';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

interface ValidationFeedbackProps {
  isValid: boolean;
  isRequired: boolean;
  hasValue: boolean;
  errorMessage?: string;
  fieldName?: string;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  isValid,
  isRequired,
  hasValue,
  errorMessage,
  fieldName
}) => {
  // Não mostrar nada se não for obrigatório
  if (!isRequired) return null;

  // Campo obrigatório vazio
  if (!hasValue) {
    return (
      <div className="flex items-center gap-2 text-sm text-yellow-400 mt-1">
        <Clock className="h-4 w-4" />
        <span>Campo obrigatório {fieldName ? `(${fieldName})` : ''}</span>
      </div>
    );
  }

  // Campo com erro de validação
  if (!isValid && errorMessage) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-400 mt-1">
        <XCircle className="h-4 w-4" />
        <span>{errorMessage}</span>
      </div>
    );
  }

  // Campo válido e preenchido
  if (isValid && hasValue) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400 mt-1">
        <CheckCircle className="h-4 w-4" />
        <span>✓ Válido</span>
      </div>
    );
  }

  return null;
};

export default ValidationFeedback;
