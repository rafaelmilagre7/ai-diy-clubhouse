
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useInvitesList } from "@/hooks/admin/invites/useInvitesList";
import CreateInviteDialog from "./components/CreateInviteDialog";
import InvitesTab from "./components/InvitesTab";
import { EmailStatusMonitor } from "./components/EmailStatusMonitor";
import { InviteTestFlow } from "./components/InviteTestFlow";
import { TestPlan } from "./components/TestPlan";
import { Card } from "@/components/ui/card";
import { Mail, Users, TestTube, Zap } from "lucide-react";

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
            Sistema completo de convites com fluxo otimizado para testes
          </p>
        </div>
        <CreateInviteDialog roles={roles} onInviteCreated={handleInvitesChange} />
      </div>

      {/* Monitor de Status de Emails */}
      <EmailStatusMonitor />

      {/* Fluxo de Teste Automatizado */}
      <InviteTestFlow roles={roles} onInviteCreated={handleInvitesChange} />

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="invites" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Convites ({invites.length})
            </TabsTrigger>
            <TabsTrigger value="test-flow" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Fluxo Rápido
            </TabsTrigger>
            <TabsTrigger value="test-plan" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Plano de Teste
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

          <TabsContent value="test-flow" className="mt-6">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">🚀 Fluxo Rápido de Desenvolvimento</h3>
                <p className="text-muted-foreground text-sm">
                  Use o componente acima para limpar e reconvidar usuários rapidamente
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🧹</div>
                    <h4 className="font-medium">Soft Delete</h4>
                    <p className="text-xs text-muted-foreground">
                      Limpa dados mantendo usuário no Auth
                    </p>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📧</div>
                    <h4 className="font-medium">Re-convite</h4>
                    <p className="text-xs text-muted-foreground">
                      Detecta limpeza e permite novo convite
                    </p>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-medium">Sistema Pro</h4>
                    <p className="text-xs text-muted-foreground">
                      Template profissional + alta deliverabilidade
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="test-plan" className="mt-6">
            <TestPlan />
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
