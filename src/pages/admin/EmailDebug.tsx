
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Settings, BarChart3, TestTube, FileText, CheckCircle } from 'lucide-react';
import EmailTemplateTester from './invites/components/EmailTemplateTester';
import EmailConfigPanel from './invites/components/EmailConfigPanel';

const EmailDebug = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Debug & Configuração</h1>
          <p className="text-muted-foreground">
            Configuração, testes e monitoramento da integração Resend para convites por e-mail
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Teste de Template Email */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Template de Convites por E-mail</h2>
          </div>
          <EmailTemplateTester />
        </section>

        {/* Painel de Configuração Principal */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Configuração & Testes</h2>
          </div>
          <EmailConfigPanel />
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
                <CardDescription>Template configurado no sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="font-mono text-sm bg-muted p-2 rounded">
                  <div><strong>Tipo:</strong> HTML Rich Email</div>
                  <div><strong>Status:</strong> ✅ Configurado</div>
                  <div><strong>Remetente:</strong> Viver de IA</div>
                  <div><strong>Domínio:</strong> convites@viverdeia.ai</div>
                  <div><strong>Variáveis:</strong> Nome, Link, Observações</div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Template HTML responsivo com design profissional.
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
                  <div>RESEND_API_KEY</div>
                  <div>SITE_URL (para links)</div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure a chave da API do Resend nos secrets do Supabase
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configuração do Resend</CardTitle>
                <CardDescription>Passos para configuração</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm space-y-1">
                  <div>1. Criar conta em resend.com</div>
                  <div>2. Verificar domínio viverdeia.ai</div>
                  <div>3. Gerar API Key</div>
                  <div>4. Configurar no Supabase Secrets</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Edge Functions Ativas</CardTitle>
                <CardDescription>Funções implementadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>✅ send-invite-email (v3.0)</div>
                  <div>✅ invite-orchestrator (v4.0)</div>
                  <div>✅ send-communication-email</div>
                  <div>🎯 Template System: HTML Rich ✅</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmailDebug;
