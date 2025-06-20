
import { useState, useEffect } from 'react';

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const useInviteValidation = () => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: false,
    errors: [],
    warnings: []
  });

  const validateInviteData = (email: string, roleId: string): ValidationState => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar email
    if (!email || email.trim() === '') {
      errors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Email deve ter um formato válido');
    }

    // Validar role
    if (!roleId || roleId.trim() === '') {
      errors.push('Papel do usuário é obrigatório');
    }

    // Avisos
    if (email && email.includes('+')) {
      warnings.push('Emails com "+" podem ter problemas de entrega');
    }

    const isValid = errors.length === 0;

    const result = { isValid, errors, warnings };
    setValidationState(result);
    
    return result;
  };

  return {
    validationState,
    validateInviteData
  };
};
