
import { useState, useCallback } from 'react';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function useInviteValidation() {
  const [validationState, setValidationState] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });

  const validateEmail = useCallback((email: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validação básica de formato mais robusta
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!email || !email.trim()) {
      errors.push('Email é obrigatório');
    } else if (!emailRegex.test(email.trim())) {
      errors.push('Formato de email inválido');
    } else {
      // Verificações adicionais para melhor UX
      const emailLower = email.toLowerCase().trim();
      
      // Verificar domínios suspeitos (apenas warning)
      if (emailLower.includes('temp') || emailLower.includes('10min') || emailLower.includes('throwaway')) {
        warnings.push('Email temporário detectado - considere usar um email permanente');
      }
      
      // Verificar se tem TLD válido
      const parts = emailLower.split('@');
      if (parts.length === 2) {
        const domain = parts[1];
        if (!domain.includes('.') || domain.endsWith('.') || domain.startsWith('.')) {
          errors.push('Domínio do email inválido');
        }
      }
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    setValidationState(result);
    return result;
  }, []);

  const validateRole = useCallback((roleId: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!roleId || roleId.trim() === '') {
      errors.push('Papel é obrigatório');
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    return result;
  }, []);

  const validateInviteData = useCallback((email: string, roleId: string): ValidationResult => {
    const emailValidation = validateEmail(email);
    const roleValidation = validateRole(roleId);

    const result = {
      isValid: emailValidation.isValid && roleValidation.isValid,
      errors: [...emailValidation.errors, ...roleValidation.errors],
      warnings: [...emailValidation.warnings, ...roleValidation.warnings]
    };

    setValidationState(result);
    return result;
  }, [validateEmail, validateRole]);

  return {
    validationState,
    validateEmail,
    validateRole,
    validateInviteData
  };
}
