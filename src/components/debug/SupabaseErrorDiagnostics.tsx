import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertCircle, CheckCircle, RefreshCw, Database, Mail, Shield, ChevronDown, Send, TestTube } from 'lucide-react';
import { useSupabaseHealthCheck } from '@/hooks/supabase/useSupabaseHealthCheck';
import { useResendHealthCheck } from '@/hooks/supabase/useResendHealthCheck';
export const SupabaseErrorDiagnostics: React.FC = () => {
  const {
    healthStatus: supabaseHealth,
    isChecking: isCheckingSupabase,
    performHealthCheck: checkSupabase
  } = useSupabaseHealthCheck();
  const {
    healthStatus: resendHealth,
    isChecking: isCheckingResend,
    performHealthCheck: checkResend,
    sendTestEmail,
    debugInfo: resendDebugInfo
  } = useResendHealthCheck();
  const [testEmail, setTestEmail] = useState('');
  const [showSupabaseDebug, setShowSupabaseDebug] = useState(false);
  const [showResendDebug, setShowResendDebug] = useState(false);
  const getStatusColor = (status: string | boolean) => {
    if (typeof status === 'boolean') {
      return status ? 'text-green-500' : 'text-red-500';
    }
    switch (status) {
      case 'operational':
      case 'connected':
      case 'authenticated':
        return 'text-green-500';
      case 'error':
      case 'disconnected':
      case 'unauthenticated':
        return 'text-red-500';
      case 'slow':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };
  const getStatusBadge = (status: string | boolean, trueLabel = 'OK', falseLabel = 'Erro') => {
    const isOk = typeof status === 'boolean' ? status : status === 'operational' || status === 'connected' || status === 'authenticated';
    return <Badge variant={isOk ? "default" : "destructive"} className={isOk ? "bg-green-500" : ""}>
        {isOk ? trueLabel : falseLabel}
      </Badge>;
  };
  const handleSendTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      return;
    }
    await sendTestEmail(testEmail);
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Diagnóstico Completo do Sistema</h1>
          <p className="text-muted-foreground">
            Monitoramento de saúde do Supabase e sistemas integrados
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={checkSupabase} disabled={isCheckingSupabase} variant="outline">
            {isCheckingSupabase ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Verificar Supabase
          </Button>
          <Button onClick={() => checkResend(true)} disabled={isCheckingResend} variant="outline">
            {isCheckingResend ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Verificar Email
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="supabase">Supabase</TabsTrigger>
          <TabsTrigger value="email">Sistema de Email</TabsTrigger>
          <TabsTrigger value="test">Testes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Status Geral</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {supabaseHealth.isHealthy && resendHealth.isHealthy ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                  {getStatusBadge(supabaseHealth.isHealthy && resendHealth.isHealthy, 'Operacional', 'Com Problemas')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {supabaseHealth.databaseStatus === 'operational' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                  {getStatusBadge(supabaseHealth.databaseStatus, 'Conectado', 'Erro')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sistema de Email</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {resendHealth.isHealthy ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                  {getStatusBadge(resendHealth.isHealthy, 'Operacional', 'Com Problemas')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Autenticação</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {supabaseHealth.authStatus === 'authenticated' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-orange-500" />}
                  {getStatusBadge(supabaseHealth.authStatus, 'Autenticado', 'Não Auth')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo de Problemas */}
          {(supabaseHealth.issues.length > 0 || resendHealth.issues.length > 0) && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Problemas Detectados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {supabaseHealth.issues.map((issue, index) => <div key={`supabase-${index}`} className="p-3 rounded-md bg-red-50 border border-red-200">
                    <p className="text-sm text-red-800"><strong>[Supabase]</strong> {issue}</p>
                  </div>)}
                {resendHealth.issues.map((issue, index) => <div key={`resend-${index}`} className="p-3 rounded-md bg-orange-50 border border-orange-200">
                    <p className="text-sm text-orange-800"><strong>[Email]</strong> {issue}</p>
                  </div>)}
              </CardContent>
            </Card>}
        </TabsContent>

        <TabsContent value="supabase" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Status do Supabase
                  </CardTitle>
                  <CardDescription>Verificação detalhada do banco de dados e serviços</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {isCheckingSupabase ? <RefreshCw className="h-4 w-4 animate-spin text-blue-500" /> : supabaseHealth.isHealthy ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                  {getStatusBadge(supabaseHealth.isHealthy, 'Sistema OK', 'Com Problemas')}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Database className={`h-5 w-5 ${getStatusColor(supabaseHealth.connectionStatus)}`} />
                  <div>
                    <div className="font-medium">Conexão</div>
                    {getStatusBadge(supabaseHealth.connectionStatus, 'Conectado', 'Erro')}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Shield className={`h-5 w-5 ${getStatusColor(supabaseHealth.authStatus)}`} />
                  <div>
                    <div className="font-medium">Autenticação</div>
                    {getStatusBadge(supabaseHealth.authStatus, 'OK', 'Erro')}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Database className={`h-5 w-5 ${getStatusColor(supabaseHealth.databaseStatus)}`} />
                  <div>
                    <div className="font-medium">Banco</div>
                    {getStatusBadge(supabaseHealth.databaseStatus, 'OK', 'Erro')}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Database className={`h-5 w-5 ${getStatusColor(supabaseHealth.storageStatus)}`} />
                  <div>
                    <div className="font-medium">Storage</div>
                    {getStatusBadge(supabaseHealth.storageStatus, 'OK', 'Erro')}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={checkSupabase} disabled={isCheckingSupabase} variant="outline">
                  {isCheckingSupabase ? <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Verificando...
                    </> : 'Verificar Status'}
                </Button>

                <Button onClick={() => setShowSupabaseDebug(!showSupabaseDebug)} variant="ghost" size="sm">
                  <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${showSupabaseDebug ? 'rotate-180' : ''}`} />
                  Debug Info
                </Button>
              </div>

              {/* Debug Info Supabase */}
              <Collapsible open={showSupabaseDebug} onOpenChange={setShowSupabaseDebug}>
                <CollapsibleContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-gray-50 border">
                    <h4 className="font-medium mb-3">Informações de Debug - Supabase:</h4>
                    <div className="space-y-2 text-sm font-mono">
                      <div><strong>Última Verificação:</strong> {supabaseHealth.checkedAt.toLocaleString('pt-BR')}</div>
                      <div><strong>Status da Conexão:</strong> {supabaseHealth.connectionStatus}</div>
                      <div><strong>Status de Auth:</strong> {supabaseHealth.authStatus}</div>
                      <div><strong>Status do DB:</strong> {supabaseHealth.databaseStatus}</div>
                      <div><strong>Problemas:</strong> {supabaseHealth.issues.length}</div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Erros Supabase */}
              {supabaseHealth.issues.length > 0 && <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Problemas do Supabase:</h4>
                  {supabaseHealth.issues.map((issue, index) => <div key={index} className="p-3 rounded-md bg-red-50 border border-red-200">
                      <p className="text-sm text-red-800">{issue}</p>
                    </div>)}
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Sistema de Email (Resend)
                  </CardTitle>
                  <CardDescription>Diagnóstico completo do sistema de envio de emails</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {isCheckingResend ? <RefreshCw className="h-4 w-4 animate-spin text-blue-500" /> : resendHealth.isHealthy ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                  {getStatusBadge(resendHealth.isHealthy, 'Sistema OK', 'Com Problemas')}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Mail className={`h-5 w-5 ${getStatusColor(resendHealth.apiKeyValid)}`} />
                  <div>
                    <div className="font-medium">API Key</div>
                    {getStatusBadge(resendHealth.apiKeyValid, 'Válida', 'Inválida')}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Database className={`h-5 w-5 ${getStatusColor(resendHealth.connectivity)}`} />
                  <div>
                    <div className="font-medium">Conectividade</div>
                    {getStatusBadge(resendHealth.connectivity === 'connected', 'Conectado', 'Erro')}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Shield className={`h-5 w-5 ${getStatusColor(resendHealth.domainValid)}`} />
                  <div>
                    <div className="font-medium">Domínio</div>
                    {getStatusBadge(resendHealth.domainValid, 'Verificado', 'Pendente')}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Latência</div>
                    <Badge variant="outline">
                      {resendHealth.responseTime ? `${resendHealth.responseTime}ms` : '--'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Button onClick={() => checkResend(true)} disabled={isCheckingResend} variant="outline">
                  {isCheckingResend ? <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Verificando...
                    </> : 'Forçar Verificação'}
                </Button>

                <Button onClick={() => setShowResendDebug(!showResendDebug)} variant="ghost" size="sm">
                  <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${showResendDebug ? 'rotate-180' : ''}`} />
                  Debug Info
                </Button>
              </div>

              {/* Erros Email */}
              {resendHealth.issues.length > 0 && <div className="space-y-2">
                  <h4 className="font-medium text-red-600">Problemas do Sistema de Email:</h4>
                  {resendHealth.issues.map((issue, index) => <div key={index} className="p-3 rounded-md bg-red-50 border border-red-200">
                      <p className="text-sm text-red-800">{issue}</p>
                    </div>)}
                </div>}

              {/* Debug Info Resend */}
              <Collapsible open={showResendDebug} onOpenChange={setShowResendDebug}>
                <CollapsibleContent className="space-y-4">
                  {resendDebugInfo && <div className="p-4 rounded-lg border bg-gray-800">
                      <h4 className="font-medium mb-3">Informações de Debug - Resend:</h4>
                      <div className="space-y-2 text-sm font-mono">
                        <div><strong>Timestamp:</strong> {resendDebugInfo.timestamp}</div>
                        <div><strong>Tentativas:</strong> {resendDebugInfo.attempts}</div>
                        <div><strong>Método:</strong> {resendDebugInfo.method}</div>
                        <div><strong>Status Response:</strong> {resendDebugInfo.responseStatus || 'N/A'}</div>
                        {resendDebugInfo.errorDetails && <div><strong>Detalhes do Erro:</strong> {resendDebugInfo.errorDetails}</div>}
                        {resendDebugInfo.headers && <div>
                            <strong>Headers:</strong>
                            <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto">
                              {JSON.stringify(resendDebugInfo.headers, null, 2)}
                            </pre>
                          </div>}
                      </div>
                    </div>}
                </CollapsibleContent>
              </Collapsible>

              {/* Timestamp */}
              {resendHealth.lastChecked && <p className="text-xs text-muted-foreground">
                  Última verificação: {resendHealth.lastChecked.toLocaleString('pt-BR')}
                </p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Testes do Sistema
              </CardTitle>
              <CardDescription>
                Execute testes específicos para verificar a funcionalidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Teste de Envio de Email</label>
                  <div className="flex gap-2 mt-2">
                    <Input type="email" placeholder="Digite um email para teste" value={testEmail} onChange={e => setTestEmail(e.target.value)} className="flex-1" />
                    <Button onClick={handleSendTestEmail} disabled={isCheckingResend || !testEmail}>
                      {isCheckingResend ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Enviar Teste
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Este teste enviará um email real para o endereço informado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};