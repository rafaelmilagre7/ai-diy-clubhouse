
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Activity,
  Mail,
  Database,
  Shield,
  Server,
  Clock,
  AlertCircle,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { useInviteEmailDiagnostic } from '@/hooks/admin/invites/useInviteEmailDiagnostic';
import { useInviteEmailService } from '@/hooks/admin/invites/useInviteEmailService';

const InviteSystemDiagnostic = () => {
  const { 
    runDiagnostic, 
    isRunning, 
    results, 
    testInviteEmail, 
    lastDiagnostic 
  } = useInviteEmailDiagnostic();

  const { getInviteLink } = useInviteEmailService();

  useEffect(() => {
    // Executar diagnóstico inicial
    runDiagnostic();
  }, [runDiagnostic]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Saudável</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">Atenção</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const handleTestEmail = async () => {
    const testEmail = 'test@exemplo.com';
    const testToken = 'test-token-123';
    const inviteUrl = getInviteLink(testToken);
    
    await testInviteEmail(testEmail, inviteUrl, 'Teste de Diagnóstico');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-100">Diagnóstico do Sistema</h2>
          <p className="text-neutral-400 mt-1">Monitoramento da saúde do sistema de convites</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleTestEmail}
            variant="outline"
            className="border-viverblue text-viverblue hover:bg-viverblue hover:text-white"
          >
            <Mail className="h-4 w-4 mr-2" />
            Testar Email
          </Button>
          
          <Button 
            onClick={runDiagnostic}
            disabled={isRunning}
            className="bg-viverblue hover:bg-viverblue-dark text-white"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Activity className="h-4 w-4 mr-2" />
            )}
            {isRunning ? 'Executando...' : 'Executar Diagnóstico'}
          </Button>
        </div>
      </div>

      {/* Status Geral do Sistema */}
      <Card className="bg-backgroundLight border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neutral-100">
            <Activity className="h-5 w-5 text-viverblue" />
            Status Geral do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-neutral-800">
              <div className="flex items-center gap-2">
                {getStatusIcon(lastDiagnostic?.systemHealth?.status || 'unknown')}
                <span className="text-sm font-medium text-neutral-100">Saúde Geral</span>
              </div>
              {getStatusBadge(lastDiagnostic?.systemHealth?.status || 'unknown')}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-neutral-800">
              <div className="flex items-center gap-2">
                {getStatusIcon(lastDiagnostic?.edgeFunctionExists ? 'success' : 'error')}
                <span className="text-sm font-medium text-neutral-100">Edge Function</span>
              </div>
              {getStatusBadge(lastDiagnostic?.edgeFunctionExists ? 'success' : 'error')}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-neutral-800">
              <div className="flex items-center gap-2">
                {getStatusIcon(lastDiagnostic?.edgeFunctionResponding ? 'success' : 'error')}
                <span className="text-sm font-medium text-neutral-100">Resposta API</span>
              </div>
              {getStatusBadge(lastDiagnostic?.edgeFunctionResponding ? 'success' : 'error')}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-neutral-800">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-viverblue" />
                <span className="text-sm font-medium text-neutral-100">Última Execução</span>
              </div>
              <span className="text-xs text-neutral-400">
                {lastDiagnostic ? new Date(lastDiagnostic.timestamp).toLocaleTimeString() : 'Nunca'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Convites */}
      <Card className="bg-backgroundLight border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neutral-100">
            <TrendingUp className="h-5 w-5 text-viverblue" />
            Estatísticas de Convites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-neutral-300 mb-3">Convites Recentes</h4>
              <div className="space-y-2">
                {lastDiagnostic?.recentInvites?.length ? (
                  lastDiagnostic.recentInvites.map((invite: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-background rounded border border-neutral-800">
                      <span className="text-sm text-neutral-100">{invite.email}</span>
                      <Badge variant="outline" className="text-xs">
                        {invite.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-400">Nenhum convite recente</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-neutral-300 mb-3">Convites com Falha</h4>
              <div className="space-y-2">
                {lastDiagnostic?.failedInvites?.length ? (
                  lastDiagnostic.failedInvites.map((invite: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-background rounded border border-neutral-800">
                      <span className="text-sm text-neutral-100">{invite.email}</span>
                      <Badge variant="destructive" className="text-xs">
                        Falha
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-neutral-400">Nenhuma falha recente</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testes de Sistema */}
      <Card className="bg-backgroundLight border-neutral-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neutral-100">
            <Server className="h-5 w-5 text-viverblue" />
            Testes de Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-neutral-800">
              <div className="flex items-center gap-3">
                {getStatusIcon(lastDiagnostic?.testResults?.edgeFunctionTest?.success ? 'success' : 'error')}
                <div>
                  <p className="text-sm font-medium text-neutral-100">Teste Edge Function</p>
                  <p className="text-xs text-neutral-400">
                    {lastDiagnostic?.testResults?.edgeFunctionTest?.message || 'Não testado'}
                  </p>
                </div>
              </div>
              {getStatusBadge(lastDiagnostic?.testResults?.edgeFunctionTest?.success ? 'success' : 'error')}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-neutral-800">
              <div className="flex items-center gap-3">
                {getStatusIcon(lastDiagnostic?.testResults?.resendTest?.success ? 'success' : 'error')}
                <div>
                  <p className="text-sm font-medium text-neutral-100">Teste Resend API</p>
                  <p className="text-xs text-neutral-400">
                    {lastDiagnostic?.testResults?.resendTest?.message || 'Não testado'}
                  </p>
                </div>
              </div>
              {getStatusBadge(lastDiagnostic?.testResults?.resendTest?.success ? 'success' : 'error')}
            </div>
            
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-neutral-800">
              <div className="flex items-center gap-3">
                {getStatusIcon(lastDiagnostic?.testResults?.fallbackTest?.success ? 'success' : 'error')}
                <div>
                  <p className="text-sm font-medium text-neutral-100">Teste Sistema Fallback</p>
                  <p className="text-xs text-neutral-400">
                    {lastDiagnostic?.testResults?.fallbackTest?.message || 'Não testado'}
                  </p>
                </div>
              </div>
              {getStatusBadge(lastDiagnostic?.testResults?.fallbackTest?.success ? 'success' : 'error')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      {lastDiagnostic?.recommendations?.length > 0 && (
        <Card className="bg-backgroundLight border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-100">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lastDiagnostic.recommendations.map((rec: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados Detalhados */}
      {results.length > 0 && (
        <Card className="bg-backgroundLight border-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neutral-100">
              <Database className="h-5 w-5 text-viverblue" />
              Resultados Detalhados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-neutral-800">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-100">{result.test}</p>
                    <p className="text-xs text-neutral-400 mt-1">{result.message}</p>
                    {result.details && (
                      <div className="mt-2 p-2 bg-neutral-800 rounded text-xs text-neutral-300">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(result.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-neutral-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
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
