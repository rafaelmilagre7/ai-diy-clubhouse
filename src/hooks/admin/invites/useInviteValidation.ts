
import { useState } from "react";

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
      warnings
    };

    setValidationState(newState);
    return newState;
  };

  return {
    validationState,
    validateInviteData
  };
};
