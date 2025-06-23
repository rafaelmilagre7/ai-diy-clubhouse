
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, MessageCircle, RefreshCw } from "lucide-react";
import { useInviteResend } from "@/hooks/admin/invites/useInviteResend";
import { toast } from "sonner";
import type { Invite } from "@/hooks/admin/invites/types";

interface ResendInviteDialogProps {
  invite: Invite | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ResendInviteDialog = ({ invite, open, onOpenChange, onSuccess }: ResendInviteDialogProps) => {
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { resendInvite, isSending } = useInviteResend();

  // Reset form when dialog opens
  useState(() => {
    if (open && invite) {
      setEmailEnabled(true);
      setWhatsappEnabled(!!invite.whatsapp_number);
      setWhatsappNumber(invite.whatsapp_number || "");
      setIsSubmitting(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invite || isSubmitting || isSending) return;

    // Verificar se pelo menos um canal está habilitado
    if (!emailEnabled && !whatsappEnabled) {
      toast.error("Selecione pelo menos um canal de comunicação");
      return;
    }

    // Se WhatsApp está habilitado, verificar se o número foi fornecido
    if (whatsappEnabled && !whatsappNumber.trim()) {
      toast.error("Número do WhatsApp é obrigatório quando WhatsApp está habilitado");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Determinar quais canais usar
      const channels: ('email' | 'whatsapp')[] = [];
      if (emailEnabled) channels.push('email');
      if (whatsappEnabled) channels.push('whatsapp');

      console.log('[RESEND-DIALOG] Reenviando convite:', {
        inviteId: invite.id,
        email: invite.email,
        channels,
        attempts: invite.send_attempts
      });

      await resendInvite(invite, channels, whatsappNumber.trim());
      
      toast.success('Convite reenviado com sucesso!');
      onOpenChange(false);
      onSuccess();
      
    } catch (error) {
      console.error('[RESEND-DIALOG] Erro ao reenviar:', error);
      toast.error('Erro ao reenviar convite. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailCheckboxChange = (checked: boolean | "indeterminate") => {
    setEmailEnabled(checked === true);
  };

  const handleWhatsappCheckboxChange = (checked: boolean | "indeterminate") => {
    setWhatsappEnabled(checked === true);
  };

  if (!invite) return null;

  const isLoading = isSending || isSubmitting;
  const attemptCount = invite.send_attempts || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reenviar Convite</DialogTitle>
          <DialogDescription>
            Reenvie o convite para <strong>{invite.email}</strong> via email e/ou WhatsApp
            {attemptCount > 0 && (
              <span className="block text-xs text-muted-foreground mt-1">
                Tentativas anteriores: {attemptCount}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Label>Canais de Comunicação *</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email-channel"
                  checked={emailEnabled}
                  onCheckedChange={handleEmailCheckboxChange}
                  disabled={isLoading}
                />
                <Label htmlFor="email-channel" className="flex items-center cursor-pointer">
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp-channel"
                  checked={whatsappEnabled}
                  onCheckedChange={handleWhatsappCheckboxChange}
                  disabled={isLoading}
                />
                <Label htmlFor="whatsapp-channel" className="flex items-center cursor-pointer">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </Label>
              </div>
            </div>

            {whatsappEnabled && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="whatsapp">Número do WhatsApp</Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+55 11 99999-9999"
                  required={whatsappEnabled}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Inclua código do país (ex: +55 para Brasil)
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || (!emailEnabled && !whatsappEnabled)}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reenviar {attemptCount > 0 ? `(${attemptCount + 1}ª vez)` : ''}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResendInviteDialog;
