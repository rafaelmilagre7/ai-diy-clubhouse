
import { Copy, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Invite } from "@/hooks/admin/invites/types";
import { APP_CONFIG } from '@/config/app';

interface InviteActionsProps {
  invite: Invite;
  onResend: (invite: Invite) => void;
  onDelete: (invite: Invite) => void;
  isResending?: boolean;
}

const InviteActions = ({ invite, onResend, onDelete, isResending }: InviteActionsProps) => {
  const copyInviteLink = () => {
    const link = APP_CONFIG.getAppUrl(`/convite/${invite.token}`);
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const canResend = !invite.used_at && new Date(invite.expires_at) >= new Date();

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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResend(invite)}
                disabled={isResending}
                className="h-8 w-8 p-0"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reenviar convite</TooltipContent>
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
