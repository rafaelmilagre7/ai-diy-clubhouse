
import { useState } from 'react';
import { toast } from 'sonner';

export const useInviteResend = () => {
  const [isResending, setIsResending] = useState(false);
  const [resendingIds, setResendingIds] = useState<Set<string>>(new Set());

  const resendInvite = async (inviteId: string) => {
    try {
      setIsResending(true);
      setResendingIds(prev => new Set([...prev, inviteId]));
      
      // Mock resend logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Convite reenviado com sucesso!');
      
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao reenviar convite:', error);
      toast.error('Erro ao reenviar convite');
      throw error;
    } finally {
      setIsResending(false);
      setResendingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(inviteId);
        return newSet;
      });
    }
  };

  const isInviteResending = (inviteId: string) => {
    return resendingIds.has(inviteId);
  };

  return {
    resendInvite,
    isResending,
    isInviteResending,
    isSending: isResending // Alias for compatibility
  };
};
