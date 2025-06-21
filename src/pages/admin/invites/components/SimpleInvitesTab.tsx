import { useState } from "react";
import { Mail, Copy, Trash2, RefreshCw, MessageCircle } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Invite } from "@/hooks/admin/invites/types";
import { useInviteDelete } from "@/hooks/admin/invites/useInviteDelete";
import ResendInviteDialog from "./ResendInviteDialog";

interface SimpleInvitesTabProps {
  invites: Invite[];
  loading: boolean;
  onInvitesChange: () => void;
}

const SimpleInvitesTab = ({ invites, loading, onInvitesChange }: SimpleInvitesTabProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  
  const { deleteInvite, isDeleting } = useInviteDelete();

  const getStatusBadge = (invite: Invite) => {
    if (invite.used_at) {
      return <Badge variant="default" className="bg-green-600">Usado</Badge>;
    }
    
    if (new Date(invite.expires_at) < new Date()) {
      return <Badge variant="destructive">Expirado</Badge>;
    }
    
    return <Badge variant="secondary" className="bg-yellow-600">Pendente</Badge>;
  };

  const getChannelBadges = (invite: Invite) => {
    const channels = [];
    
    // Determinar canais baseado nos dados disponíveis
    // Email é sempre incluído por padrão
    channels.push(
      <Badge key="email" variant="outline" className="text-xs bg-blue-600/20 text-blue-300 border-blue-600/30">
        <Mail className="h-3 w-3 mr-1" />
        Email
      </Badge>
    );
    
    // Verificar se há evidências de configuração WhatsApp
    const hasWhatsApp = invite.whatsapp_number && invite.whatsapp_number.trim() !== '';
    
    if (hasWhatsApp) {
      channels.push(
        <Badge key="whatsapp" variant="outline" className="text-xs bg-green-600/20 text-green-300 border-green-600/30">
          <MessageCircle className="h-3 w-3 mr-1" />
          WhatsApp
        </Badge>
      );
    }
    
    return <div className="flex gap-1 flex-wrap">{channels}</div>;
  };

  const getWhatsAppInfo = (invite: Invite) => {
    if (invite.whatsapp_number) {
      return (
        <div className="text-xs text-neutral-400 mt-1">
          WhatsApp: {invite.whatsapp_number}
        </div>
      );
    }
    return null;
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/convite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const handleResend = (invite: Invite) => {
    setSelectedInvite(invite);
    setResendDialogOpen(true);
  };

  const handleDelete = (invite: Invite) => {
    setSelectedInvite(invite);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedInvite) {
      try {
        await deleteInvite(selectedInvite.id);
        setDeleteDialogOpen(false);
        onInvitesChange();
      } catch (error) {
        // Erro já tratado no hook
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email / Contato</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead>Canais</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Expira em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.length > 0 ? (
            invites.map((invite) => (
              <TableRow key={invite.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="text-white">{invite.email}</div>
                    {getWhatsAppInfo(invite)}
                  </div>
                </TableCell>
                <TableCell>{invite.role?.name || 'N/A'}</TableCell>
                <TableCell>{getChannelBadges(invite)}</TableCell>
                <TableCell>{getStatusBadge(invite)}</TableCell>
                <TableCell>
                  {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInviteLink(invite.token)}
                      title="Copiar link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    {!invite.used_at && new Date(invite.expires_at) > new Date() && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResend(invite)}
                        title="Reenviar"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(invite)}
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
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

      <ResendInviteDialog
        invite={selectedInvite}
        open={resendDialogOpen}
        onOpenChange={setResendDialogOpen}
        onSuccess={onInvitesChange}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Convite</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o convite para <strong>{selectedInvite?.email}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SimpleInvitesTab;
