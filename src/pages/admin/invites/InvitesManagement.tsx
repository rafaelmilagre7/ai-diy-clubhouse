
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useInvitesList } from "@/hooks/admin/invites/useInvitesList";
import CreateInviteDialog from "./components/CreateInviteDialog";
import InvitesTab from "./components/InvitesTab";
import { EmailStatusMonitor } from "./components/EmailStatusMonitor";
import { Card } from "@/components/ui/card";
import { Mail, Users } from "lucide-react";

const InvitesManagement = () => {
  const { roles, loading: rolesLoading } = usePermissions();
  const { invites, loading: invitesLoading, fetchInvites } = useInvitesList();
  const [activeTab, setActiveTab] = useState("invites");

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Convites</h1>
          <p className="text-muted-foreground">
            Envie convites para novos membros e gerencie convites existentes
          </p>
        </div>
        <CreateInviteDialog roles={roles} onInviteCreated={handleInvitesChange} />
      </div>

      {/* Monitor de Status de Emails */}
      <EmailStatusMonitor />

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invites" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Convites ({invites.length})
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invites" className="mt-6">
            <InvitesTab
              invites={invites}
              loading={invitesLoading}
              onInvitesChange={handleInvitesChange}
            />
          </TabsContent>

          <TabsContent value="statistics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Convites</p>
                    <p className="text-2xl font-bold">{invites.length}</p>
                  </div>
                  <Mail className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Utilizados</p>
                    <p className="text-2xl font-bold text-green-600">
                      {invites.filter(invite => invite.used_at).length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {invites.filter(invite => !invite.used_at && new Date(invite.expires_at) > new Date()).length}
                    </p>
                  </div>
                  <Mail className="h-8 w-8 text-orange-600" />
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default InvitesManagement;
