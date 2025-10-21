
import { Mail, Copy, Trash2, Calendar, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Invite } from "@/hooks/admin/invites/types";
import { formatDate } from "../utils/formatters";
import { useState } from "react";
import { APP_CONFIG } from '@/config/app';
import { useInviteDeliveryStatus } from "@/hooks/admin/invites";
import { DeliveryStatusBadge } from "@/components/admin/invites/DeliveryStatusBadge";

interface InviteRowProps {
  invite: Invite;
  onResend: (invite: Invite) => void;
  onDelete: (invite: Invite) => void;
  isResending: boolean;
}

const InviteRow = ({ invite, onResend, onDelete, isResending }: InviteRowProps) => {
  const { status } = useInviteDeliveryStatus(invite.id);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado!");
  };

  const getStatusBadge = (invite: Invite) => {
    if (invite.used_at) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-status-success/20 text-status-success">
          <CheckCircle className="h-3 w-3" />
          Utilizado
        </Badge>
      );
    }
    
    if (new Date(invite.expires_at) < new Date()) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Expirado
        </Badge>
      );
    }
    
    return (
      <Badge variant="default" className="flex items-center gap-1 bg-status-info/20 text-status-info">
        <CheckCircle className="h-3 w-3" />
        Ativo
      </Badge>
    );
  };

  const getEmailStatus = (invite: Invite) => {
    if (invite.last_sent_at) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 cursor-help">
                <Mail className="h-4 w-4 text-status-info" />
                <span className="text-sm font-medium">
                  {invite.send_attempts || 1}x
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Enviado {invite.send_attempts || 1} vez(es)</p>
              <p>Último: {formatDate(invite.last_sent_at)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    
    return (
      <Badge variant="outline" className="text-revenue border-revenue/30">
        Pendente
      </Badge>
    );
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{invite.email}</TableCell>
      <TableCell>
        <Badge variant="outline">
          {invite.role?.name || "Desconhecido"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>{formatDate(invite.expires_at)}</span>
        </div>
      </TableCell>
      <TableCell>{getStatusBadge(invite)}</TableCell>
      <TableCell>{getEmailStatus(invite)}</TableCell>
      <TableCell>
        <DeliveryStatusBadge 
          status={status.bestStatus} 
          lastEventAt={status.lastEventAt}
        />
      </TableCell>
      <TableCell className="text-right space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  copyToClipboard(APP_CONFIG.getAppUrl(`/convite/${invite.token}`));
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copiar link</p>
            </TooltipContent>
          </Tooltip>
        
          {!invite.used_at && new Date(invite.expires_at) >= new Date() && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onResend(invite)}
                  disabled={isResending}
                >
                  {isResending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reenviar convite</p>
              </TooltipContent>
            </Tooltip>
          )}
        
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(invite)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
};

interface InvitesListProps {
  invites: Invite[];
  onResend: (invite: Invite) => void;
  onDelete: (invite: Invite) => void;
}

const InvitesList = ({ invites, onResend, onDelete }: InvitesListProps) => {
  const [resendingInvites, setResendingInvites] = useState<Set<string>>(new Set());

  const handleResend = async (invite: Invite) => {
    setResendingInvites(prev => new Set(prev).add(invite.id));
    try {
      await onResend(invite);
    } finally {
      setResendingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(invite.id);
        return newSet;
      });
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead>Expira em</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Envio</TableHead>
            <TableHead>Entrega</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.length > 0 ? (
            invites.map((invite) => (
              <InviteRow
                key={invite.id}
                invite={invite}
                onResend={handleResend}
                onDelete={onDelete}
                isResending={resendingInvites.has(invite.id)}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                Nenhum convite encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvitesList;
