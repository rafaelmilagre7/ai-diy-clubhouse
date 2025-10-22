import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export interface InviteValidationResult {
  valid: boolean;
  invite?: {
    id: string;
    email: string;
    role_id: string;
    expires_at: string;
    created_at: string;
    notes?: string;
    profile_data?: {
      name?: string;
      whatsapp_number?: string;
      status: string;
    };
  };
  role?: {
    id: string;
    name: string;
    description: string;
  };
  reason?: string;
  message: string;
}

export const useInviteValidation = () => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationState, setValidationState] = useState({
    isValidating: false,
    error: null,
    result: null
  });

  const validateToken = async (token: string, userEmail?: string): Promise<InviteValidationResult> => {
    if (!token?.trim()) {
      return {
        valid: false,
        reason: 'missing_token',
        message: 'Token de convite não fornecido'
      };
    }

    setIsValidating(true);
    setValidationState({ isValidating: true, error: null, result: null });

    try {
      // 🎯 NOVO: Buscar dados do convite + perfil pré-existente
      const { data: validationResult, error } = await supabase.rpc('validate_invite_token_safe', {
        p_token: token.trim()
      });

      if (error) {
        console.error('❌ [INVITE-VALIDATION] Erro na validação:', error);
        const result = {
          valid: false,
          reason: 'validation_error',
          message: 'Erro ao validar convite'
        };
        setValidationState({ isValidating: false, error, result });
        return result;
      }

      if (!validationResult?.valid) {
        const result = {
          valid: false,
          reason: validationResult?.reason || 'invalid_token',
          message: validationResult?.message || 'Token de convite inválido'
        };
        setValidationState({ isValidating: false, error: null, result });
        return result;
      }

      // Buscar dados do perfil pré-existente
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, whatsapp_number, status')
        .eq('email', validationResult.invite.email)
        .eq('status', 'invited')
        .single();

      const result: InviteValidationResult = {
        valid: true,
        invite: {
          ...validationResult.invite,
          profile_data: profileData || undefined
        },
        role: validationResult.role,
        message: 'Convite válido'
      };

      setValidationState({ isValidating: false, error: null, result });
      return result;

    } catch (error: any) {
      console.error('❌ [INVITE-VALIDATION] Erro inesperado:', error);
      toast({
        title: "Erro na validação",
        description: "Não foi possível validar o convite. Tente novamente.",
        variant: "destructive",
      });
      
      const result = {
        valid: false,
        reason: 'unexpected_error',
        message: 'Erro inesperado na validação'
      };
      setValidationState({ isValidating: false, error, result });
      return result;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateToken,
    isValidating,
    validationState
  };
};