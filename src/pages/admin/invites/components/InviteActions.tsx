
import { Copy, Mail, Trash2, RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Invite } from "@/hooks/admin/invites/types";
import { useInviteReactivate } from "@/hooks/admin/invites/useInviteReactivate";
import { APP_CONFIG } from '@/config/app';

interface InviteActionsProps {
  invite: Invite;
  onResend: (invite: Invite) => void;
  onResendEmail: (invite: Invite) => void;
  onResendWhatsApp: (invite: Invite) => void;
  onDelete: (invite: Invite) => void;
  onReactivate?: () => void;
  isResending?: boolean;
  isResendingEmail?: boolean;
  isResendingWhatsApp?: boolean;
}

const InviteActions = ({ 
  invite, 
  onResend, 
  onResendEmail,
  onResendWhatsApp,
  onDelete, 
  onReactivate, 
  isResending,
  isResendingEmail,
  isResendingWhatsApp
}: InviteActionsProps) => {
  const { reactivateInvite, isReactivating } = useInviteReactivate();
  
  const copyInviteLink = () => {
    const link = APP_CONFIG.getAppUrl(`/convite/${invite.token}`);
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const canResend = !invite.used_at && new Date(invite.expires_at) >= new Date();
  const isExpired = !invite.used_at && new Date(invite.expires_at) < new Date();
  const hasPhone = !!(invite.whatsapp_number);

  // Debug log para verificar condições
  console.log('🔍 [InviteActions Debug]:', {
    inviteId: invite.id,
    email: invite.email,
    used_at: invite.used_at,
    expires_at: invite.expires_at,
    whatsapp_number: invite.whatsapp_number,
    canResend,
    isExpired,
    hasPhone,
    now: new Date().toISOString()
  });

  const handleReactivate = async () => {
    const success = await reactivateInvite(invite);
    if (success && onReactivate) {
      onReactivate();
    }
  };

  return (
    <div className="flex items-center gap-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyInviteLink}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copiar link</TooltipContent>
        </Tooltip>

        {canResend && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onResendEmail(invite)}
                  disabled={isResendingEmail}
                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                >
                  <Mail className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reenviar email</TooltipContent>
            </Tooltip>

            {hasPhone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onResendWhatsApp(invite)}
                    disabled={isResendingWhatsApp}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reenviar WhatsApp</TooltipContent>
              </Tooltip>
            )}
          </>
        )}

        {isExpired && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReactivate}
                disabled={isReactivating}
                className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700"
              >
                <RefreshCw className={`h-4 w-4 ${isReactivating ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reativar convite (estender por 7 dias)</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(invite)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Excluir convite</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default InviteActions;
