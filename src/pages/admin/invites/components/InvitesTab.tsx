import { useState } from "react";
import { Invite } from "@/hooks/admin/invites/types";
import { RefreshCw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import InvitesList from "./InvitesList";
import ConfirmResendDialog from "./ConfirmResendDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { BatchSendDialog } from "./BatchSendDialog";
import { useInviteDelete } from "@/hooks/admin/invites/useInviteDelete";
import { useInviteResend } from "@/hooks/admin/invites/useInviteResend";

interface InvitesTabProps {
  invites: Invite[];
  loading: boolean;
  onInvitesChange: () => void;
}

const InvitesTab = ({ invites, loading, onInvitesChange }: InvitesTabProps) => {
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchSendDialogOpen, setBatchSendDialogOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [selectedInvites, setSelectedInvites] = useState<Invite[]>([]);
  
  const { deleteInvite, isDeleting } = useInviteDelete();
  const { resendInvite, isSending } = useInviteResend();

  // Filtrar apenas convites ativos para envio em lote
  const activeInvites = invites.filter(
    inv => !inv.used_at && new Date(inv.expires_at) >= new Date()
  );

  const handleResendClick = (invite: Invite) => {
    setSelectedInvite(invite);
    setResendDialogOpen(true);
  };

  const handleDeleteClick = (invite: Invite) => {
    setSelectedInvite(invite);
    setDeleteDialogOpen(true);
  };

  const confirmResend = async () => {
    if (selectedInvite) {
      await resendInvite(selectedInvite);
      setResendDialogOpen(false);
      onInvitesChange();
    }
  };

  const confirmDelete = async () => {
    if (selectedInvite) {
      await deleteInvite(selectedInvite.id);
      setDeleteDialogOpen(false);
      onInvitesChange();
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
      {/* Botão de envio em lote */}
      {activeInvites.length > 0 && (
        <div className="mb-4 flex justify-between items-center p-4 bg-muted/50 rounded-lg border">
          <div>
            <p className="font-medium">Envio em Lote</p>
            <p className="text-sm text-muted-foreground">
              {activeInvites.length} convite(s) ativo(s) disponível(is) para envio
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedInvites(activeInvites);
              setBatchSendDialogOpen(true);
            }}
            disabled={activeInvites.length === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar Todos ({activeInvites.length})
          </Button>
        </div>
      )}

      <InvitesList
        invites={invites}
        onResend={handleResendClick}
        onDelete={handleDeleteClick}
      />

      <ConfirmResendDialog
        invite={selectedInvite}
        onConfirm={confirmResend}
        isOpen={resendDialogOpen}
        onOpenChange={setResendDialogOpen}
        isSending={isSending}
      />

      <ConfirmDeleteDialog
        invite={selectedInvite}
        onConfirm={confirmDelete}
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isDeleting={isDeleting}
      />

      <BatchSendDialog
        isOpen={batchSendDialogOpen}
        onOpenChange={setBatchSendDialogOpen}
        selectedInvites={selectedInvites}
        onComplete={onInvitesChange}
      />
    </>
  );
};

export default InvitesTab;
