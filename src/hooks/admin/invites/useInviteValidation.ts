
import { useState } from "react";

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isValidating: boolean;
}

export const useInviteValidation = () => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: false,
    errors: [],
    warnings: [],
    isValidating: false
  });

  const validateInviteData = (email: string, roleId: string) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar email
    if (!email) {
      errors.push("Email é obrigatório");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Formato de email inválido");
    }

    // Validar role
    if (!roleId) {
      errors.push("Papel é obrigatório");
    }

    const isValid = errors.length === 0;

    const newState = {
      isValid,
      errors,
      warnings,
      isValidating: false
    };

    setValidationState(newState);
    return newState;
  };

  const validateToken = async (token: string, userEmail?: string) => {
    setValidationState(prev => ({ ...prev, isValidating: true }));
    
    try {
      // Simular validação de token
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock de resultado de validação
      const result = {
        isValid: true,
        invite: {
          email: userEmail || "test@example.com",
          role: "member"
        }
      };
      
      setValidationState(prev => ({ ...prev, isValidating: false }));
      return result;
    } catch (error) {
      setValidationState(prev => ({ 
        ...prev, 
        isValidating: false,
        isValid: false,
        errors: ["Erro ao validar token"]
      }));
      throw error;
    }
  };

  return {
    validationState,
    validateInviteData,
    validateToken
  };
};
