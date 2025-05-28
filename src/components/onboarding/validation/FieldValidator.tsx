
import React, { useEffect, useState } from 'react';
import { validatePartialData } from '@/lib/validation/onboardingSchemas';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FieldValidatorProps {
  value: any;
  field: string;
  step: string;
  children: React.ReactNode;
  showValidation?: boolean;
}

export const FieldValidator: React.FC<FieldValidatorProps> = ({
  value,
  field,
  step,
  children,
  showValidation = true
}) => {
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    error?: string;
  }>({ isValid: true });

  useEffect(() => {
    if (!value || !showValidation) {
      setValidationState({ isValid: true });
      return;
    }

    const testData = { [field]: value };
    const validation = validatePartialData(testData, step);
    
    setValidationState({
      isValid: validation.success,
      error: validation.success ? undefined : validation.error
    });
  }, [value, field, step, showValidation]);

  return (
    <div className="space-y-2">
      {children}
      
      {showValidation && value && (
        <div className="flex items-center gap-2 text-sm">
          {validationState.isValid ? (
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>Válido</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>{validationState.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
