
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Database,
  Cloud,
  Settings,
  Mail,
  TestTube
} from 'lucide-react';
import { useInviteDiagnostic } from '@/hooks/admin/invites/useInviteDiagnostic';
import { toast } from 'sonner';

const InviteSystemDiagnostic: React.FC = () => {
  const { runDiagnostic, testEmailSend, isRunning, lastDiagnostic, systemStatus } = useInviteDiagnostic();
  const [testEmail, setTestEmail] = useState('');
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const handleRunDiagnostic = async () => {
    try {
      await runDiagnostic();
      toast.success('Diagnóstico executado com sucesso!');
    } catch (error) {
      toast.error('Erro ao executar diagnóstico');
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Digite um email para teste');
      return;
    }

    setIsTestingEmail(true);
    try {
      const result = await testEmailSend(testEmail);
      if (result.success) {
        toast.success('Teste de email realizado com sucesso!');
      } else {
        toast.error(`Erro no teste: ${result.error}`);
      }
    } catch (error) {
      toast.error('Erro ao testar envio de email');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Saudável</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Crítico</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Diagnóstico do Sistema de Convites
            {getStatusBadge(systemStatus)}
          </CardTitle>
          <CardDescription>
            Verificação completa da saúde do sistema de envio de convites
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleRunDiagnostic} 
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Executar Diagnóstico
                </>
              )}
            </Button>
          </div>

          {lastDiagnostic && (
            <div className="text-sm text-muted-foreground">
              Última verificação: {new Date(lastDiagnostic.timestamp).toLocaleString('pt-BR')}
            </div>
          )}

          {lastDiagnostic?.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Recomendações:</h4>
              <ul className="space-y-1">
                {lastDiagnostic.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {lastDiagnostic && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Chave Resend</span>
                {lastDiagnostic.details.resendApiKey ? (
                  <Badge className="bg-green-100 text-green-800">Configurada</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Faltando</Badge>
                )}
              </div>
              {getStatusBadge(lastDiagnostic.configStatus)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Banco de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Conexão</span>
                {lastDiagnostic.supabaseStatus === 'healthy' ? (
                  <Badge className="bg-green-100 text-green-800">OK</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Erro</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Tentativas</span>
                <span className="text-sm font-medium">{lastDiagnostic.details.totalAttempts}</span>
              </div>
              {getStatusBadge(lastDiagnostic.supabaseStatus)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Edge Function
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                {lastDiagnostic.edgeFunctionStatus === 'healthy' ? (
                  <Badge className="bg-green-100 text-green-800">OK</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Problema</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Versão</span>
                <span className="text-sm font-medium">{lastDiagnostic.details.edgeFunctionVersion}</span>
              </div>
              {getStatusBadge(lastDiagnostic.edgeFunctionStatus)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Serviço Resend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Taxa de Sucesso</span>
                <span className="text-sm font-medium">{lastDiagnostic.details.successRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                {lastDiagnostic.resendStatus === 'healthy' ? (
                  <Badge className="bg-green-100 text-green-800">OK</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">Problema</Badge>
                )}
              </div>
              {getStatusBadge(lastDiagnostic.resendStatus)}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Teste de Envio de Email
          </CardTitle>
          <CardDescription>
            Teste o sistema de envio de emails diretamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="test-email">Email para teste</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="seu@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleTestEmail} 
                disabled={isTestingEmail || !testEmail}
              >
                {isTestingEmail ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Testar Envio
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {lastDiagnostic?.recentAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tentativas Recentes</CardTitle>
            <CardDescription>
              Últimas tentativas de envio de convites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lastDiagnostic.recentAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1">
                    <div className="font-medium">{attempt.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(attempt.created_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={attempt.status === 'sent' ? 'default' : 'destructive'}>
                      {attempt.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {attempt.method_attempted}
                    </span>
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
