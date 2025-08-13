
import { useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Invite } from "@/hooks/admin/invites/types";
import { useInviteDelete } from "@/hooks/admin/invites/useInviteDelete";
import { useInviteResend } from "@/hooks/admin/invites/useInviteResend";
import SimpleInvitesList from "./SimpleInvitesList";
import InviteStats from "./InviteStats";
import ConfirmResendDialog from "./ConfirmResendDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

interface SimpleInvitesTabProps {
  invites: Invite[];
  loading: boolean;
  onInvitesChange: () => void;
}

const SimpleInvitesTab = ({ invites, loading, onInvitesChange }: SimpleInvitesTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "used" | "expired">("all");
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [resendingInvites, setResendingInvites] = useState<Set<string>>(new Set());
  
  const { deleteInvite, isDeleting } = useInviteDelete();
  const { resendInvite, isSending } = useInviteResend();

  // Filtrar convites
  const filteredInvites = invites.filter(invite => {
    // Filtro de texto
    const matchesSearch = invite.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (invite.role?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtro de status
    let matchesStatus = true;
    if (statusFilter !== "all") {
      const isUsed = !!invite.used_at;
      const isExpired = !isUsed && new Date(invite.expires_at) <= new Date();
      const isActive = !isUsed && !isExpired;
      
      switch (statusFilter) {
        case "used":
          matchesStatus = isUsed;
          break;
        case "expired":
          matchesStatus = isExpired;
          break;
        case "active":
          matchesStatus = isActive;
          break;
      }
    }
    
    return matchesSearch && matchesStatus;
  });

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
      setResendingInvites(prev => new Set(prev).add(selectedInvite.id));
      try {
        await resendInvite(selectedInvite);
        onInvitesChange();
      } finally {
        setResendingInvites(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedInvite.id);
          return newSet;
        });
      }
      setResendDialogOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (selectedInvite) {
      const success = await deleteInvite(selectedInvite.id);
      if (success) {
        onInvitesChange();
      }
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InviteStats invites={invites} />
      
      {/* Filtros de Status */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={statusFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("all")}
        >
          Todos
        </Button>
        <Button
          variant={statusFilter === "active" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("active")}
        >
          Ativos
        </Button>
        <Button
          variant={statusFilter === "used" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("used")}
        >
          Utilizados
        </Button>
        <Button
          variant={statusFilter === "expired" ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter("expired")}
        >
          Expirados
        </Button>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email ou papel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={onInvitesChange}
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <SimpleInvitesList
        invites={filteredInvites}
        onResend={handleResendClick}
        onDelete={handleDeleteClick}
        onReactivate={onInvitesChange}
        resendingInvites={resendingInvites}
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
    </div>
  );
};

export default SimpleInvitesTab;
