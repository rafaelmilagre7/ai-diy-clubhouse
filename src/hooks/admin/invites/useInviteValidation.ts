
import { useState, useCallback } from 'react';
import { validateInviteToken, InviteValidationResult } from '@/utils/inviteValidationUtils';

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isValidating: boolean;
}

export const useInviteValidation = () => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: true,
    errors: [],
    warnings: [],
    isValidating: false
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

    // Validar role
    if (!roleId) {
      errors.push('Papel é obrigatório');
    }

    // Verificar domínios comuns que podem gerar problemas
    if (email && /^[^\s@]+@(gmail|yahoo|hotmail|outlook)\.(com|com\.br)$/i.test(email)) {
      warnings.push('Emails de provedores gratuitos podem ter problemas de entrega');
    }

    const isValid = errors.length === 0;

    setValidationState({
      isValid,
      errors,
      warnings,
      isValidating: false
    });

    return { isValid, errors, warnings };
  }, []);

  const validateToken = useCallback(async (
    token: string,
    currentUserEmail?: string
  ): Promise<InviteValidationResult> => {
    setValidationState(prev => ({ ...prev, isValidating: true }));
    
    try {
      const result = await validateInviteToken(token, currentUserEmail);
      
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        isValid: result.isValid,
        errors: result.isValid ? [] : [result.error || 'Erro na validação'],
        warnings: result.suggestions || []
      }));
      
      return result;
    } catch (error) {
      setValidationState(prev => ({
        ...prev,
        isValidating: false,
        isValid: false,
        errors: ['Erro interno na validação'],
        warnings: []
      }));
      
      throw error;
    }
  }, []);

  return {
    validationState,
    validateInviteData,
    validateToken
  };
};
