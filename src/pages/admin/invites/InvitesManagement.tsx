
import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useInvitesList } from "@/hooks/admin/invites/useInvitesList";
import SimpleCreateInviteDialog from "./components/SimpleCreateInviteDialog";
import SimpleInvitesTab from "./components/SimpleInvitesTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const InvitesManagement = () => {
  useDocumentTitle("Gerenciar Convites | Admin");
  
  const { roles, loading: rolesLoading } = usePermissions();
  const { invites, loading: invitesLoading, fetchInvites } = useInvitesList();

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const handleInvitesChange = () => {
    fetchInvites();
  };

  // Calcular estatísticas dos convites
  const inviteStats = {
    total: invites.length,
    pending: invites.filter(i => !i.used_at && new Date(i.expires_at) > new Date()).length,
    used: invites.filter(i => i.used_at).length,
    expired: invites.filter(i => !i.used_at && new Date(i.expires_at) <= new Date()).length,
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
            Sistema simplificado - Convide novos usuários para a plataforma
          </p>
          <div className="flex gap-2 mt-3">
            <Badge variant="outline">{inviteStats.total} Total</Badge>
            <Badge variant="default">{inviteStats.pending} Pendentes</Badge>
            <Badge variant="secondary">{inviteStats.used} Utilizados</Badge>
            {inviteStats.expired > 0 && (
              <Badge variant="destructive">{inviteStats.expired} Expirados</Badge>
            )}
          </div>
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
