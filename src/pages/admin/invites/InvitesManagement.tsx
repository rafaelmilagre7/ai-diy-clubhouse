
import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { usePermissions } from "@/hooks/auth/usePermissions";
import { useInvitesList } from "@/hooks/admin/invites/useInvitesList";
import SimpleCreateInviteDialog from "./components/SimpleCreateInviteDialog";
import SimpleInvitesTab from "./components/SimpleInvitesTab";
import InviteAnalyticsDashboard from "./components/InviteAnalyticsDashboard";
import WhatsAppConfigPanel from "./components/WhatsAppConfigPanel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Settings, MessageCircle } from "lucide-react";

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
          <h1 className="text-3xl font-bold">Sistema de Comunicação</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie convites e comunicação multicanal com usuários
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

      <Tabs defaultValue="invites" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="invites" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Convites
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invites">
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

        <TabsContent value="analytics">
          <InviteAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="whatsapp">
          <div className="space-y-6">
            <WhatsAppConfigPanel />
            
            <Card>
              <CardHeader>
                <CardTitle>Guia de Configuração WhatsApp Business API</CardTitle>
                <CardDescription>
                  Instruções detalhadas para configurar o WhatsApp Business API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <h4>Passo 1: Criar App no Facebook Developers</h4>
                  <ol>
                    <li>Acesse <code>developers.facebook.com</code></li>
                    <li>Crie um novo app do tipo "Business"</li>
                    <li>Adicione o produto "WhatsApp Business API"</li>
                  </ol>

                  <h4>Passo 2: Configurar Number ID e Business ID</h4>
                  <ol>
                    <li>No painel do WhatsApp, anote o <strong>Phone Number ID</strong></li>
                    <li>No Business Manager, anote o <strong>Business Account ID</strong></li>
                  </ol>

                  <h4>Passo 3: Gerar Access Token</h4>
                  <ol>
                    <li>No painel do app, vá em "WhatsApp" → "API Setup"</li>
                    <li>Gere um Access Token permanente</li>
                    <li>Configure as permissões necessárias</li>
                  </ol>

                  <h4>Passo 4: Configurar Variáveis no Supabase</h4>
                  <p>Configure as seguintes variáveis de ambiente:</p>
                  <ul>
                    <li><code>WHATSAPP_API_TOKEN</code> - Seu access token</li>
                    <li><code>WHATSAPP_PHONE_NUMBER_ID</code> - ID do número de telefone</li>
                    <li><code>WHATSAPP_BUSINESS_ID</code> - ID da conta business</li>
                    <li><code>WHATSAPP_WEBHOOK_TOKEN</code> - Token para webhooks</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de E-mail</CardTitle>
                <CardDescription>
                  Configurações do sistema de e-mail via Resend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Provedor</span>
                    <Badge variant="default">Resend</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Domain</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      convites@viverdeia.ai
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limites e Rate Limiting</CardTitle>
                <CardDescription>
                  Configurações de limites de envio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>E-mail por hora</span>
                    <span>100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>WhatsApp por hora</span>
                    <span>80</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Retry automático</span>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Templates de Mensagem</CardTitle>
                <CardDescription>
                  Gerencie templates de e-mail e WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Template de E-mail</span>
                    <Badge variant="default">Personalizado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Template WhatsApp</span>
                    <Badge variant="outline">Padrão</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monitoramento</CardTitle>
                <CardDescription>
                  Status do sistema de monitoramento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Logs de entrega</span>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Webhooks</span>
                    <Badge variant="outline">Configurar</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Alertas</span>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvitesManagement;
