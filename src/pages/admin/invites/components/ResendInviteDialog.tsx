
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInviteResend } from '@/hooks/admin/invites/useInviteResend';
import { toast } from 'sonner';

interface Invite {
  id: string;
  email: string;
  role_id: string;
  created_at: string;
  expires_at: string;
  used_at?: string;
  last_sent_at?: string;
}

interface ResendInviteDialogProps {
  invite: Invite | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ResendInviteDialog: React.FC<ResendInviteDialogProps> = ({
  invite,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { resendInvite, isResending } = useInviteResend();

  const handleResend = async () => {
    if (!invite) return;

    try {
      const result = await resendInvite(invite.id);
      
      if (result.success) {
        toast.success('Convite reenviado com sucesso!');
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erro ao reenviar convite:', error);
      toast.error('Erro ao reenviar convite');
    }
  };

  if (!invite) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reenviar Convite</DialogTitle>
          <DialogDescription>
            Tem certeza de que deseja reenviar o convite para {invite.email}?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Este convite será reenviado por email. O destinatário receberá um novo link para aceitar o convite.
          </p>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isResending}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? 'Reenviando...' : 'Reenviar Convite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResendInviteDialog;
