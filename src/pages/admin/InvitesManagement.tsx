
import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useInvites } from "@/hooks/admin/useInvites";
import SimpleCreateInviteDialog from "./invites/components/SimpleCreateInviteDialog";
import SimpleInvitesTab from "./invites/components/SimpleInvitesTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const InvitesManagement = () => {
  useDocumentTitle("Gerenciar Convites | Admin");
  
  const { roles, loading: rolesLoading } = usePermissions();
  const { 
    invites, 
    loading: invitesLoading, 
    fetchInvites,
    createInvite,
    deleteInvite,
    resendInvite,
    isCreating,
    isDeleting,
    isSending
  } = useInvites();

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleInvitesChange = () => {
    fetchInvites();
  };

  const handleCreateInvite = async (email: string, roleId: string, notes?: string) => {
    try {
      await createInvite(email, roleId, notes);
      handleInvitesChange();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await deleteInvite(inviteId);
      handleInvitesChange();
    } catch (error) {
      throw error;
    }
  };

  const handleResendInvite = async (invite: any) => {
    try {
      await resendInvite(invite);
      handleInvitesChange();
    } catch (error) {
      throw error;
    }
  };

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Convites</h1>
          <p className="text-muted-foreground mt-1">
            Convide novos usuários para acessar a plataforma
          </p>
        </div>
        <div className="flex gap-2">
          <SimpleCreateInviteDialog 
            roles={roles} 
            onInviteCreated={handleInvitesChange}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Convites</CardTitle>
          <CardDescription>
            Gerencie todos os convites enviados para novos usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleInvitesTab
            invites={invites}
            loading={invitesLoading}
            onInvitesChange={handleInvitesChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitesManagement;
