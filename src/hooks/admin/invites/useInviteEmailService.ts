
import { useState, useCallback } from 'react';
import { useInviteChannelService } from './useInviteChannelService';
import { useEmailEmergencyRecovery } from '../email/useEmailEmergencyRecovery';
import { SendInviteResponse } from './types';
import { toast } from 'sonner';

export function useInviteEmailService() {
  const [sendingEmails, setSendingEmails] = useState<Set<string>>(new Set());
  const { getInviteLink, sendEmailInvite } = useInviteChannelService();
  const { attemptEmailRecovery } = useEmailEmergencyRecovery();

  const sendInviteEmail = useCallback(async ({
    email,
    inviteUrl,
    roleName,
    expiresAt,
    senderName,
    notes,
    inviteId,
    forceResend = false
  }: {
    email: string;
    inviteUrl: string;
    roleName: string;
    expiresAt: string;
    senderName?: string;
    notes?: string;
    inviteId?: string;
    forceResend?: boolean;
  }): Promise<SendInviteResponse> => {
    const emailKey = `${email}-${inviteId}`;
    setSendingEmails(prev => new Set(prev).add(emailKey));

    try {
      console.log(`📧 [EMAIL-SERVICE] Enviando convite para:`, email);

      // Primeira tentativa via sistema principal
      const primaryResult = await sendEmailInvite({
        email,
        inviteUrl,
        roleName,
        expiresAt,
        senderName,
        notes,
        inviteId,
        forceResend
      });

      if (primaryResult.success) {
        console.log(`✅ [EMAIL-SERVICE] Sucesso via sistema principal`);
        return primaryResult;
      }

      console.warn(`⚠️ [EMAIL-SERVICE] Falha no sistema principal, iniciando recuperação...`);
      
      // Se falhou, tentar recuperação automática
      const recoveryResult = await attemptEmailRecovery(
        email,
        inviteUrl,
        roleName,
        primaryResult.error
      );

      if (recoveryResult.success) {
        return {
          success: true,
          message: `Email recuperado via ${recoveryResult.method}`,
          emailId: recoveryResult.data?.emailId,
          strategy: 'recovery',
          method: recoveryResult.method,
          channel: 'email'
        };
      }

      // Se todas as tentativas falharam
      console.error(`❌ [EMAIL-SERVICE] Todas as tentativas falharam para:`, email);
      
      return {
        success: false,
        message: 'Falha em todas as tentativas de envio',
        error: `Principal: ${primaryResult.error}, Recovery: ${recoveryResult.error}`,
        suggestion: 'Verifique as configurações do sistema e tente novamente.',
        channel: 'email'
      };

    } catch (error: any) {
      console.error(`❌ [EMAIL-SERVICE] Erro crítico:`, error);
      
      return {
        success: false,
        message: 'Erro crítico no serviço de email',
        error: error.message,
        channel: 'email'
      };
    } finally {
      setSendingEmails(prev => {
        const newSet = new Set(prev);
        newSet.delete(emailKey);
        return newSet;
      });
    }
  }, [sendEmailInvite, attemptEmailRecovery]);

  return {
    getInviteLink,
    sendInviteEmail,
    sendingEmails
  };
};
