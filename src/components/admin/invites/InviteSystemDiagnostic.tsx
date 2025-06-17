
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database, 
  Mail, 
  Shield, 
  Server,
  Clock,
  Users,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useInviteEmailDiagnostic, type DiagnosticData } from '@/hooks/admin/invites/useInviteEmailDiagnostic';

const InviteSystemDiagnostic = () => {
  const { runDiagnostic, isRunning, lastDiagnostic } = useInviteEmailDiagnostic();
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);

  const handleRunDiagnostic = async () => {
    const result = await runDiagnostic();
    setDiagnosticData(result);
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Saudável</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      case 'critical':
      case 'error':
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const currentData = diagnosticData || lastDiagnostic;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Diagnóstico do Sistema de Convites</h2>
          <p className="text-muted-foreground">
            Verifique a saúde e o funcionamento do sistema de envio de convites
          </p>
        </div>
        <Button 
          onClick={handleRunDiagnostic}
          disabled={isRunning}
          className="min-w-[140px]"
        >
          {isRunning ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
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

      {currentData && (
        <>
          {/* Última execução */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Último diagnóstico executado em {format(new Date(), 'dd/MM/yyyy \'às\' HH:mm', { locale: ptBR })}
            </AlertDescription>
          </Alert>

          {/* Status Geral do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Status Geral do Sistema
              </CardTitle>
              <CardDescription>
                Verificação dos componentes principais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(currentData.systemHealth.email)}
                    {currentData.systemHealth.status && getStatusBadge(currentData.systemHealth.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(currentData.systemHealth.database)}
                    {currentData.systemHealth.status && getStatusBadge(currentData.systemHealth.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    <span className="font-medium">Autenticação</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(currentData.systemHealth.auth)}
                    {currentData.systemHealth.status && getStatusBadge(currentData.systemHealth.status)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verificações de Infraestrutura */}
          <Card>
            <CardHeader>
              <CardTitle>Infraestrutura</CardTitle>
              <CardDescription>
                Status das funções e serviços necessários
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Edge Function Existe
                </span>
                {getStatusIcon(currentData.edgeFunctionExists)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Edge Function Respondendo
                </span>
                {getStatusIcon(currentData.edgeFunctionResponding)}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Convites Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {currentData.recentInvites?.length || 0}
                </div>
                <p className="text-muted-foreground">últimos 10 convites</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Convites Falhados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {currentData.failedInvites?.length || 0}
                </div>
                <p className="text-muted-foreground">sem tentativas de envio</p>
              </CardContent>
            </Card>
          </div>

          {/* Testes de Funcionalidade */}
          <Card>
            <CardHeader>
              <CardTitle>Testes de Funcionalidade</CardTitle>
              <CardDescription>
                Resultados dos testes automatizados do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Teste da Edge Function</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentData.testResults.edgeFunctionTest.success)}
                  {getStatusBadge(currentData.testResults.edgeFunctionTest.status)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Teste do Resend</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentData.testResults.resendTest.success)}
                  {getStatusBadge(currentData.testResults.resendTest.status)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span>Teste de Fallback</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(currentData.testResults.fallbackTest.success)}
                  {getStatusBadge(currentData.testResults.fallbackTest.status)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          {currentData.recommendations && currentData.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentData.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Lista de Convites Recentes */}
          {currentData.recentInvites && currentData.recentInvites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Convites Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentData.recentInvites.map((invite, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{invite.email}</span>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(invite.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!currentData && (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum Diagnóstico Executado</CardTitle>
            <CardDescription>
              Clique em "Executar Diagnóstico" para verificar o sistema
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default InviteSystemDiagnostic;
