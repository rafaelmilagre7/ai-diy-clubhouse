
import { useState, useCallback } from 'react';

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function useInviteValidation() {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: false,
    errors: [],
    warnings: []
  });

  const validateInviteData = useCallback((email: string, roleId: string) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar email
    if (!email) {
      errors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Formato de email inválido');
    }

    // Validar papel
    if (!roleId) {
      errors.push('Papel é obrigatório');
    }

    // Verificar domínios comuns
    if (email && (email.includes('@gmail.com') || email.includes('@hotmail.com'))) {
      warnings.push('Email pessoal detectado - verifique se é correto');
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    setValidationState(result);
    return result;
  }, []);

  return {
    validationState,
    validateInviteData
  };
}
