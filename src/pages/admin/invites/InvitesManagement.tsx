
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvites } from '@/hooks/admin/useInvites';
import { useRoles } from '@/hooks/admin/useRoles';
import { useInviteResend } from '@/hooks/admin/invites/useInviteResend';
import { toast } from 'sonner';

// Componentes
import { InvitesTable } from '@/components/admin/invites/ui/InvitesTable';
import { CreateInviteDialog } from './components/CreateInviteDialog';
import ResendInviteDialog from './components/ResendInviteDialog';
import { InviteAnalyticsDashboard } from '@/components/admin/invites/analytics/InviteAnalyticsDashboard';

// Types
import type { Invite } from '@/hooks/admin/invites/types';

const InvitesManagement = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);
  const [showResendDialog, setShowResendDialog] = useState(false);

  const { 
    invites, 
    loading, 
    createInvite,
    deleteInvite,
    isCreating,
    isDeleting,
    fetchInvites
  } = useInvites();

  const { 
    resendInvite, 
    isResending, 
    isInviteResending,
    isSending 
  } = useInviteResend();

  const { roles } = useRoles();

  const handleCreateInvite = async (data: any) => {
    try {
      const result = await createInvite(data);
      if (result?.status === 'success') {
        toast.success('Convite criado e enviado com sucesso!');
        setShowCreateDialog(false);
      }
    } catch (error: any) {
      console.error('Erro ao criar convite:', error);
      toast.error(error.message || 'Erro ao criar convite');
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await deleteInvite(inviteId);
      toast.success('Convite excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir convite:', error);
      toast.error(error.message || 'Erro ao excluir convite');
    }
  };

  const handleResendClick = (invite: Invite) => {
    console.log('[INVITES-MANAGEMENT] Abrindo diálogo de reenvio para:', invite.id);
    setSelectedInvite(invite);
    setShowResendDialog(true);
  };

  const handleResendSuccess = () => {
    console.log('[INVITES-MANAGEMENT] Reenvio concluído com sucesso');
    setShowResendDialog(false);
    setSelectedInvite(null);
    // A lista será atualizada automaticamente pelo hook useInvites
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gerenciamento de Convites</h1>
            <p className="text-muted-foreground">Convide novos usuários para a plataforma</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Convites</h1>
          <p className="text-muted-foreground">
            Convide novos usuários para a plataforma - {invites.length} convites ativos
          </p>
        </div>
        
        <Button 
          onClick={() => setShowCreateDialog(true)}
          disabled={isCreating}
        >
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? 'Criando...' : 'Novo Convite'}
        </Button>
      </div>

      {/* Analytics Dashboard */}
      <InviteAnalyticsDashboard />

      {/* Invites Table */}
      <InvitesTable
        invites={invites}
        onDelete={handleDeleteInvite}
        onResend={handleResendClick}
        isDeleting={isDeleting}
        isSending={isSending}
        isInviteResending={isInviteResending}
      />

      {/* Create Invite Dialog */}
      <CreateInviteDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateInvite}
        roles={roles}
        isCreating={isCreating}
      />

      {/* Resend Invite Dialog */}
      <ResendInviteDialog
        invite={selectedInvite}
        open={showResendDialog}
        onOpenChange={setShowResendDialog}
        onSuccess={handleResendSuccess}
      />
    </div>
  );
};

export default InvitesManagement;
