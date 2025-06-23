
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Trash2, ExternalLink } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ResendStatusIndicator } from '@/pages/admin/invites/components/ResendStatusIndicator';
import type { Invite } from '@/hooks/admin/invites/types';

interface InvitesTableProps {
  invites: Invite[];
  onDelete: (inviteId: string) => void;
  onResend: (invite: Invite) => void;
  isDeleting: boolean;
  isSending: boolean;
  isInviteResending: (inviteId: string) => boolean;
}

export const InvitesTable = ({ 
  invites, 
  onDelete, 
  onResend, 
  isDeleting, 
  isSending,
  isInviteResending 
}: InvitesTableProps) => {
  const getStatusBadge = (invite: Invite) => {
    if (invite.used_at) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Aceito</Badge>;
    }
    
    const isExpired = new Date(invite.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    return <Badge variant="outline" className="border-yellow-300 text-yellow-700">Pendente</Badge>;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  };

  if (invites.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum convite encontrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Tentativas</TableHead>
            <TableHead>Último Envio</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => {
            const roleName = invite.user_roles?.name || invite.role?.name || 'Cargo não definido';
            const isResending = isInviteResending(invite.id);
            
            return (
              <TableRow key={invite.id}>
                <TableCell className="font-medium">
                  {invite.email}
                  {invite.notes && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {invite.notes}
                    </div>
                  )}
                </TableCell>
                <TableCell>{roleName}</TableCell>
                <TableCell>{getStatusBadge(invite)}</TableCell>
                <TableCell>{formatDate(invite.created_at)}</TableCell>
                <TableCell>
                  <span className={`text-sm ${(invite.send_attempts || 0) > 1 ? 'text-orange-600 font-medium' : ''}`}>
                    {invite.send_attempts || 0}
                  </span>
                </TableCell>
                <TableCell>
                  {invite.last_sent_at ? (
                    <span className="text-sm text-muted-foreground">
                      {formatDate(invite.last_sent_at)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!invite.used_at && (
                      <ResendStatusIndicator
                        isResending={isResending}
                        onResend={() => onResend(invite)}
                        attempts={invite.send_attempts}
                        lastSentAt={invite.last_sent_at}
                        disabled={isResending || isSending}
                      />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/convite/${invite.token}`, '_blank')}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(invite.id)}
                      disabled={isDeleting}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
