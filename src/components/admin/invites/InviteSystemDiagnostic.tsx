
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, XCircle, Play, Mail } from 'lucide-react';
import { useInviteEmailDiagnostic } from '@/hooks/admin/invites/useInviteEmailDiagnostic';

export const InviteSystemDiagnostic = () => {
  const [testEmail, setTestEmail] = useState('');
  const { runDiagnostic, testInviteEmail, isRunning, lastDiagnostic } = useInviteEmailDiagnostic();

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-100 border-green-200';
      case 'warning': return 'bg-yellow-100 border-yellow-200';
      case 'critical': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Diagnóstico do Sistema de Convites
          </CardTitle>
          <CardDescription>
            Verifique o status e teste o sistema de envio de e-mails de convites
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
                <Play className="h-4 w-4" />
              )}
              Executar Diagnóstico
            </Button>
          </div>

          {lastDiagnostic && (
            <div className="space-y-4">
              <Alert className={getHealthColor(lastDiagnostic.systemHealth)}>
                <div className="flex items-center gap-2">
                  {getHealthIcon(lastDiagnostic.systemHealth)}
                  <AlertDescription>
                    <strong>Status do Sistema:</strong> {
                      lastDiagnostic.systemHealth === 'healthy' ? 'Saudável' :
                      lastDiagnostic.systemHealth === 'warning' ? 'Atenção' : 'Crítico'
                    }
                  </AlertDescription>
                </div>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Edge Function</span>
                      <Badge variant={lastDiagnostic.edgeFunctionExists ? 'default' : 'destructive'}>
                        {lastDiagnostic.edgeFunctionExists ? 'OK' : 'Erro'}
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

              {lastDiagnostic.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recomendações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {lastDiagnostic.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Teste de Envio</CardTitle>
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
            Um convite de teste será enviado para o e-mail informado
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
