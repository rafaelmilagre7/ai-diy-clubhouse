
import { useState } from "react";
import { Invite } from "@/hooks/admin/invites/types";
import { RefreshCw } from "lucide-react";
import InvitesList from "./InvitesList";
import ConfirmResendDialog from "./ConfirmResendDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
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
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  
  const { deleteInvite, isDeleting } = useInviteDelete();
  const { resendInvite, isSending } = useInviteResend();

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
    </>
  );
};

export default InvitesTab;
