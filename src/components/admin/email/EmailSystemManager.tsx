import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useResendHealthCheck } from '@/hooks/supabase/useResendHealthCheck';
import { Mail, CheckCircle, XCircle, AlertTriangle, RefreshCw, Send, ExternalLink, Settings, Info } from 'lucide-react';
import { toast } from 'sonner';
export const EmailSystemManager = () => {
  const {
    healthStatus,
    isChecking,
    performHealthCheck,
    sendTestEmail
  } = useResendHealthCheck();
  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const handleSendTestEmail = async () => {
    if (!testEmail.includes('@')) {
      toast.error('Digite um email válido');
      return;
    }
    setIsSendingTest(true);
    try {
      await sendTestEmail(testEmail);
      setTestEmail('');
    } finally {
      setIsSendingTest(false);
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
      case 'verified':
      case 'operational':
      case 'working':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'missing':
      case 'pending':
      case 'limited':
      case 'unknown':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
      case 'verified':
      case 'operational':
      case 'working':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'invalid':
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'missing':
      case 'pending':
      case 'limited':
      case 'unknown':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  return <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Status do Sistema de Email</CardTitle>
            </div>
            <Button onClick={performHealthCheck} disabled={isChecking} variant="outline" size="sm">
              {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Verificar
            </Button>
          </div>
          <CardDescription>
            Monitoramento em tempo real do sistema de envio de emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Principal */}
          <div className="flex items-center gap-2">
            {healthStatus.isHealthy ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
            <span className={`font-medium ${healthStatus.isHealthy ? 'text-green-700' : 'text-red-700'}`}>
              {healthStatus.isHealthy ? 'Sistema Operacional' : 'Sistema com Problemas'}
            </span>
            <Badge variant={healthStatus.isHealthy ? 'default' : 'destructive'}>
              {healthStatus.isHealthy ? 'OK' : 'ERRO'}
            </Badge>
          </div>

          {/* Componentes do Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(healthStatus.apiKeyStatus)}
                <span className="font-medium">API Key</span>
              </div>
              <Badge className={getStatusColor(healthStatus.apiKeyStatus)}>
                {healthStatus.apiKeyStatus === 'valid' ? 'Válida' : healthStatus.apiKeyStatus === 'invalid' ? 'Inválida' : healthStatus.apiKeyStatus === 'missing' ? 'Ausente' : 'Erro'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(healthStatus.domainStatus)}
                <span className="font-medium">Domínio</span>
              </div>
              <Badge className={getStatusColor(healthStatus.domainStatus)}>
                {healthStatus.domainStatus === 'verified' ? 'Verificado' : healthStatus.domainStatus === 'pending' ? 'Pendente' : healthStatus.domainStatus === 'failed' ? 'Falhou' : 'Desconhecido'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(healthStatus.emailCapability)}
                <span className="font-medium">Capacidade</span>
              </div>
              <Badge className={getStatusColor(healthStatus.emailCapability)}>
                {healthStatus.emailCapability === 'operational' ? 'Normal' : healthStatus.emailCapability === 'limited' ? 'Limitada' : 'Erro'}
              </Badge>
            </div>
          </div>

          {/* Edge Function Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-900">
            <div className="flex items-center gap-2">
              {getStatusIcon(healthStatus.edgeFunctionStatus)}
              <span className="font-medium">Edge Function</span>
            </div>
            <Badge className={getStatusColor(healthStatus.edgeFunctionStatus)}>
              {healthStatus.edgeFunctionStatus === 'working' ? 'Funcionando' : healthStatus.edgeFunctionStatus === 'failed' ? 'Falhou' : 'Desconhecido'}
            </Badge>
          </div>

          {/* Problemas Detectados */}
          {healthStatus.issues.length > 0 && <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <strong>Problemas detectados:</strong>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {healthStatus.issues.map((issue, index) => <li key={index}>{issue}</li>)}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>}

          {/* Recomendações */}
          {healthStatus.recommendations.length > 0 && <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <strong>Recomendações:</strong>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {healthStatus.recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>}

          {/* Última Verificação */}
          <div className="text-xs text-gray-500">
            Última verificação: {healthStatus.checkedAt.toLocaleString('pt-BR')}
          </div>
        </CardContent>
      </Card>

      {/* Teste de Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Teste de Email
          </CardTitle>
          <CardDescription>
            Envie um email de teste para verificar se o sistema está funcionando
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="test-email">Email de destino</Label>
              <Input id="test-email" type="email" placeholder="seu@email.com" value={testEmail} onChange={e => setTestEmail(e.target.value)} disabled={isSendingTest} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleSendTestEmail} disabled={!testEmail || isSendingTest || !healthStatus.isHealthy} className="whitespace-nowrap">
                {isSendingTest ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Enviar Teste
              </Button>
            </div>
          </div>
          
          {!healthStatus.isHealthy && <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                O sistema precisa estar operacional para enviar emails de teste.
                Resolva os problemas detectados primeiro.
              </AlertDescription>
            </Alert>}
        </CardContent>
      </Card>

      {/* Links Úteis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuração e Suporte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" asChild>
              <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Gerenciar API Keys
              </a>
            </Button>
            
            <Button variant="outline" asChild>
              <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Configurar Domínios
              </a>
            </Button>
            
            <Button variant="outline" asChild>
              <a href="https://resend.com/logs" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Ver Logs do Resend
              </a>
            </Button>
            
            <Button variant="outline" asChild>
              <a href="https://supabase.com/dashboard/project/_/logs/edge-functions" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Logs Edge Functions
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
};