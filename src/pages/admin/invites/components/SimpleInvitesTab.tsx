
import { useState } from "react";
import { Invite } from "@/hooks/admin/invites/types";
import { useInviteDelete } from "@/hooks/admin/invites/useInviteDelete";
import { useInviteResend } from "@/hooks/admin/invites/useInviteResend";
import { LoadingState } from "@/components/common/LoadingState";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, Mail, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface SimpleInvitesTabProps {
  invites: Invite[];
  loading: boolean;
  onInvitesChange: () => void;
}

const SimpleInvitesTab = ({ invites, loading, onInvitesChange }: SimpleInvitesTabProps) => {
  const { deleteInvite, isDeleting } = useInviteDelete();
  const { resendInvite, isSending } = useInviteResend();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleDelete = async (inviteId: string) => {
    try {
      setDeletingId(inviteId);
      await deleteInvite(inviteId);
      onInvitesChange();
    } catch (error) {
      console.error('Erro ao deletar convite:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleResend = async (invite: Invite) => {
    try {
      setResendingId(invite.id);
      await resendInvite(invite);
      onInvitesChange();
    } catch (error) {
      console.error('Erro ao reenviar convite:', error);
    } finally {
      setResendingId(null);
    }
  };

  const getStatusBadge = (invite: Invite) => {
    if (invite.used_at) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Usado
        </Badge>
      );
    }
    
    if (new Date(invite.expires_at) < new Date()) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Expirado
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        Pendente
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR
      });
    } catch {
      return 'Data inválida';
    }
  };

  if (loading) {
    return <LoadingState message="Carregando convites..." />;
  }

  if (invites.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Nenhum convite encontrado</h3>
        <p className="text-muted-foreground">
          Comece criando um novo convite para adicionar membros à plataforma.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead>Expira</TableHead>
              <TableHead>Tentativas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((invite) => (
              <TableRow key={invite.id}>
                <TableCell className="font-medium">{invite.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {invite.role?.name || 'Desconhecido'}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(invite)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(invite.created_at)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(invite.expires_at)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {invite.send_attempts || 0} tentativas
                    {invite.last_sent_at && (
                      <div className="text-xs text-muted-foreground">
                        Último: {formatDate(invite.last_sent_at)}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!invite.used_at && new Date(invite.expires_at) > new Date() && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResend(invite)}
                        disabled={resendingId === invite.id || isSending}
                      >
                        {resendingId === invite.id ? (
                          <>
                            <Mail className="w-3 h-3 mr-1 animate-pulse" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Mail className="w-3 h-3 mr-1" />
                            Reenviar
                          </>
                        )}
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deletingId === invite.id || isDeleting}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir convite?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O convite para{" "}
                            <strong>{invite.email}</strong> será removido permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(invite.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Total: {invites.length} convites
      </div>
    </div>
  );
};

export default SimpleInvitesTab;
