
import { useState, useCallback } from 'react';
import { validateInviteToken, InviteValidationResult } from '@/utils/inviteValidationUtils';

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export function useInviteValidation() {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  });

  const validateInviteData = useCallback((email: string, roleId: string): ValidationState => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.push('Email é obrigatório');
    } else if (!emailRegex.test(email)) {
      errors.push('Formato de email inválido');
    }
    
    // Validar papel
    if (!roleId) {
      errors.push('Papel é obrigatório');
    }
    
    // Verificar domínios suspeitos
    if (email && email.includes('@temp') || email.includes('@fake')) {
      warnings.push('Email parece ser temporário ou fake');
    }
    
    const result = {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions: []
    };
    
    setValidationState(result);
    return result;
  }, []);

  const validateInviteTokenAsync = useCallback(async (
    token: string, 
    currentUserEmail?: string
  ): Promise<InviteValidationResult> => {
    return await validateInviteToken(token, currentUserEmail);
  }, []);

  const resetValidation = useCallback(() => {
    setValidationState({
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    });
  }, []);

  return {
    validationState,
    validateInviteData,
    validateInviteTokenAsync,
    resetValidation
  };
}
