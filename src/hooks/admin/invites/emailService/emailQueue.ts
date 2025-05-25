
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { SendInviteEmailParams, EmailQueueItem } from './types';

export function useEmailQueue() {
  const [emailQueue, setEmailQueue] = useState<EmailQueueItem[]>([]);

  const addToQueue = useCallback((params: SendInviteEmailParams) => {
    const queueItem: EmailQueueItem = {
      ...params,
      timestamp: Date.now()
    };
    setEmailQueue(prev => [...prev, queueItem]);
  }, []);

  const removeFromQueue = useCallback((email: string, inviteId?: string) => {
    setEmailQueue(prev => prev.filter(item => 
      item.email !== email || item.inviteId !== inviteId
    ));
  }, []);

  const clearEmailQueue = useCallback(() => {
    setEmailQueue([]);
  }, []);

  const retryAllPendingEmails = useCallback((sendFunction: (params: SendInviteEmailParams) => Promise<any>) => {
    const pendingEmails = [...emailQueue];
    clearEmailQueue();
    
    pendingEmails.forEach(params => {
      sendFunction(params)
        .then(result => {
          if (result.success) {
            toast.success(`Email para ${params.email} reenviado com sucesso`);
          } else {
            toast.error(`Falha ao reenviar email para ${params.email}`);
          }
        });
    });
  }, [emailQueue, clearEmailQueue]);

  return {
    emailQueue,
    addToQueue,
    removeFromQueue,
    clearEmailQueue,
    retryAllPendingEmails,
    pendingEmails: emailQueue.length
  };
}
