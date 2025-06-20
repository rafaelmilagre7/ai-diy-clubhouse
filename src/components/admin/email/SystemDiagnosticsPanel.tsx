
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useEmailSystemDiagnostics } from '@/hooks/admin/email/useEmailSystemDiagnostics';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Play,
  Zap,
  Mail,
  Globe,
  Server,
  Clock,
  AlertCircle
} from 'lucide-react';

export const SystemDiagnosticsPanel: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const { 
    isRunning, 
    diagnostics, 
    runFullDiagnostics, 
    runConnectivityTest,
    runDomainTest,
    runSendTest,
    fixOrphanedInvites 
  } = useEmailSystemDiagnostics();

  const getStatusIcon = (success: boolean | null) => {
    if (success === null) return <Clock className="h-4 w-4 text-gray-400" />;
    return success ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getHealthBadge = () => {
    switch (diagnostics.overallHealth) {
      case 'healthy':
        return <Badge className="bg-green-500">✅ Sistema Saudável</Badge>;
      case 'warning':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700">⚠️ Avisos</Badge>;
      case 'critical':
        return <Badge variant="destructive">❌ Crítico</Badge>;
      default:
        return <Badge variant="secondary">❓ Desconhecido</Badge>;
    }
  };

  const handleRunFullDiagnostics = async () => {
    await runFullDiagnostics(testEmail || undefined);
  };

  const handleTestSend = async () => {
    if (!testEmail) return;
    await runSendTest(testEmail);
  };

  return (
    <div className="space-y-6">
      {/* Status Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Status Geral do Sistema
            </span>
            {getHealthBadge()}
          </CardTitle>
          <CardDescription>
            Diagnóstico completo do sistema de email em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button 
              onClick={handleRunFullDiagnostics}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? 'Executando...' : 'Executar Diagnóstico Completo'}
            </Button>
            
            <Button 
              onClick={fixOrphanedInvites}
              variant="outline"
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Corrigir Convites Órfãos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Testes Individuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Conectividade */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(diagnostics.connectivity?.success)}
              <Server className="h-4 w-4" />
              Conectividade Resend
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {diagnostics.connectivity ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {diagnostics.connectivity.message}
                </p>
                {diagnostics.connectivity.responseTime && (
                  <p className="text-xs text-gray-500">
                    Tempo: {diagnostics.connectivity.responseTime}ms
                  </p>
                )}
                {diagnostics.connectivity.error && (
                  <div className="bg-red-50 p-2 rounded text-sm text-red-700">
                    {diagnostics.connectivity.error}
                  </div>
                )}
                {diagnostics.connectivity.solution && (
                  <div className="bg-blue-50 p-2 rounded text-sm text-blue-700">
                    💡 {diagnostics.connectivity.solution}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Clique em "Executar Diagnóstico" para testar</p>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={runConnectivityTest}
              disabled={isRunning}
              className="w-full"
            >
              Testar Conectividade
            </Button>
          </CardContent>
        </Card>

        {/* Domínios */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(diagnostics.domain?.success)}
              <Globe className="h-4 w-4" />
              Validação de Domínios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {diagnostics.domain ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {diagnostics.domain.message}
                </p>
                {diagnostics.domain.details?.viverdeiaDomain && (
                  <div className="bg-green-50 p-2 rounded text-sm">
                    <p className="font-medium">viverdeia.ai</p>
                    <p className="text-green-700">
                      Status: {diagnostics.domain.details.viverdeiaDomain.status}
                    </p>
                  </div>
                )}
                {diagnostics.domain.error && (
                  <div className="bg-red-50 p-2 rounded text-sm text-red-700">
                    {diagnostics.domain.error}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Clique em "Executar Diagnóstico" para testar</p>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={runDomainTest}
              disabled={isRunning}
              className="w-full"
            >
              Verificar Domínios
            </Button>
          </CardContent>
        </Card>

        {/* Edge Functions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(diagnostics.edgeFunctions?.success)}
              <Server className="h-4 w-4" />
              Edge Functions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {diagnostics.edgeFunctions ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {diagnostics.edgeFunctions.message}
                </p>
                {diagnostics.edgeFunctions.error && (
                  <div className="bg-red-50 p-2 rounded text-sm text-red-700">
                    {diagnostics.edgeFunctions.error}
                  </div>
                )}
                {diagnostics.edgeFunctions.solution && (
                  <div className="bg-blue-50 p-2 rounded text-sm text-blue-700">
                    💡 {diagnostics.edgeFunctions.solution}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Clique em "Executar Diagnóstico" para testar</p>
            )}
          </CardContent>
        </Card>

        {/* Teste de Envio */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(diagnostics.sendTest?.success)}
              <Mail className="h-4 w-4" />
              Teste de Envio Real
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="test-email">Email para teste:</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="seu@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            
            {diagnostics.sendTest && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {diagnostics.sendTest.message}
                </p>
                {diagnostics.sendTest.details?.emailId && (
                  <div className="bg-green-50 p-2 rounded text-sm text-green-700">
                    Email ID: {diagnostics.sendTest.details.emailId}
                  </div>
                )}
                {diagnostics.sendTest.error && (
                  <div className="bg-red-50 p-2 rounded text-sm text-red-700">
                    {diagnostics.sendTest.error}
                  </div>
                )}
              </div>
            )}
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestSend}
              disabled={isRunning || !testEmail}
              className="w-full"
            >
              Enviar Email de Teste
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Instruções e Soluções */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="h-5 w-5" />
            Soluções Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">❌ Se Conectividade falhar:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Verificar se RESEND_API_KEY está configurada</li>
                <li>• Confirmar que a chave está ativa no Resend</li>
                <li>• Testar a chave diretamente no Resend</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-900 mb-2">❌ Se Domínios falharem:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Validar viverdeia.ai no painel Resend</li>
                <li>• Verificar registros DNS</li>
                <li>• Aguardar propagação (até 24h)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-900 mb-2">❌ Se Edge Functions falharem:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Verificar se foram deployadas</li>
                <li>• Confirmar permissões no Supabase</li>
                <li>• Redeployar se necessário</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-900 mb-2">❌ Se Envio falhar:</h4>
              <ul className="space-y-1 text-blue-800">
                <li>• Verificar se o email está válido</li>
                <li>• Confirmar que o domínio está verificado</li>
                <li>• Testar com email de domínio conhecido</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemDiagnosticsPanel;
