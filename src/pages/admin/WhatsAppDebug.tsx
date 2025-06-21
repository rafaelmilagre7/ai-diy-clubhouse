
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Settings, BarChart3, TestTube, FileText, Search } from 'lucide-react';
import WhatsAppConfigPanel from './invites/components/WhatsAppConfigPanel';
import InviteAnalyticsDashboard from './invites/components/InviteAnalyticsDashboard';
import WhatsAppTemplateTester from './invites/components/WhatsAppTemplateTester';
import WhatsAppTemplatesList from './invites/components/WhatsAppTemplatesList';

const WhatsAppDebug = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Debug & Configuração</h1>
          <p className="text-muted-foreground">
            Configuração, testes e monitoramento da integração WhatsApp Business API
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Discovery de Templates */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Discovery de Templates</h2>
          </div>
          <WhatsAppTemplatesList />
        </section>

        {/* Teste de Template WhatsApp */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Template de Convites</h2>
          </div>
          <WhatsAppTemplateTester />
        </section>

        {/* Painel de Configuração Principal */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Configuração & Testes</h2>
          </div>
          <WhatsAppConfigPanel />
        </section>

        {/* Analytics e Métricas */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Analytics de Convites</h2>
          </div>
          <InviteAnalyticsDashboard />
        </section>

        {/* Informações e Documentação */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TestTube className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Informações Técnicas</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Template Atual</CardTitle>
                <CardDescription>Template configurado no código</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="font-mono text-sm bg-muted p-2 rounded">
                  <div><strong>Nome:</strong> convitevia</div>
                  <div><strong>ID:</strong> 1413982056507354</div>
                  <div><strong>Status:</strong> ✅ Aprovado e Configurado</div>
                  <div><strong>Language:</strong> pt_BR</div>
                  <div><strong>Variáveis:</strong> Nome, Link</div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Template correto identificado via Discovery. Pronto para uso.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Variáveis de Ambiente Necessárias</CardTitle>
                <CardDescription>Configure estas variáveis no Supabase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="font-mono text-sm bg-muted p-2 rounded">
                  <div>WHATSAPP_API_TOKEN</div>
                  <div>WHATSAPP_PHONE_NUMBER_ID</div>
                  <div>WHATSAPP_BUSINESS_ID</div>
                  <div>WHATSAPP_WEBHOOK_TOKEN</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">URLs de Webhook</CardTitle>
                <CardDescription>Configure no Meta Developers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="font-mono text-sm bg-muted p-2 rounded">
                  <div>GET: /functions/v1/whatsapp-webhook</div>
                  <div>POST: /functions/v1/whatsapp-webhook</div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use o token configurado em WHATSAPP_WEBHOOK_TOKEN para verificação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Edge Functions Ativas</CardTitle>
                <CardDescription>Funções implementadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>✅ whatsapp-config-check (v5.0)</div>
                  <div>✅ whatsapp-webhook</div>
                  <div>✅ send-invite-whatsapp (v4.1 Template correto)</div>
                  <div>✅ invite-orchestrator (v4.0)</div>
                  <div>✅ whatsapp-list-templates (v1.0)</div>
                  <div>🎯 Template System: convitevia ✅</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WhatsAppDebug;
