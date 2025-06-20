import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useInvitesList } from "@/hooks/admin/invites/useInvitesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SimpleCreateInviteDialog from "./components/SimpleCreateInviteDialog";
import SimpleInvitesTab from "./components/SimpleInvitesTab";
import { EmailMonitoringDashboard } from "@/components/admin/email/EmailMonitoringDashboard";
import { SystemValidationPanel } from "@/components/admin/email/SystemValidationPanel";
import { ResendConfigValidator } from "@/components/admin/email/ResendConfigValidator";
import { EmailStatusMonitor } from "./components/EmailStatusMonitor";
import { 
  Mail, 
  Users, 
  Activity, 
  TestTube, 
  Settings, 
  Shield,
  CheckCircle,
  Zap
} from "lucide-react";

const InvitesManagement = () => {
  useDocumentTitle("Sistema de Convites e Email | Admin");
  
  const { roles, loading: rolesLoading } = usePermissions();
  const { invites, loading: invitesLoading, fetchInvites } = useInvitesList();
  const [activeTab, setActiveTab] = useState('invites');

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Sistema de Convites e Email
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie convites e monitore o sistema de email profissional
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <CheckCircle className="h-3 w-3" />
            Sistema Ativo
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            <Zap className="h-3 w-3" />
            Resend Pro
          </div>
          <SimpleCreateInviteDialog roles={roles} onInviteCreated={handleInvitesChange} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="invites" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Convites
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoramento
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Validação
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Convites</CardTitle>
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

        <TabsContent value="monitor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento em Tempo Real</CardTitle>
              <CardDescription>
                Acompanhe métricas e performance do sistema de emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailMonitoringDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <SystemValidationPanel />
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração e Testes</CardTitle>
              <CardDescription>
                Valide e teste a configuração do sistema Resend
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResendConfigValidator />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>
                Visualize o status detalhado do sistema de emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailStatusMonitor />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sistema de Informações */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <h4 className="font-medium text-green-900">🔥 Sistema Completo</h4>
              <p className="text-green-700">Diagnóstico automático e recuperação inteligente</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-blue-900">⚡ Performance</h4>
              <p className="text-blue-700">Monitoramento em tempo real com alertas</p>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-purple-900">🛡️ Robustez</h4>
              <p className="text-purple-700">Sistema de fallback e recuperação automática</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitesManagement;
