
import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useInvitesList } from "@/hooks/admin/invites/useInvitesList";
import SimpleCreateInviteDialog from "./components/SimpleCreateInviteDialog";
import SimpleInvitesTab from "./components/SimpleInvitesTab";
import { WhatsAppDebugPanel } from "@/components/admin/WhatsAppDebugPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
          <SimpleCreateInviteDialog roles={roles} onInviteCreated={handleInvitesChange} />
        </div>
      </div>

      <Tabs defaultValue="invites" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invites">Lista de Convites</TabsTrigger>
          <TabsTrigger value="whatsapp-debug">Debug WhatsApp</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invites" className="mt-6">
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
        </TabsContent>
        
        <TabsContent value="whatsapp-debug" className="mt-6">
          <WhatsAppDebugPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvitesManagement;
