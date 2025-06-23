
import { useState, useEffect } from 'react';
import { CreateInviteParams } from './types';

interface ValidationErrors {
  email?: string;
  userName?: string;
  whatsappNumber?: string;
  channels?: string;
  roleId?: string;
}

export const useInviteValidation = (formData: Partial<CreateInviteParams>) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const newErrors: ValidationErrors = {};

    // Validar email
    if (!formData.email || formData.email.trim() === '') {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar roleId
    if (!formData.roleId) {
      newErrors.roleId = 'Cargo é obrigatório';
    }

    // Validar canais
    if (!formData.channels || formData.channels.length === 0) {
      newErrors.channels = 'Pelo menos um canal deve ser selecionado';
    }

    // Validações específicas para WhatsApp
    if (formData.channels?.includes('whatsapp')) {
      if (!formData.userName || formData.userName.trim() === '') {
        newErrors.userName = 'Nome é obrigatório para envio via WhatsApp';
      }

      if (!formData.whatsappNumber || formData.whatsappNumber.trim() === '') {
        newErrors.whatsappNumber = 'Número do WhatsApp é obrigatório';
      } else {
        // Validação básica do formato do WhatsApp
        const cleanNumber = formData.whatsappNumber.replace(/\D/g, '');
        if (cleanNumber.length < 10 || cleanNumber.length > 15) {
          newErrors.whatsappNumber = 'Número do WhatsApp deve ter entre 10 e 15 dígitos';
        }
      }
    }

    setErrors(newErrors);
    setIsValid(Object.keys(newErrors).length === 0);
  }, [formData]);

  return {
    errors,
    isValid,
    hasErrors: Object.keys(errors).length > 0
  };
};
