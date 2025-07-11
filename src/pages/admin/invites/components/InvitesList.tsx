
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

interface InvitesListProps {
  invites: Invite[];
  onResend: (invite: Invite) => void;
  onDelete: (invite: Invite) => void;
}

const InvitesList = ({ invites, onResend, onDelete }: InvitesListProps) => {
  const [resendingInvites, setResendingInvites] = useState<Set<string>>(new Set());

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copiado!");
  };

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

  const getStatusBadge = (invite: Invite) => {
    if (invite.used_at) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
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
      <Badge variant="default" className="flex items-center gap-1 bg-blue-100 text-blue-800">
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
                <Mail className="h-4 w-4 text-blue-500" />
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
      <Badge variant="outline" className="text-orange-600 border-orange-300">
        Pendente
      </Badge>
    );
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
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.length > 0 ? (
            invites.map((invite) => (
              <TableRow key={invite.id}>
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
                <TableCell className="text-right space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const { APP_CONFIG } = require('@/config/app');
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
                            onClick={() => handleResend(invite)}
                            disabled={resendingInvites.has(invite.id)}
                          >
                            {resendingInvites.has(invite.id) ? (
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
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
