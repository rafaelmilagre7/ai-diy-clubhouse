
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Send, Settings, Zap } from 'lucide-react';
import { useInviteEmailDiagnostic } from '@/hooks/admin/invites/useInviteEmailDiagnostic';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const InviteSystemDiagnostic = () => {
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const { 
    systemStatus, 
    runDiagnostic, 
    testEmailSend,
    recentAttempts,
    isLoading 
  } = useInviteEmailDiagnostic();

  const handleRunDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      await runDiagnostic();
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Diagnóstico do Sistema de Convites
          </CardTitle>
          <CardDescription>
            Monitore a saúde do sistema e identifique problemas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button 
              onClick={handleRunDiagnostic}
              disabled={isRunningDiagnostic || isLoading}
              className="flex items-center gap-2"
            >
              {isRunningDiagnostic ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {isRunningDiagnostic ? 'Executando...' : 'Executar Diagnóstico'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => testEmailSend('teste@exemplo.com')}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Testar Envio
            </Button>
          </div>

          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status">Status Geral</TabsTrigger>
              <TabsTrigger value="attempts">Tentativas Recentes</TabsTrigger>
              <TabsTrigger value="config">Configuração</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Edge Function</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(systemStatus?.edgeFunction?.status || 'unknown')}
                          <Badge className={getStatusColor(systemStatus?.edgeFunction?.status || 'unknown')}>
                            {systemStatus?.edgeFunction?.status || 'Desconhecido'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {systemStatus?.edgeFunction?.message && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {systemStatus.edgeFunction.message}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Resend API</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(systemStatus?.resendApi?.status || 'unknown')}
                          <Badge className={getStatusColor(systemStatus?.resendApi?.status || 'unknown')}>
                            {systemStatus?.resendApi?.status || 'Desconhecido'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {systemStatus?.resendApi?.message && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {systemStatus.resendApi.message}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Database</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(systemStatus?.database?.status || 'unknown')}
                          <Badge className={getStatusColor(systemStatus?.database?.status || 'unknown')}>
                            {systemStatus?.database?.status || 'Desconhecido'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {systemStatus?.database?.message && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {systemStatus.database.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {systemStatus?.overallStatus && (
                <Alert className={`border-l-4 ${
                  systemStatus.overallStatus === 'healthy' ? 'border-green-500 bg-green-50' :
                  systemStatus.overallStatus === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-red-500 bg-red-50'
                }`}>
                  <AlertDescription>
                    <strong>Status Geral: </strong>
                    {systemStatus.overallStatus === 'healthy' && 'Sistema funcionando normalmente'}
                    {systemStatus.overallStatus === 'warning' && 'Sistema com alguns problemas menores'}
                    {systemStatus.overallStatus === 'error' && 'Sistema com problemas críticos'}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="attempts" className="space-y-4">
              <div className="space-y-3">
                {recentAttempts && recentAttempts.length > 0 ? (
                  recentAttempts.map((attempt, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{attempt.email}</p>
                            <p className="text-sm text-muted-foreground">
                              Método: {attempt.method_attempted} | Status: {attempt.status}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(attempt.created_at).toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(attempt.status === 'sent' ? 'healthy' : 'error')}>
                            {attempt.status}
                          </Badge>
                        </div>
                        {attempt.error_message && (
                          <Alert className="mt-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{attempt.error_message}</AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">Nenhuma tentativa recente encontrada</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">Configurações da Edge Function</h4>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Timeout:</span>
                          <span>30 segundos</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retry automático:</span>
                          <span>3 tentativas</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fallback strategies:</span>
                          <span>Resend → Supabase Recovery → Supabase Auth</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Configurações do Frontend</h4>
                      <div className="mt-2 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Timeout da requisição:</span>
                          <span>45 segundos</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Retry em falha de rede:</span>
                          <span>2 tentativas</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteSystemDiagnostic;
