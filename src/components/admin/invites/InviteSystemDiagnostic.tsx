
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertTriangle, CheckCircle, RefreshCw, Mail, Zap, Settings, Play } from 'lucide-react';
import { useInviteEmailDiagnostic } from '@/hooks/admin/invites/useInviteEmailDiagnostic';
import { toast } from 'sonner';

const InviteSystemDiagnostic = () => {
  const {
    runDiagnostic,
    isRunning,
    lastDiagnostic,
    systemStatus,
    testEmailSend,
    recentAttempts,
    isLoading
  } = useInviteEmailDiagnostic();

  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    // Executar diagnóstico inicial
    runDiagnostic();
  }, [runDiagnostic]);

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Saudável</Badge>;
      case 'warning':
        return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Digite um email para teste');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      toast.error('Digite um email válido');
      return;
    }

    await testEmailSend(testEmail);
  };

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(systemStatus)}
            Status do Sistema de Convites
            <Button
              onClick={runDiagnostic}
              disabled={isRunning}
              size="sm"
              variant="outline"
              className="ml-auto"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRunning ? 'Diagnosticando...' : 'Atualizar'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Status Geral</span>
            {getStatusBadge(systemStatus)}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Última verificação: {new Date(lastDiagnostic.timestamp).toLocaleString('pt-BR')}
          </div>
        </CardContent>
      </Card>

      {/* Componentes do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">Resend</span>
              </div>
              {getStatusIcon(lastDiagnostic.resendStatus)}
            </div>
            <div className="mt-2">
              {getStatusBadge(lastDiagnostic.resendStatus)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Edge Function</span>
              </div>
              {getStatusIcon(lastDiagnostic.edgeFunctionStatus)}
            </div>
            <div className="mt-2">
              {getStatusBadge(lastDiagnostic.edgeFunctionStatus)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">Configuração</span>
              </div>
              {getStatusIcon(lastDiagnostic.configStatus)}
            </div>
            <div className="mt-2">
              {getStatusBadge(lastDiagnostic.configStatus)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Supabase</span>
              </div>
              {getStatusIcon(lastDiagnostic.supabaseStatus)}
            </div>
            <div className="mt-2">
              {getStatusBadge(lastDiagnostic.supabaseStatus)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {lastDiagnostic.details.totalAttempts}
              </div>
              <div className="text-sm text-muted-foreground">Tentativas Recentes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {lastDiagnostic.details.successRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Taxa de Sucesso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {lastDiagnostic.details.edgeFunctionVersion}
              </div>
              <div className="text-sm text-muted-foreground">Versão Edge Function</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teste de Email */}
      <Card>
        <CardHeader>
          <CardTitle>Teste de Envio de Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Digite um email para teste"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleTestEmail}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Testar
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Envie um email de teste para verificar se o sistema está funcionando corretamente.
          </p>
        </CardContent>
      </Card>

      {/* Recomendações */}
      {lastDiagnostic.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {lastDiagnostic.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tentativas Recentes */}
      {recentAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tentativas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentAttempts.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {attempt.status === 'sent' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{attempt.email}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(attempt.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InviteSystemDiagnostic;
