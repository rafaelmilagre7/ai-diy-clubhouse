
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ValidationState {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  isValidating?: boolean;
}

interface TokenValidationResult {
  isValid: boolean;
  error?: string;
  invite?: any;
  needsLogout?: boolean;
  suggestions?: string[];
}

export const useInviteValidation = () => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: false,
    errors: [],
    warnings: [],
    suggestions: [],
    isValidating: false
  });

  const validateToken = async (token: string, userEmail?: string): Promise<TokenValidationResult> => {
    setValidationState(prev => ({ ...prev, isValidating: true }));

    try {
      // Buscar convite pelo token
      const { data: invite, error } = await supabase
        .from('invites')
        .select(`
          *,
          role:roles(name)
        `)
        .eq('token', token)
        .single();

      if (error || !invite) {
        return {
          isValid: false,
          error: 'Token de convite inválido ou expirado',
          suggestions: [
            'Verifique se o link está correto',
            'Solicite um novo convite se necessário'
          ]
        };
      }

      // Verificar se já foi usado
      if (invite.used_at) {
        return {
          isValid: false,
          error: 'Este convite já foi utilizado',
          suggestions: [
            'Este convite já foi aceito anteriormente',
            'Entre em contato se precisar de um novo convite'
          ]
        };
      }

      // Verificar se expirou
      if (new Date(invite.expires_at) < new Date()) {
        return {
          isValid: false,
          error: 'Este convite expirou',
          suggestions: [
            'Solicite um novo convite',
            'Entre em contato com o administrador'
          ]
        };
      }

      // Verificar se o usuário logado é diferente do convite
      if (userEmail && userEmail !== invite.email) {
        return {
          isValid: false,
          error: 'Este convite é para outro email',
          needsLogout: true,
          suggestions: [
            'Faça logout e entre com o email correto',
            `Este convite é para: ${invite.email}`
          ]
        };
      }

      return {
        isValid: true,
        invite
      };

    } catch (error) {
      console.error('Erro ao validar token:', error);
      return {
        isValid: false,
        error: 'Erro interno ao validar convite'
      };
    } finally {
      setValidationState(prev => ({ ...prev, isValidating: false }));
    }
  };

  const validateInviteData = (
    email: string, 
    roleId: string,
    options?: {
      phone?: string;
      channelPreference?: 'email' | 'whatsapp' | 'both';
      expiresIn?: string;
    }
  ): ValidationState => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validar email
    if (!email || email.trim() === '') {
      errors.push('Email é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Email deve ter um formato válido');
    } else {
      // Verificações avançadas de email
      if (email.includes('+')) {
        warnings.push('Emails com "+" podem ter problemas de entrega em alguns serviços');
      }
      
      if (email.length > 50) {
        warnings.push('Email muito longo pode causar problemas de visualização');
      }
      
      // Domínios temporários conhecidos
      const tempDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
      const domain = email.split('@')[1]?.toLowerCase();
      if (tempDomains.includes(domain)) {
        warnings.push('Email temporário detectado - pode não receber o convite');
      }
    }

    // Validar role
    if (!roleId || roleId.trim() === '') {
      errors.push('Papel do usuário é obrigatório');
    }

    // Validar configurações de canal
    if (options?.channelPreference) {
      if (options.channelPreference === 'whatsapp' || options.channelPreference === 'both') {
        if (!options.phone || options.phone.trim() === '') {
          errors.push('Telefone é obrigatório para envio via WhatsApp');
        } else if (!/^\+\d{10,15}$/.test(options.phone.replace(/\s/g, ''))) {
          errors.push('Telefone deve estar no formato internacional (+55...)');
        }
      }
      
      if (options.channelPreference === 'whatsapp') {
        suggestions.push('Convite será enviado apenas via WhatsApp - certifique-se de que o número está correto');
      }
    }

    // Validar período de expiração
    if (options?.expiresIn) {
      const validPeriods = ['1 day', '3 days', '7 days', '14 days', '30 days'];
      if (!validPeriods.includes(options.expiresIn)) {
        warnings.push('Período de expiração não reconhecido - usando padrão de 7 dias');
      }
      
      if (options.expiresIn === '1 day') {
        suggestions.push('Convite expira em 1 dia - considere um período maior para dar mais tempo ao usuário');
      }
    }

    // Sugestões gerais
    if (!options?.channelPreference || options.channelPreference === 'email') {
      suggestions.push('Usando canal de email padrão - WhatsApp estará disponível em breve');
    }

    const isValid = errors.length === 0;

    const result = { isValid, errors, warnings, suggestions };
    setValidationState(result);
    
    return result;
  };

  const validateEmailOnly = (email: string): boolean => {
    return !!(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  };

  const validatePhoneOnly = (phone: string): boolean => {
    return !!(phone && /^\+\d{10,15}$/.test(phone.replace(/\s/g, '')));
  };

  return {
    validationState,
    validateInviteData,
    validateEmailOnly,
    validatePhoneOnly,
    validateToken
  };
};
