
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, XCircle, Play, Mail, RefreshCw, Zap, Activity } from 'lucide-react';
import { useInviteEmailDiagnostic } from '@/hooks/admin/invites/useInviteEmailDiagnostic';

export const InviteSystemDiagnostic = () => {
  const [testEmail, setTestEmail] = useState('');
  const { runDiagnostic, testInviteEmail, isRunning, lastDiagnostic } = useInviteEmailDiagnostic();

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'critical': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getHealthText = (health: string) => {
    switch (health) {
      case 'healthy': return 'Saudável ✅';
      case 'warning': return 'Atenção ⚠️';
      case 'critical': return 'Crítico 🚨';
      default: return 'Desconhecido ❓';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Diagnóstico Completo do Sistema de Convites
          </CardTitle>
          <CardDescription>
            Execute um diagnóstico completo para verificar todos os componentes do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runDiagnostic} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRunning ? 'Executando Diagnóstico...' : 'Executar Diagnóstico Completo'}
            </Button>
          </div>

          {lastDiagnostic && (
            <div className="space-y-4">
              <Alert className={getHealthColor(lastDiagnostic.systemHealth)}>
                <div className="flex items-center gap-2">
                  {getHealthIcon(lastDiagnostic.systemHealth)}
                  <AlertDescription>
                    <strong>Status do Sistema:</strong> {getHealthText(lastDiagnostic.systemHealth)}
                  </AlertDescription>
                </div>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Edge Function</span>
                      <Badge variant={lastDiagnostic.edgeFunctionExists ? 'default' : 'destructive'}>
                        {lastDiagnostic.edgeFunctionExists ? '✅ Existe' : '❌ Não Encontrada'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Respondendo</span>
                      <Badge variant={lastDiagnostic.edgeFunctionResponding ? 'default' : 'destructive'}>
                        {lastDiagnostic.edgeFunctionResponding ? '✅ OK' : '❌ Falha'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Convites Recentes</span>
                      <Badge variant="outline">
                        {lastDiagnostic.recentInvites.length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Falhas</span>
                      <Badge variant={lastDiagnostic.failedInvites.length > 0 ? 'destructive' : 'default'}>
                        {lastDiagnostic.failedInvites.length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Resultados dos Testes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Resultados dos Testes Automáticos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">Edge Function</span>
                      <Badge variant={lastDiagnostic.testResults.edgeFunctionTest ? 'default' : 'destructive'}>
                        {lastDiagnostic.testResults.edgeFunctionTest ? '✅ OK' : '❌ Falha'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">Resend API</span>
                      <Badge variant={lastDiagnostic.testResults.resendTest ? 'default' : 'secondary'}>
                        {lastDiagnostic.testResults.resendTest ? '✅ OK' : '🔄 Teste Manual'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">Sistema Fallback</span>
                      <Badge variant={lastDiagnostic.testResults.fallbackTest ? 'default' : 'secondary'}>
                        {lastDiagnostic.testResults.fallbackTest ? '✅ OK' : '🔄 Teste Manual'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recomendações */}
              {lastDiagnostic.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">🔧 Recomendações de Correção</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {lastDiagnostic.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Detalhes dos Convites Recentes */}
              {lastDiagnostic.recentInvites.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📊 Convites Recentes (últimos 7 dias)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {lastDiagnostic.recentInvites.slice(0, 5).map((invite, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{invite.email}</span>
                          <div className="flex gap-2">
                            <Badge variant={invite.used_at ? 'default' : 'secondary'}>
                              {invite.used_at ? '✅ Usado' : '⏳ Pendente'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Teste Manual de Envio
          </CardTitle>
          <CardDescription>
            Envie um e-mail de teste para verificar se o sistema está funcionando
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="seu-email@exemplo.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => testInviteEmail(testEmail)}
              disabled={!testEmail || isRunning}
            >
              Enviar Teste
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            ⚠️ Um convite de teste real será enviado para o e-mail informado
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
