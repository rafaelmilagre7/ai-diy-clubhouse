
import { supabase } from '@/lib/supabase';
import { RetryManager } from '@/utils/retryUtils';

export interface InviteValidationResult {
  valid: boolean;
  error?: string;
  message: string;
  inviteEmail?: string;
  userEmail?: string;
}

export class InviteSecurityUtils {
  /**
   * Valida se um usuário pode aceitar um convite específico
   */
  static async validateUserInviteMatch(
    token: string, 
    userId?: string
  ): Promise<InviteValidationResult> {
    try {
      console.log('[INVITE-SECURITY] Iniciando validação backend para token:', token.substring(0, 8) + '***');
      
      const result = await RetryManager.withRetry(async () => {
        const { data, error } = await supabase.rpc('validate_user_invite_match', {
          p_token: token,
          p_user_id: userId || null
        });

        if (error) throw error;
        return data;
      });

      console.log('[INVITE-SECURITY] Resultado da validação:', {
        valid: result?.valid,
        error: result?.error,
        hasInviteEmail: !!result?.invite_email,
        hasUserEmail: !!result?.user_email
      });

      return {
        valid: result?.valid || false,
        error: result?.error,
        message: result?.message || 'Erro desconhecido na validação',
        inviteEmail: result?.invite_email,
        userEmail: result?.user_email
      };
    } catch (error: any) {
      console.error('[INVITE-SECURITY] Erro na validação backend:', error);
      
      return {
        valid: false,
        error: 'validation_failed',
        message: error.message || 'Falha na validação do convite'
      };
    }
  }

  /**
   * Registra tentativa de uso de convite para auditoria
   */
  static async logInviteUsageAttempt(
    token: string,
    success: boolean,
    details: string,
    userId?: string
  ): Promise<void> {
    try {
      await RetryManager.withRetry(async () => {
        await supabase.rpc('ensure_audit_log', {
          p_event_type: 'invite_usage',
          p_action: success ? 'accept_success' : 'accept_failure',
          p_resource_id: token,
          p_details: {
            success,
            details,
            userId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        });
      });

      console.log('[INVITE-SECURITY] Log de auditoria registrado:', {
        success,
        details: details.substring(0, 50) + '...'
      });
    } catch (error) {
      console.error('[INVITE-SECURITY] Erro ao registrar log de auditoria:', error);
      // Não lançar erro para não quebrar o fluxo principal
    }
  }

  /**
   * Valida formato e integridade básica do token
   */
  static validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Token deve ter pelo menos 8 caracteres
    if (token.length < 8) {
      return false;
    }

    // Token deve conter apenas caracteres alfanuméricos
    const validTokenRegex = /^[A-Z0-9]+$/i;
    return validTokenRegex.test(token);
  }

  /**
   * Limpa e normaliza token de convite
   */
  static normalizeToken(token: string): string {
    return token.trim().toUpperCase().replace(/\s+/g, '');
  }
}
