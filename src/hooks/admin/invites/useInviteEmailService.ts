
import { useCallback } from 'react';
import { SendInviteEmailParams, SendInviteResponse, InviteEmailServiceReturn } from './emailService/types';
import { useLinkGenerator } from './emailService/linkGenerator';
import { useEmailQueue } from './emailService/emailQueue';
import { useEmailSender } from './emailService/emailSender';

export function useInviteEmailService(): InviteEmailServiceReturn {
  const { getInviteLink } = useLinkGenerator();
  const { 
    addToQueue, 
    removeFromQueue, 
    clearEmailQueue, 
    retryAllPendingEmails: retryQueue,
    pendingEmails 
  } = useEmailQueue();
  const { sendEmail, isSending, sendError } = useEmailSender();

  const sendInviteEmail = useCallback(async (params: SendInviteEmailParams): Promise<SendInviteResponse> => {
    const result = await sendEmail(params);
    
    // Se falhou e ainda há tentativas disponíveis, adicionar à fila
    if (!result.success && (params.retryCount || 0) < 3) {
      console.log(`Adicionando email para ${params.email} à fila de retentativas (tentativa ${(params.retryCount || 0) + 1})`);
      
      const retryParams = {
        ...params,
        retryCount: (params.retryCount || 0) + 1
      };
      
      addToQueue(retryParams);
      
      // Programar retentativa após um intervalo (aumento exponencial)
      setTimeout(() => {
        sendInviteEmail(retryParams)
          .then(retryResult => {
            if (retryResult.success) {
              removeFromQueue(params.email, params.inviteId);
            }
          });
      }, Math.pow(2, params.retryCount || 0) * 5000); // 5s, 10s, 20s
    }
    
    return result;
  }, [sendEmail, addToQueue, removeFromQueue]);

  const retryAllPendingEmails = useCallback(() => {
    retryQueue(sendInviteEmail);
  }, [retryQueue, sendInviteEmail]);

  return {
    sendInviteEmail,
    getInviteLink,
    isSending,
    sendError,
    pendingEmails,
    retryAllPendingEmails,
    clearEmailQueue
  };
}

// Removido a re-exportação do tipo SendInviteResponse para evitar conflito
