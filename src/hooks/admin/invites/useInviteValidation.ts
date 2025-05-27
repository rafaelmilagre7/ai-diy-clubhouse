
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

    // Validação básica de formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Formato de email inválido');
    }

    // Removido completamente o aviso sobre emails pessoais
    // Todos os emails válidos são aceitos sem restrição

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
