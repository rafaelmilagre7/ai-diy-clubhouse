
import { RefreshCw, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Invite } from "@/hooks/admin/invites/types";

interface SimpleInvitesListProps {
  invites: Invite[];
  onResend: (invite: Invite) => void;
  onDelete: (invite: Invite) => void;
  resendingInvites: Set<string>;
}

const SimpleInvitesList = ({ invites, onResend, onDelete, resendingInvites }: SimpleInvitesListProps) => {
  const getStatusBadge = (invite: Invite) => {
    if (invite.used_at) {
      return <Badge variant="default">Usado</Badge>;
    }
    
    if (new Date(invite.expires_at) < new Date()) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    return <Badge variant="secondary">Pendente</Badge>;
  };

  if (invites.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum convite encontrado</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Papel</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead>Expira em</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invites.map((invite) => (
          <TableRow key={invite.id}>
            <TableCell className="font-medium">{invite.email}</TableCell>
            <TableCell>{invite.role?.name || 'N/A'}</TableCell>
            <TableCell>{getStatusBadge(invite)}</TableCell>
            <TableCell>
              {new Date(invite.created_at).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell>
              {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                {!invite.used_at && new Date(invite.expires_at) > new Date() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResend(invite)}
                    disabled={resendingInvites.has(invite.id)}
                  >
                    {resendingInvites.has(invite.id) ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(invite)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SimpleInvitesList;
