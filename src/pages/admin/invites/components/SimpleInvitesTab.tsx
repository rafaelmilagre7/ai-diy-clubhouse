
import { useState } from "react";
import { RefreshCw, Search, Zap, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Invite } from "@/hooks/admin/invites/types";
import { useInviteDelete } from "@/hooks/admin/invites/useInviteDelete";
import { useInviteResend } from "@/hooks/admin/invites/useInviteResend";
import { useInviteBulkReactivate } from "@/hooks/admin/invites/useInviteBulkReactivate";
import { useInviteCSVExport } from "@/hooks/admin/invites/useInviteCSVExport";
import SimpleInvitesList from "./SimpleInvitesList";
import InviteStats from "./InviteStats";
import ConfirmResendDialog from "./ConfirmResendDialog";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import ConfirmBulkReactivateDialog from "./ConfirmBulkReactivateDialog";

interface SimpleInvitesTabProps {
  invites: Invite[];
  loading: boolean;
  onInvitesChange: () => void;
}

const SimpleInvitesTab = ({ invites, loading, onInvitesChange }: SimpleInvitesTabProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "used" | "expired" | "failed">("all");
  const [resendDialogOpen, setResendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkReactivateDialogOpen, setBulkReactivateDialogOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [resendingInvites, setResendingInvites] = useState<Set<string>>(new Set());
  
  const { deleteInvite, isDeleting } = useInviteDelete();
  const { resendInvite, isSending } = useInviteResend();
  const { bulkReactivateExpiredInvites, isBulkReactivating } = useInviteBulkReactivate();
  const { exportActiveInvitesCSV, getActiveInvitesCount, isExporting } = useInviteCSVExport();

  // Calcular estatísticas dos convites
  const expiredCount = invites.filter(invite => 
    !invite.used_at && new Date(invite.expires_at) <= new Date()
  ).length;

  // 🚨 NOVO: Contar convites falhados
  const failedCount = invites.filter(invite => {
    // Convites com delivery_status = 'failed' ou send_attempts > 3
    return (invite as any).delivery_status === 'failed' || 
           ((invite as any).send_attempts && (invite as any).send_attempts > 3) ||
           ((invite as any).last_error && !(invite as any).used_at);
  }).length;

  const activeInvitesCount = getActiveInvitesCount(invites);

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
      
      // 🚨 NOVO: Detectar convites falhados
      const isFailed = (invite as any).delivery_status === 'failed' || 
                      ((invite as any).send_attempts && (invite as any).send_attempts > 3) ||
                      ((invite as any).last_error && !isUsed);
      
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
        case "failed":
          matchesStatus = isFailed;
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

  const handleBulkReactivateClick = () => {
    setBulkReactivateDialogOpen(true);
  };

  const confirmBulkReactivate = async () => {
    const success = await bulkReactivateExpiredInvites(7);
    if (success) {
      onInvitesChange();
    }
    setBulkReactivateDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Loading Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aurora-glass rounded-2xl border border-aurora/20 backdrop-blur-md overflow-hidden animate-pulse">
              <div className="bg-gradient-to-r from-aurora/10 to-viverblue/5 p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-gradient-to-br from-aurora/20 to-viverblue/10 rounded-xl"></div>
                  <div className="w-12 h-8 bg-gradient-to-r from-aurora/20 to-viverblue/10 rounded-lg"></div>
                </div>
              </div>
              <div className="p-4">
                <div className="w-24 h-3 bg-gradient-to-r from-aurora/20 to-viverblue/10 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading Filters */}
        <div className="aurora-glass rounded-2xl p-6 border border-aurora/20 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-6 bg-gradient-to-b from-aurora/50 to-viverblue/30 rounded-full animate-pulse"></div>
            <div className="w-32 h-5 bg-gradient-to-r from-aurora/20 to-viverblue/10 rounded-lg"></div>
          </div>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-20 h-9 bg-gradient-to-r from-aurora/20 to-viverblue/10 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
        
        {/* Loading Search */}
        <div className="aurora-glass rounded-2xl p-6 border border-aurora/20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md h-12 bg-gradient-to-r from-aurora/20 to-viverblue/10 rounded-xl animate-pulse"></div>
            <div className="w-24 h-12 bg-gradient-to-r from-aurora/20 to-viverblue/10 rounded-xl animate-pulse"></div>
          </div>
        </div>
        
        {/* Loading List */}
        <div className="aurora-glass rounded-2xl border border-aurora/20 backdrop-blur-md overflow-hidden">
          <div className="p-8 flex flex-col items-center justify-center py-20">
            <div className="relative mb-6">
              <div className="w-16 h-16 aurora-glass rounded-full border-4 border-aurora/30 border-t-aurora animate-spin"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-aurora/20 to-viverblue/10 rounded-full aurora-pulse"></div>
            </div>
            <h3 className="text-lg font-semibold aurora-text-gradient mb-2">Carregando Convites</h3>
            <p className="text-muted-foreground text-center">
              Buscando dados atualizados da plataforma...
            </p>
            <div className="mt-4 flex items-center gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-2 h-2 bg-gradient-to-r from-aurora to-viverblue rounded-full aurora-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <InviteStats invites={invites} />
      
      {/* Enhanced Search and Filters with Aurora Style */}
      <div className="space-y-6">
        {/* Status Filter Pills */}
        <div className="aurora-glass rounded-2xl p-6 border border-aurora/20 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-6 bg-gradient-to-b from-aurora to-viverblue rounded-full"></div>
            <h3 className="font-semibold text-foreground">Filtros Rápidos</h3>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "Todos", icon: "📊" },
              { key: "active", label: "Ativos", icon: "🟢" },
              { key: "used", label: "Utilizados", icon: "✅" },
              { key: "expired", label: "Expirados", icon: "⏰" },
              { key: "failed", label: `🚨 Falhados ${failedCount > 0 ? `(${failedCount})` : ''}`, icon: "❌", count: failedCount }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key as any)}
                className={`
                  relative px-4 py-2.5 rounded-xl font-medium transition-all duration-300 backdrop-blur-sm
                  ${statusFilter === filter.key 
                    ? filter.key === 'failed' 
                      ? 'aurora-glass bg-gradient-to-r from-red-500/20 to-orange-500/10 text-red-400 border border-red-400/30 shadow-lg animate-pulse' 
                      : 'aurora-glass bg-gradient-to-r from-aurora/20 to-viverblue/10 text-aurora border border-aurora/30 shadow-lg'
                    : filter.key === 'failed' && (filter as any).count > 0
                      ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40'
                      : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-muted/20'
                  }
                `}
              >
                <span className="mr-2">{filter.icon}</span>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar and Actions */}
        <div className="aurora-glass rounded-2xl p-6 border border-aurora/20 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Search Input with Aurora Style */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                <Search className="h-5 w-5 text-aurora/70" />
              </div>
              <Input
                placeholder="Buscar por email ou papel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 aurora-glass border-aurora/30 bg-background/50 backdrop-blur-sm focus:border-aurora/50 focus:ring-aurora/20 font-medium"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-gradient-to-r from-aurora to-viverblue rounded-full aurora-pulse"></div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onInvitesChange}
                size="default"
                className="h-12 px-6 aurora-glass border-aurora/30 hover:border-aurora/50 hover:bg-aurora/10 text-aurora font-medium backdrop-blur-sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>

              <Button
                variant="outline"
                onClick={() => exportActiveInvitesCSV(invites)}
                disabled={isExporting || activeInvitesCount === 0}
                size="default"
                className="h-12 px-6 aurora-glass border-aurora/30 hover:border-aurora/50 hover:bg-aurora/10 text-aurora font-medium backdrop-blur-sm"
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Baixar CSV Ativos ({activeInvitesCount})
              </Button>
              
              {expiredCount > 0 && (
                <Button
                  variant="default"
                  onClick={handleBulkReactivateClick}
                  disabled={isBulkReactivating}
                  size="default"
                  className="h-12 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isBulkReactivating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Reativar Todos Expirados ({expiredCount})
                </Button>
              )}
            </div>
          </div>
          
          {/* Results Counter */}
          {searchQuery || statusFilter !== "all" ? (
            <div className="mt-4 pt-4 border-t border-aurora/20">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-aurora rounded-full aurora-pulse"></div>
                Exibindo <span className="font-bold text-aurora">{filteredInvites.length}</span> de <span className="font-bold">{invites.length}</span> convites
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Enhanced Invites List */}
      <div className="aurora-glass rounded-2xl border border-aurora/20 backdrop-blur-md overflow-hidden">
        <SimpleInvitesList
          invites={filteredInvites}
          onResend={handleResendClick}
          onDelete={handleDeleteClick}
          onReactivate={onInvitesChange}
          resendingInvites={resendingInvites}
        />
      </div>

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

      <ConfirmBulkReactivateDialog
        expiredCount={expiredCount}
        onConfirm={confirmBulkReactivate}
        isOpen={bulkReactivateDialogOpen}
        onOpenChange={setBulkReactivateDialogOpen}
        isBulkReactivating={isBulkReactivating}
      />
    </div>
  );
};

export default SimpleInvitesTab;
